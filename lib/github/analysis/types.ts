/**
 * Repository Analysis Engine — domain types.
 * Extensible for Dockerfiles, Actions, K8s, Terraform, cloud providers later.
 */

export type AnalysisFindingSeverity = "info" | "success" | "warning" | "critical"

export type AnalysisStatusLevel =
  | "excellent"
  | "good"
  | "fair"
  | "missing"
  | "unknown"

export interface AnalysisFinding {
  id: string
  severity: AnalysisFindingSeverity
  title: string
  detail?: string
  category:
    | "framework"
    | "docker"
    | "cicd"
    | "environment"
    | "health"
    | "security"
    | "docs"
    | "dependencies"
    | "general"
}

export interface AnalysisRecommendation {
  id: string
  title: string
  detail: string
  priority: "high" | "medium" | "low"
  category: AnalysisFinding["category"]
}

export interface DeploymentSignals {
  hasDockerfile: boolean
  hasDockerCompose: boolean
  hasGithubActions: boolean
  githubWorkflowCount: number
  hasVercelConfig: boolean
  hasNetlifyConfig: boolean
  hasNginxConfig: boolean
  hasEnvExample: boolean
  hasHealthEndpoint: boolean
  hasReadme: boolean
  readmeMentionsDeploy: boolean
  /** Reserved for future platform detectors */
  hasKubernetes?: boolean
  hasTerraform?: boolean
  hasAwsConfig?: boolean
  hasAzureConfig?: boolean
}

export interface PackageAnalysis {
  packageManager: "npm" | "yarn" | "pnpm" | "bun" | "pip" | "composer" | "maven" | "bundler" | "dotnet" | "unknown"
  hasPackageJson: boolean
  hasTypeScript: boolean
  hasTailwind: boolean
  hasEslint: boolean
  hasPrettier: boolean
  nodeVersion: string | null
  reactVersion: string | null
  nextVersion: string | null
  scripts: string[]
  dependencyCount: number
  devDependencyCount: number
}

export interface FrameworkDetection {
  id: string
  name: string
  version: string | null
  confidence: "high" | "medium" | "low"
  evidence: string[]
}

export interface ReadinessBreakdown {
  overall: number
  health: AnalysisStatusLevel
  cicd: AnalysisStatusLevel
  docker: AnalysisStatusLevel
  environment: AnalysisStatusLevel
  security: AnalysisStatusLevel
}

/**
 * Full analysis report for the selected repository.
 * Also satisfies the lighter stub fields used elsewhere.
 */
export interface RepositoryAnalysis {
  analyzedAt: string
  owner: string
  name: string
  fullName: string
  defaultBranch: string
  visibility: "public" | "private"
  language: string | null
  sizeKb: number | null
  latestCommitSha: string | null
  latestCommitMessage: string | null
  framework: FrameworkDetection | null
  frameworks: FrameworkDetection[]
  package: PackageAnalysis
  deployment: DeploymentSignals
  readiness: ReadinessBreakdown
  findings: AnalysisFinding[]
  recommendations: AnalysisRecommendation[]
  /** Markdown explanation of the score & findings */
  explanationMarkdown: string
  readmePreview: string | null
  /** Stub-compatible aliases */
  hasPackageJson: boolean
  hasDockerfile: boolean
  hasGithubActions: boolean
  primaryFramework: string | null
  /** Future analysis slots (populated later without breaking consumers) */
  extensions?: {
    dockerfile?: unknown
    githubActions?: unknown
    kubernetes?: unknown
    terraform?: unknown
    aws?: unknown
    azure?: unknown
    vercel?: unknown
  }
}

/** @deprecated Prefer RepositoryAnalysis — kept for gradual migration */
export type RepositoryAnalysisStub = {
  hasPackageJson?: boolean
  hasDockerfile?: boolean
  hasGithubActions?: boolean
  readmePreview?: string | null
  primaryFramework?: string | null
}
