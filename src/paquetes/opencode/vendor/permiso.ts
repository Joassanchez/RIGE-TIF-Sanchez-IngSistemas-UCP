// Copyright (c) 2025 opencode. Licencia MIT: ver ./LICENSE.
// Copia de opencode v1.18.25, packages/opencode/src/permission/index.ts:28-38,178-214. Ver ./PROCEDENCIA.md.
import * as Wildcard from "./wildcard"
export { expand }

export namespace PermissionV1 {
  export type Rule = { permission: string; pattern: string; action: "allow" | "deny" | "ask" }
  export type Ruleset = Rule[]
}
export namespace ConfigPermissionV1 {
  export type Info = Record<string, string | Record<string, string>>
}

export function evaluate(permission: string, pattern: string, plataforma: string, ...rulesets: PermissionV1.Ruleset[]): PermissionV1.Rule {
  return (
    rulesets
      .flat()
      .findLast((rule) => Wildcard.match(permission, rule.permission, plataforma) && Wildcard.match(pattern, rule.pattern, plataforma)) ?? {
      action: "ask",
      permission,
      pattern: "*",
    }
  )
}

function expand(pattern: string, hogar: string): string {
  if (pattern.startsWith("~/")) return hogar + pattern.slice(1)
  if (pattern === "~") return hogar
  if (pattern.startsWith("$HOME/")) return hogar + pattern.slice(5)
  if (pattern.startsWith("$HOME")) return hogar + pattern.slice(5)
  return pattern
}

export function fromConfig(permission: ConfigPermissionV1.Info, hogar: string) {
  const ruleset: PermissionV1.Rule[] = []
  for (const [key, value] of Object.entries(permission)) {
    if (typeof value === "string") {
      ruleset.push({ permission: key, action: value as PermissionV1.Rule["action"], pattern: "*" })
      continue
    }
    ruleset.push(
      ...Object.entries(value).map(([pattern, action]) => ({ permission: key, pattern: expand(pattern, hogar), action: action as PermissionV1.Rule["action"] })),
    )
  }
  return ruleset
}

export function merge(...rulesets: PermissionV1.Ruleset[]): PermissionV1.Rule[] {
  return rulesets.flat()
}

export function disabled(tools: string[], ruleset: PermissionV1.Ruleset, plataforma: string): Set<string> {
  const edits = ["edit", "write", "apply_patch"]
  const reads = ["list_mcp_resources", "list_mcp_resource_templates", "read_mcp_resource"]
  return new Set(
    tools.filter((tool) => {
      const permission = edits.includes(tool) ? "edit" : reads.includes(tool) ? "read" : tool
      const rule = ruleset.findLast((rule) => Wildcard.match(permission, rule.permission, plataforma))
      return rule?.pattern === "*" && rule.action === "deny"
    }),
  )
}
