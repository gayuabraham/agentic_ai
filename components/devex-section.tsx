"use client"

import { useState, useEffect } from "react"

const STEPS = [
  {
    num: "01",
    title: "Connect Repo",
    desc: "Link GitHub in one command",
    file: "terminal",
    lang: "bash",
    code: [
      { type: "comment", text: "# Connect Rapid24.ai to your repo" },
      { type: "command", text: "npx rapid24 init" },
      { type: "gap" },
      { type: "comment", text: "# Authenticate with GitHub" },
      { type: "command", text: "rapid24 connect github" },
      { type: "gap" },
      { type: "output", text: "✓ Repository linked" },
      { type: "output", text: "✓ Webhooks configured" },
      { type: "output", text: "✓ Ready to deploy" },
    ],
  },
  {
    num: "02",
    title: "Configure Pipeline",
    desc: "Declarative deploy config",
    file: "rapid24.config.ts",
    lang: "typescript",
    code: [
      { type: "comment", text: "// rapid24.config.ts" },
      { type: "keyword", text: "import", after: " { definePipeline } ", keyword2: "from", string: " '@rapid24/sdk'" },
      { type: "gap" },
      { type: "keyword", text: "export default", after: " ", keyword2: "", keyword3: "", fn: "definePipeline", args: "({" },
      { type: "prop", key: "  name", val: "'production'" },
      { type: "prop", key: "  provider", val: "'vercel'" },
      { type: "prop", key: "  autoFix", val: "true" },
      { type: "prop", key: "  verify", val: "['health', 'smoke']" },
      { type: "plain", text: "});" },
    ],
  },
  {
    num: "03",
    title: "Enable Autofix",
    desc: "AI resolves build failures",
    file: "rapid24.config.ts",
    lang: "typescript",
    code: [
      { type: "comment", text: "// Enable autonomous error resolution" },
      { type: "keyword", text: "import", after: " { Autofix } ", keyword2: "from", string: " '@rapid24/sdk'" },
      { type: "gap" },
      { type: "keyword", text: "const", after: " autofix ", keyword2: "=", keyword3: " new ", fn: "Autofix", args: "({" },
      { type: "prop", key: "  builds", val: "true" },
      { type: "prop", key: "  docker", val: "true" },
      { type: "prop", key: "  env", val: "true" },
      { type: "plain", text: "})" },
      { type: "gap" },
      { type: "comment", text: "// Attach to pipeline" },
      { type: "plain", text: "pipeline.use(autofix)" },
    ],
  },
  {
    num: "04",
    title: "Ship to Prod",
    desc: "Commit → verified live",
    file: "terminal",
    lang: "bash",
    code: [
      { type: "comment", text: "# Push and let Rapid24.ai take over" },
      { type: "command", text: "git push origin main" },
      { type: "gap" },
      { type: "output", text: "  Analyzing build..." },
      { type: "output", text: "  Applying automatic fixes..." },
      { type: "output", text: "  Deploying to production..." },
      { type: "gap" },
      { type: "success", text: "✓ Production live — verified" },
      { type: "url", text: "  → https://app.yourproduct.com" },
    ],
  },
]

function CodeLine({ line }: { line: (typeof STEPS)[0]["code"][0] }) {
  if (line.type === "gap") return <div className="h-3" />
  if (line.type === "comment") return <div className="text-[#9ca3af]">{line.text}</div>
  if (line.type === "output") return <div className="text-[#6b7280]">{line.text}</div>
  if (line.type === "success") return <div className="text-[#16a34a]">{line.text}</div>
  if (line.type === "url") return <div className="text-[#2563eb] underline">{line.text}</div>
  if (line.type === "command") return (
    <div>
      <span className="text-[#16a34a]">$ </span>
      <span className="text-foreground">{line.text}</span>
    </div>
  )
  if (line.type === "plain") return <div className="text-foreground">{line.text}</div>
  if (line.type === "prop") return (
    <div>
      <span className="text-[#2563eb]">{line.key}</span>
      <span className="text-foreground">: </span>
      <span className="text-[#16a34a]">{line.val}</span>
      <span className="text-foreground">,</span>
    </div>
  )
  if (line.type === "keyword") return (
    <div>
      <span className="text-[#7c3aed]">{line.text}</span>
      <span className="text-foreground">{line.after}</span>
      <span className="text-[#7c3aed]">{line.keyword2}</span>
      {line.keyword3 && <span className="text-[#7c3aed]">{line.keyword3}</span>}
      {line.fn && <span className="text-[#b45309]">{line.fn}</span>}
      {line.args && <span className="text-foreground">{line.args}</span>}
      {line.string && <span className="text-[#16a34a]">{line.string}</span>}
    </div>
  )
  return null
}

export function DevExSection() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  function selectStep(i: number) {
    if (i === active) return
    setVisible(false)
    setTimeout(() => {
      setActive(i)
      setVisible(true)
    }, 180)
  }

  // Auto-advance every 3s
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive(prev => (prev + 1) % STEPS.length)
        setVisible(true)
      }, 180)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  const step = STEPS[active]

  return (
    <section id="devex" className="py-32 px-6 md:px-12 lg:px-20 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-[10px] tracking-widest text-muted-foreground uppercase">
            Developer Experience
          </div>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Built for engineers.<br />Trusted by CTOs.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
          {/* Left — 4 clickable step cards, equal height, no flex stretch */}
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                onClick={() => selectStep(i)}
                className="flex-1 text-left rounded-2xl border transition-all duration-200 p-6 group"
                style={{
                  background: active === i ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.7)",
                  borderColor: active === i ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)",
                  boxShadow: active === i
                    ? "0 1px 3px rgba(0,0,0,0.06)"
                    : "0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex gap-4 items-start">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-light shrink-0 transition-colors duration-200"
                    style={{
                      background: active === i ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)",
                      color: active === i ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.35)",
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-light transition-colors duration-200"
                      style={{ color: active === i ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.28)" }}>{s.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right — fixed-size code panel */}
          <div
            className="lg:col-span-2 rounded-2xl border border-border p-8 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              minHeight: "360px",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div
                className="text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{
                  opacity: visible ? 1 : 0,
                  filter: visible ? "blur(0px)" : "blur(4px)",
                  transition: "opacity 200ms ease, filter 200ms ease",
                  color: "rgba(0,0,0,0.3)",
                }}
              >
                {step.file}
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(d => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: d === active % 3 ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Code block — fixed height, content doesn't affect layout */}
            <div className="flex-1 rounded-xl p-6 overflow-hidden" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div
                className="font-mono text-[12px] leading-6"
                style={{
                  opacity: visible ? 1 : 0,
                  filter: visible ? "blur(0px)" : "blur(6px)",
                  transform: visible ? "translateY(0)" : "translateY(6px)",
                  transition: "opacity 220ms cubic-bezier(0.16,1,0.3,1), filter 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {step.code.map((line, i) => (
                  <CodeLine key={i} line={line} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
