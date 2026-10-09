/**
 * Deployment signal detection + readiness scoring + findings.
 */

import type {
  AnalysisFinding,
  AnalysisRecommendation,
  AnalysisStatusLevel,
  DeploymentSignals,
  FrameworkDetection,
  PackageAnalysis,
  ReadinessBreakdown,
} from "./types"

function pathEnds(paths: string[], name: string): boolean {
  const n = name.toLowerCase()
  return paths.some((p) => {
    const base = p.split("/").pop()?.toLowerCase() ?? ""
    return base === n || p.toLowerCase().endsWith(`/${n}`)
  })
}

function pathIncludes(paths: string[], fragment: string): boolean {
  const f = fragment.toLowerCase()
  return paths.some((p) => p.toLowerCase().includes(f))
}

export function detectDeploymentSignals(
  paths: string[],
  fileTexts: Record<string, string | null>,
): DeploymentSignals {
  const workflows = paths.filter((p) =>
    /^\.github\/workflows\/.+\.ya?ml$/i.test(p),
  )
  const readmePath = paths.find((p) => /(^|\/)readme(\.(md|rst|txt))?$/i.test(p))
  const readme = readmePath
    ? (fileTexts[readmePath] ??
        fileTexts["README.md"] ??
        fileTexts["readme.md"] ??
        "")
    : (fileTexts["README.md"] ?? "")

  const codeBlob = Object.values(fileTexts)
    .filter(Boolean)
    .join("\n")
    .slice(0, 200_000)

  const hasHealthEndpoint =
    /\/api\/health|\/healthz|\/health\b|healthcheck|HealthCheck/i.test(codeBlob) ||
    pathIncludes(paths, "health")

  return {
    hasDockerfile: pathEnds(paths, "Dockerfile") || pathEnds(paths, "dockerfile"),
    hasDockerCompose:
      pathEnds(paths, "docker-compose.yml") ||
      pathEnds(paths, "docker-compose.yaml") ||
      pathEnds(paths, "compose.yml"),
    hasGithubActions: workflows.length > 0,
    githubWorkflowCount: workflows.length,
    hasVercelConfig: pathEnds(paths, "vercel.json"),
    hasNetlifyConfig: pathEnds(paths, "netlify.toml"),
    hasNginxConfig: pathEnds(paths, "nginx.conf") || pathIncludes(paths, "nginx"),
    hasEnvExample:
      pathEnds(paths, ".env.example") ||
      pathEnds(paths, ".env.sample") ||
      pathEnds(paths, ".env.template"),
    hasHealthEndpoint,
    hasReadme: Boolean(readmePath) || Boolean(readme),
    readmeMentionsDeploy: /deploy|docker|vercel|production|ci\/?cd/i.test(readme),
    hasKubernetes:
      pathIncludes(paths, "k8s/") ||
      pathEnds(paths, "deployment.yaml") ||
      pathIncludes(paths, "helm/"),
    hasTerraform: pathEnds(paths, ".tf") || pathIncludes(paths, "terraform"),
    hasAwsConfig:
      pathIncludes(paths, "serverless.yml") ||
      pathIncludes(paths, "template.yaml") ||
      pathIncludes(paths, "cloudformation"),
    hasAzureConfig: pathEnds(paths, "azure-pipelines.yml") || pathIncludes(paths, ".azure"),
  }
}

function levelFromScore(score: number): AnalysisStatusLevel {
  if (score >= 85) return "excellent"
  if (score >= 65) return "good"
  if (score >= 40) return "fair"
  return "missing"
}

