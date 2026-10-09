/**
 * Repository Analysis Engine orchestrator.
 * Fetches GitHub structure → detects stack → scores readiness → optional AI enrich.
 */

import {
  fetchLatestCommit,
  fetchRepositoryFileText,
  fetchRepositoryMeta,
  fetchRepositoryTreePaths,
} from "@/lib/github/client"
import {
  analyzePackageJson,
  detectNonJsFrameworks,
  pickPrimaryFramework,
} from "./detect"
import { enrichExplanationWithAi } from "./enrich-ai"
import {
  buildDeterministicExplanation,
  buildFindingsAndRecommendations,
  buildReadiness,
  detectDeploymentSignals,
} from "./score"
import type { RepositoryAnalysis } from "./types"

const INTERESTING_FILES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "composer.json",
  "pom.xml",
  "Gemfile",
  "README.md",
  "readme.md",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "vercel.json",
  "netlify.toml",
  ".env.example",
  ".env.sample",
] as const

/** Skip generated / dependency trees — they blow up recursive GitHub tree calls */
const IGNORED_PATH =
  /(^|\/)(node_modules|\.next|dist|build|coverage|\.turbo|\.git|vendor|target|__pycache__|\.venv)(\/|$)/i

function filterAnalysisPaths(paths: string[]): string[] {
  return paths.filter((p) => !IGNORED_PATH.test(p))
}

function resolveInterestingPaths(paths: string[]): string[] {
  const wanted = new Set<string>()
  for (const name of INTERESTING_FILES) {
    const hit = paths.find(
      (p) =>
        p === name ||
        p.toLowerCase() === name.toLowerCase() ||
        p.toLowerCase().endsWith(`/${name.toLowerCase()}`),
    )
    if (hit) wanted.add(hit)
  }

  // Only scan app/src/pages for health heuristics — avoid .next / noise
  const healthCandidates = paths
    .filter(
      (p) =>
        /^(app|src|pages|api)\//i.test(p) &&
        /(health|healthz|route\.(ts|js|tsx|jsx)$)/i.test(p),
    )
    .slice(0, 6)
  for (const p of healthCandidates) wanted.add(p)

  return [...wanted].slice(0, 14)
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next
      next += 1
      results[i] = await fn(items[i]!)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  )
  return results
}

export interface RunAnalysisInput {
  accessToken: string
  owner: string
  repo: string
  /** Prefer known branch / commit from the dashboard selection */
  branch?: string
  commitSha?: string | null
  commitMessage?: string | null
  enrichWithAi?: boolean
}

/**
 * Full server-side analysis pipeline for one repository.
 */
export async function runRepositoryAnalysis(
  input: RunAnalysisInput,
): Promise<RepositoryAnalysis> {
  const { accessToken, owner, repo } = input
  const meta = await fetchRepositoryMeta(accessToken, owner, repo)
  const branch = input.branch ?? meta.defaultBranch

  const [rawPaths, commit] = await Promise.all([
    fetchRepositoryTreePaths(accessToken, owner, repo, branch).catch(() => [] as string[]),
    input.commitSha
      ? Promise.resolve({
          sha: input.commitSha,
          message: input.commitMessage ?? "",
          date: null as string | null,
        })
      : fetchLatestCommit(accessToken, owner, repo, branch).catch(() => ({
          sha: "",
          message: "",
          date: null as string | null,
        })),
  ])

  const paths = filterAnalysisPaths(rawPaths)
  const filePaths = resolveInterestingPaths(paths)
  const fileTexts: Record<string, string | null> = {}

  await mapPool(filePaths, 4, async (path) => {
    try {
      const text = await fetchRepositoryFileText(
        accessToken,
        owner,
        repo,
        path,
        branch,
      )
      fileTexts[path] = text
      const base = path.split("/").pop()
      if (base && fileTexts[base] == null) fileTexts[base] = text
    } catch {
      fileTexts[path] = null
    }
  })

  const packageJsonPath = filePaths.find((p) => /(^|\/)package\.json$/i.test(p))
  const packageJson =
    (packageJsonPath ? fileTexts[packageJsonPath] : null) ??
    fileTexts["package.json"] ??
    null

  const { package: pkg, frameworks: jsFrameworks } = analyzePackageJson(
    packageJson,
    paths,
  )
  const otherFrameworks = detectNonJsFrameworks(paths, fileTexts)
  const frameworks = [...jsFrameworks, ...otherFrameworks]
  const framework = pickPrimaryFramework(frameworks)
  const deployment = detectDeploymentSignals(paths, fileTexts)
  const readiness = buildReadiness(deployment, pkg, framework)
  const visibility = meta.private ? "private" : "public"
  const { findings, recommendations } = buildFindingsAndRecommendations({
    deployment,
    pkg,
    framework,
    visibility,
  })

  const readmeKey =
    Object.keys(fileTexts).find((k) => /readme\.md$/i.test(k)) ?? "README.md"
  const readmePreview = fileTexts[readmeKey]?.slice(0, 1200) ?? null

  let analysis: RepositoryAnalysis = {
    analyzedAt: new Date().toISOString(),
    owner: meta.owner,
    name: meta.name,
    fullName: meta.fullName,
    defaultBranch: branch,
    visibility,
    language: meta.language,
    sizeKb: meta.sizeKb,
    latestCommitSha: commit.sha || null,
    latestCommitMessage: commit.message || null,
    framework,
    frameworks,
    package: pkg,
    deployment,
    readiness,
    findings,
    recommendations,
    explanationMarkdown: "",
    readmePreview,
    hasPackageJson: pkg.hasPackageJson,
    hasDockerfile: deployment.hasDockerfile,
    hasGithubActions: deployment.hasGithubActions,
    primaryFramework: framework?.name ?? null,
    extensions: {
      dockerfile: deployment.hasDockerfile ? { detected: true } : undefined,
      githubActions: deployment.hasGithubActions
        ? { workflowCount: deployment.githubWorkflowCount }
        : undefined,
      kubernetes: deployment.hasKubernetes ? { detected: true } : undefined,
      terraform: deployment.hasTerraform ? { detected: true } : undefined,
      aws: deployment.hasAwsConfig ? { detected: true } : undefined,
      azure: deployment.hasAzureConfig ? { detected: true } : undefined,
      vercel: deployment.hasVercelConfig ? { detected: true } : undefined,
    },
  }

  analysis.explanationMarkdown = buildDeterministicExplanation({
    readiness,
    findings,
    recommendations,
    framework,
    fullName: analysis.fullName,
  })

  if (input.enrichWithAi) {
    analysis = {
      ...analysis,
      explanationMarkdown: await enrichExplanationWithAi(analysis),
    }
  }

  return analysis
}
