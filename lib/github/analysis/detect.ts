/**
 * Framework + package-manager detection from manifest files & tree paths.
 */

import type { FrameworkDetection, PackageAnalysis } from "./types"

type DepMap = Record<string, string>

function depVersion(deps: DepMap, name: string): string | null {
  const raw = deps[name]
  if (!raw) return null
  return raw.replace(/^[\^~>=<\s]+/, "") || raw
}

function mergeDeps(...maps: Array<DepMap | undefined>): DepMap {
  return Object.assign({}, ...maps.filter(Boolean))
}

export function detectPackageManager(paths: string[]): PackageAnalysis["packageManager"] {
  const set = new Set(paths.map((p) => p.toLowerCase()))
  if ([...set].some((p) => p.endsWith("pnpm-lock.yaml"))) return "pnpm"
  if ([...set].some((p) => p.endsWith("yarn.lock"))) return "yarn"
  if ([...set].some((p) => p.endsWith("bun.lockb") || p.endsWith("bun.lock"))) return "bun"
  if ([...set].some((p) => p.endsWith("package-lock.json"))) return "npm"
  if ([...set].some((p) => p.endsWith("composer.json"))) return "composer"
  if ([...set].some((p) => p.endsWith("pom.xml") || p.endsWith("build.gradle"))) return "maven"
  if ([...set].some((p) => p.endsWith("gemfile"))) return "bundler"
  if ([...set].some((p) => p.endsWith(".csproj"))) return "dotnet"
  if ([...set].some((p) => p.endsWith("requirements.txt") || p.endsWith("pyproject.toml")))
    return "pip"
  if ([...set].some((p) => p.endsWith("package.json"))) return "npm"
  return "unknown"
}

export function analyzePackageJson(
  raw: string | null,
  paths: string[],
): { package: PackageAnalysis; frameworks: FrameworkDetection[] } {
  const frameworks: FrameworkDetection[] = []
  const hasPackageJson = Boolean(raw) || paths.some((p) => /(^|\/)package\.json$/i.test(p))

  let nodeVersion: string | null = null
  let reactVersion: string | null = null
  let nextVersion: string | null = null
  let scripts: string[] = []
  let dependencyCount = 0
  let devDependencyCount = 0
  let hasTypeScript = paths.some((p) => /tsconfig.*\.json$/i.test(p))
  let hasTailwind = false
  let hasEslint = paths.some((p) => /eslint/i.test(p))
  let hasPrettier = paths.some((p) => /prettier/i.test(p))

  if (raw) {
    try {
      const pkg = JSON.parse(raw) as {
        engines?: { node?: string }
        scripts?: Record<string, string>
        dependencies?: DepMap
        devDependencies?: DepMap
        peerDependencies?: DepMap
      }
      const all = mergeDeps(pkg.dependencies, pkg.devDependencies, pkg.peerDependencies)
      dependencyCount = Object.keys(pkg.dependencies ?? {}).length
      devDependencyCount = Object.keys(pkg.devDependencies ?? {}).length
      scripts = Object.keys(pkg.scripts ?? {})
      nodeVersion = pkg.engines?.node ?? null
      reactVersion = depVersion(all, "react")
      nextVersion = depVersion(all, "next")
      hasTypeScript = hasTypeScript || Boolean(all.typescript)
      hasTailwind =
        Boolean(all.tailwindcss) || Boolean(all["@tailwindcss/postcss"])
      hasEslint = hasEslint || Boolean(all.eslint)
      hasPrettier = hasPrettier || Boolean(all.prettier)

      const push = (
        id: string,
        name: string,
        version: string | null,
        evidence: string[],
        confidence: FrameworkDetection["confidence"] = "high",
      ) => {
        frameworks.push({ id, name, version, confidence, evidence })
      }

      if (all.next) push("nextjs", "Next.js", nextVersion, ["package.json → next"])
      else if (all.nuxt || all["nuxt3"])
        push("nuxt", "Nuxt", depVersion(all, "nuxt") ?? depVersion(all, "nuxt3"), [
          "package.json → nuxt",
        ])
      else if (all["@nestjs/core"])
        push("nestjs", "NestJS", depVersion(all, "@nestjs/core"), [
          "package.json → @nestjs/core",
        ])
      else if (all.express)
        push("express", "Express", depVersion(all, "express"), ["package.json → express"])
      else if (all["@angular/core"])
        push("angular", "Angular", depVersion(all, "@angular/core"), [
          "package.json → @angular/core",
        ])
      else if (all.vue)
        push("vue", "Vue", depVersion(all, "vue"), ["package.json → vue"])
      else if (all.react)
        push("react", "React", reactVersion, ["package.json → react"])
    } catch {
      // invalid package.json — still mark presence
    }
  }

  return {
    package: {
      packageManager: detectPackageManager(paths),
      hasPackageJson,
      hasTypeScript,
      hasTailwind,
      hasEslint,
      hasPrettier,
      nodeVersion,
      reactVersion,
      nextVersion,
      scripts,
      dependencyCount,
      devDependencyCount,
    },
    frameworks,
  }
}