export function buildReadiness(
  deployment: DeploymentSignals,
  pkg: PackageAnalysis,
  framework: FrameworkDetection | null,
): ReadinessBreakdown {
  let overall = 28
  if (framework) overall += 12
  if (pkg.hasPackageJson || pkg.packageManager !== "unknown") overall += 6
  if (pkg.hasTypeScript) overall += 4
  if (deployment.hasDockerfile) overall += 14
  if (deployment.hasDockerCompose) overall += 4
  if (deployment.hasGithubActions) overall += 14
  if (deployment.hasVercelConfig || deployment.hasNetlifyConfig) overall += 8
  if (deployment.hasEnvExample) overall += 8
  if (deployment.hasHealthEndpoint) overall += 8
  if (deployment.hasReadme && deployment.readmeMentionsDeploy) overall += 6
  else if (deployment.hasReadme) overall += 3
  if (pkg.hasEslint) overall += 2
  overall = Math.max(0, Math.min(100, overall))

  const dockerScore = deployment.hasDockerfile
    ? deployment.hasDockerCompose
      ? 95
      : 80
    : 20
  const cicdScore = deployment.hasGithubActions
    ? Math.min(95, 70 + deployment.githubWorkflowCount * 8)
    : deployment.hasVercelConfig || deployment.hasNetlifyConfig
      ? 55
      : 18
  const envScore = deployment.hasEnvExample ? 78 : 28
  const healthScore = deployment.hasHealthEndpoint ? 88 : 32
  const securityScore =
    (pkg.hasEslint ? 20 : 0) +
    (deployment.hasEnvExample ? 25 : 0) +
    (deployment.hasGithubActions ? 25 : 10) +
    (pkg.hasTypeScript ? 15 : 5) +
    15

  return {
    overall,
    health: levelFromScore(healthScore),
    cicd: levelFromScore(cicdScore),
    docker: levelFromScore(dockerScore),
    environment: levelFromScore(envScore),
    security: levelFromScore(Math.min(100, securityScore)),
  }
}

export function buildFindingsAndRecommendations(input: {
  deployment: DeploymentSignals
  pkg: PackageAnalysis
  framework: FrameworkDetection | null
  visibility: "public" | "private"
}): { findings: AnalysisFinding[]; recommendations: AnalysisRecommendation[] } {
  const { deployment, pkg, framework, visibility } = input
  const findings: AnalysisFinding[] = []
  const recommendations: AnalysisRecommendation[] = []

  const addF = (f: AnalysisFinding) => findings.push(f)
  const addR = (r: AnalysisRecommendation) => recommendations.push(r)

  if (framework) {
    addF({
      id: "fw-detected",
      severity: "success",
      title: `${framework.name}${framework.version ? ` ${framework.version}` : ""} detected`,
      detail: framework.evidence.join(", "),
      category: "framework",
    })
  } else {
    addF({
      id: "fw-unknown",
      severity: "warning",
      title: "Framework not confidently detected",
      category: "framework",
    })
  }

  if (pkg.hasTailwind) {
    addF({
      id: "tailwind",
      severity: "success",
      title: "Tailwind CSS configured",
      category: "dependencies",
    })
  }
  if (pkg.hasTypeScript) {
    addF({
      id: "typescript",
      severity: "success",
      title: "TypeScript configured",
      category: "dependencies",
    })
  }

  if (deployment.hasDockerfile) {
    addF({
      id: "docker",
      severity: "success",
      title: "Dockerfile detected",
      category: "docker",
    })
  } else {
    addF({
      id: "docker-missing",
      severity: "warning",
      title: "No Dockerfile found",
      category: "docker",
    })
    addR({
      id: "rec-docker",
      title: "Add a multi-stage Dockerfile",
      detail:
        "Use a multi-stage build to keep production images small and reproducible across environments.",
      priority: "high",
      category: "docker",
    })
  }

  if (deployment.hasGithubActions) {
    addF({
      id: "gha",
      severity: "success",
      title: `GitHub Actions configured (${deployment.githubWorkflowCount} workflow${deployment.githubWorkflowCount === 1 ? "" : "s"})`,
      category: "cicd",
    })
  } else {
    addF({
      id: "gha-missing",
      severity: "warning",
      title: "No GitHub Actions workflows",
      category: "cicd",
    })
    addR({
      id: "rec-gha",
      title: "Add a CI workflow",
      detail:
        "Create `.github/workflows/ci.yml` to run install, lint, test, and build on every pull request.",
      priority: "high",
      category: "cicd",
    })
  }

  if (deployment.hasEnvExample) {
    addF({
      id: "env",
      severity: "success",
      title: "Environment example file present",
      category: "environment",
    })
  } else {
    addF({
      id: "env-missing",
      severity: "warning",
      title: "Missing production environment variables template",
      category: "environment",
    })
    addR({
      id: "rec-env",
      title: "Add production environment validation",
      detail:
        "Commit a `.env.example` and validate required vars at boot so misconfigured deploys fail fast.",
      priority: "high",
      category: "environment",
    })
  }

  if (deployment.hasHealthEndpoint) {
    addF({
      id: "health",
      severity: "success",
      title: "Health endpoint signals found",
      category: "health",
    })
  } else {
    addF({
      id: "health-missing",
      severity: "warning",
      title: "No health endpoint detected",
      category: "health",
    })
    addR({
      id: "rec-health",
      title: "Create a health endpoint",
      detail:
        "Expose `/api/health` (or `/healthz`) returning 200 when the app and critical deps are ready.",
      priority: "medium",
      category: "health",
    })
  }

  if (!deployment.hasReadme || !deployment.readmeMentionsDeploy) {
    addF({
      id: "docs-deploy",
      severity: "warning",
      title: "Missing deployment documentation",
      category: "docs",
    })
    addR({
      id: "rec-docs",
      title: "Document the deploy path",
      detail:
        "Add a short README section covering build command, env vars, and how to ship to production.",
      priority: "medium",
      category: "docs",
    })
  }

  addF({
    id: "rollback",
    severity: "warning",
    title: "No rollback strategy detected",
    detail: "Rapid24 could not infer automated rollback from repository files.",
    category: "general",
  })
  addR({
    id: "rec-rollback",
    title: "Define a rollback strategy",
    detail:
      "Keep previous container images or platform deployments and document a one-command rollback.",
    priority: "medium",
    category: "general",
  })

  if (visibility === "public" && !deployment.hasEnvExample) {
    addR({
      id: "rec-secrets",
      title: "Audit secrets exposure",
      detail:
        "Public repos should never commit secrets. Use a secrets manager and keep `.env` gitignored.",
      priority: "high",
      category: "security",
    })
  }

  if (pkg.nodeVersion) {
    const major = Number.parseInt(pkg.nodeVersion.replace(/[^\d].*$/, ""), 10)
    if (!Number.isNaN(major) && major < 18) {
      addR({
        id: "rec-node",
        title: "Upgrade Node version",
        detail: `engines.node is set to ${pkg.nodeVersion}. Prefer Node 20+ for modern frameworks and security patches.`,
        priority: "medium",
        category: "dependencies",
      })
    }
  }

  if (framework?.id === "nextjs") {
    addR({
      id: "rec-images",
      title: "Enable image optimization",
      detail:
        "Use `next/image` and configure remote patterns so production assets stay optimized.",
      priority: "low",
      category: "framework",
    })
    addR({
      id: "rec-compress",
      title: "Enable compression",
      detail:
        "Ensure gzip/brotli at the edge (Vercel/CDN) or reverse proxy for HTML and JSON responses.",
      priority: "low",
      category: "general",
    })
  }

  addR({
    id: "rec-cache",
    title: "Improve cache strategy",
    detail:
      "Cache dependency installs in CI and set long-lived cache headers for hashed static assets.",
    priority: "low",
    category: "cicd",
  })

  return { findings, recommendations }
}

