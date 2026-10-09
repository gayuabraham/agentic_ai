/**
 * Architecture stubs for upcoming deeper repository intelligence.
 * The Analysis Engine already fills high-level signals; these remain extension points.
 */

import type { RepositoryAnalysisStub } from "./types"

/** Future capabilities that will hang off the selected repository */
export interface FutureRepositoryFeatures {
  fileExplorer?: unknown
  readmeViewer?: unknown
  packageJsonReader?: unknown
  dockerfileDetection?: unknown
  githubActionsDetection?: unknown
  kubernetes?: unknown
  terraform?: unknown
  aws?: unknown
  azure?: unknown
  vercel?: unknown
  commitHistory?: unknown
  pullRequests?: unknown
  branches?: unknown
  deploymentStatus?: unknown
}

export function createEmptyAnalysisStub(): RepositoryAnalysisStub {
  return {
    hasPackageJson: undefined,
    hasDockerfile: undefined,
    hasGithubActions: undefined,
    readmePreview: null,
    primaryFramework: null,
  }
}