export function detectNonJsFrameworks(
  paths: string[],
  fileTexts: Record<string, string | null>,
): FrameworkDetection[] {
  const frameworks: FrameworkDetection[] = []
  const lower = paths.map((p) => p.toLowerCase())
  const has = (re: RegExp) => lower.some((p) => re.test(p))

  const composer = fileTexts["composer.json"]
  if (composer || has(/composer\.json$/)) {
    const isLaravel =
      /laravel\/framework/i.test(composer ?? "") || has(/artisan$/)
    if (isLaravel) {
      frameworks.push({
        id: "laravel",
        name: "Laravel",
        version: null,
        confidence: "high",
        evidence: ["composer.json / artisan"],
      })
    }
  }

  const requirements =
    fileTexts["requirements.txt"] ?? fileTexts["pyproject.toml"] ?? ""
  if (has(/requirements\.txt$/) || has(/pyproject\.toml$/) || has(/manage\.py$/)) {
    if (/django/i.test(requirements) || has(/manage\.py$/)) {
      frameworks.push({
        id: "django",
        name: "Django",
        version: null,
        confidence: "high",
        evidence: ["Python manifest / manage.py"],
      })
    } else if (/flask/i.test(requirements)) {
      frameworks.push({
        id: "flask",
        name: "Flask",
        version: null,
        confidence: "high",
        evidence: ["requirements.txt → flask"],
      })
    }
  }

  if (has(/pom\.xml$/) || has(/build\.gradle$/)) {
    const pom = fileTexts["pom.xml"] ?? ""
    if (/spring-boot/i.test(pom) || has(/src\/main\/java\//)) {
      frameworks.push({
        id: "springboot",
        name: "Spring Boot",
        version: null,
        confidence: /spring-boot/i.test(pom) ? "high" : "medium",
        evidence: ["pom.xml / Java sources"],
      })
    }
  }

  if (has(/^gemfile$/) || has(/\/gemfile$/)) {
    const gem = fileTexts["Gemfile"] ?? ""
    if (/rails/i.test(gem) || has(/config\/routes\.rb$/)) {
      frameworks.push({
        id: "rails",
        name: "Ruby on Rails",
        version: null,
        confidence: "high",
        evidence: ["Gemfile / routes.rb"],
      })
    }
  }

  if (has(/\.csproj$/) || has(/program\.cs$/)) {
    frameworks.push({
      id: "aspnet",
      name: "ASP.NET",
      version: null,
      confidence: "high",
      evidence: [".csproj / Program.cs"],
    })
  }

  return frameworks
}

export function pickPrimaryFramework(
  frameworks: FrameworkDetection[],
): FrameworkDetection | null {
  if (!frameworks.length) return null
  const priority = [
    "nextjs",
    "nuxt",
    "nestjs",
    "angular",
    "vue",
    "react",
    "express",
    "laravel",
    "django",
    "flask",
    "springboot",
    "rails",
    "aspnet",
  ]
  for (const id of priority) {
    const hit = frameworks.find((f) => f.id === id)
    if (hit) return hit
  }
  return frameworks[0] ?? null
}
