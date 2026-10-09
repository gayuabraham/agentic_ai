/**
 * Optional LLM polish for the explanation panel.
 * Falls back silently — deterministic markdown always works offline.
 */

import OpenAI from "openai"
import type { RepositoryAnalysis } from "./types"

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI enrich timeout")), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

export async function enrichExplanationWithAi(
  analysis: RepositoryAnalysis,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const mode = (process.env.ASSISTANT_PROVIDER ?? "auto").toLowerCase()
  if (!apiKey || mode === "mock") {
    return analysis.explanationMarkdown
  }

  try {
    const client = new OpenAI({ apiKey })
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    const compact = {
      score: analysis.readiness.overall,
      readiness: analysis.readiness,
      framework: analysis.framework,
      packageManager: analysis.package.packageManager,
      findings: analysis.findings.slice(0, 12).map((f) => ({
        severity: f.severity,
        title: f.title,
        category: f.category,
      })),
      recommendations: analysis.recommendations.slice(0, 8).map((r) => ({
        title: r.title,
        priority: r.priority,
      })),
    }

    const completion = await withTimeout(
      client.chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content:
              "You are Rapid24.ai, an AI DevOps engineer. Rewrite the deployment readiness explanation in polished markdown. Keep facts accurate. Structure: Why is Deployment Score X%?, Findings, Recommendations. Be concise and premium. No fluff.",
          },
          {
            role: "user",
            content: `Repository: ${analysis.fullName}\n\nDeterministic report:\n${analysis.explanationMarkdown}\n\nStructured data:\n${JSON.stringify(compact)}`,
          },
        ],
      }),
      8_000,
    )

    const text = completion.choices[0]?.message?.content?.trim()
    return text || analysis.explanationMarkdown
  } catch (error) {
    console.warn("[analysis] AI enrich skipped:", error)
    return analysis.explanationMarkdown
  }
}
