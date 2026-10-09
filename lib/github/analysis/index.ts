export type {
  RepositoryAnalysis,
  RepositoryAnalysisStub,
  AnalysisFinding,
  AnalysisRecommendation,
  DeploymentSignals,
  PackageAnalysis,
  FrameworkDetection,
  ReadinessBreakdown,
  AnalysisStatusLevel,
  AnalysisFindingSeverity,
} from "./types"
export { runRepositoryAnalysis } from "./run-analysis"
export type { RunAnalysisInput } from "./run-analysis"
export {
  analyzePackageJson,
  detectNonJsFrameworks,
  detectPackageManager,
  pickPrimaryFramework,
} from "./detect"
export {
  buildDeterministicExplanation,
  buildFindingsAndRecommendations,
  buildReadiness,
  detectDeploymentSignals,
} from "./score"