export function buildDeterministicExplanation(input: {
  readiness: ReadinessBreakdown
  findings: AnalysisFinding[]
  recommendations: AnalysisRecommendation[]
  framework: FrameworkDetection | null
  fullName: string
}): string {
  const { readiness, findings, recommendations, framework, fullName } = input
  const successes = findings.filter((f) => f.severity === "success")
  const warnings = findings.filter(
    (f) => f.severity === "warning" || f.severity === "critical",
  )

  const lines = [
    `## Why is Deployment Score ${readiness.overall}%?`,
    "",
    `Rapid24 inspected **${fullName}**${framework ? ` (${framework.name})` : ""} and scored deployment readiness across Docker, CI/CD, environment, health, and security signals.`,
    "",
    "### Score breakdown",
    "",
    `| Area | Status |`,
    `| --- | --- |`,
    `| Health | ${readiness.health} |`,
    `| CI/CD | ${readiness.cicd} |`,
    `| Docker | ${readiness.docker} |`,
    `| Environment | ${readiness.environment} |`,
    `| Security | ${readiness.security} |`,
    "",
    "### Findings",
    "",
  ]

  for (const f of successes) {
    lines.push(`- ✓ **${f.title}**${f.detail ? ` — ${f.detail}` : ""}`)
  }
  for (const f of warnings) {
    lines.push(`- ⚠ **${f.title}**${f.detail ? ` — ${f.detail}` : ""}`)
  }

  lines.push("", "### Recommendations", "")
  for (const r of recommendations.slice(0, 8)) {
    lines.push(`- **${r.title}** (${r.priority}): ${r.detail}`)
  }

  lines.push(
    "",
    "_This report is generated from repository structure. Future Rapid24 releases will deepen Dockerfile, Actions, Kubernetes, and cloud-provider analysis without changing this contract._",
  )

  return lines.join("\n")
}
