"use client"

import { motion } from "framer-motion"
import { AgentWindow } from "@/components/ai-agent"

export default function AgentPage() {
  return (
    <motion.div className="relative min-h-screen overflow-hidden bg-[#030304]">
      {/* Page ambient lighting */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(139,92,246,0.08), transparent), radial-gradient(ellipse 50% 30% at 0% 80%, rgba(34,211,238,0.06), transparent)",
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col p-4 sm:p-6 lg:p-8"
      >
        <AgentWindow className="flex-1" />
      </motion.div>
    </motion.div>
  )
}
