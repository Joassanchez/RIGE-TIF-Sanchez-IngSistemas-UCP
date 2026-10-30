// Copyright (c) 2025 opencode. Licencia MIT: ver ./LICENSE.
// Extraido de agent/agent.ts de OpenCode v1.18.25; ver ./PROCEDENCIA.md.
import type { ConfigPermissionV1 } from "./permiso";
type Info = ConfigPermissionV1.Info;

export function agentesNativos(rutas: { readonly data: string; readonly tmp: string; readonly worktree: string;
  readonly skillDirs: readonly string[]; readonly referenceDirs: readonly string[] },
  path: { join(...partes: string[]): string; relative(desde: string, hasta: string): string }) {
  const Global = { Path: rutas };
  const ctx = { worktree: rutas.worktree };
  const skillDirs = rutas.skillDirs;
  const referenceDirs = rutas.referenceDirs;
  const Truncate = { GLOB: path.join(Global.Path.data, "tool-output", "*") };
        const whitelistedDirs = [
          Truncate.GLOB,
          path.join(Global.Path.tmp, "*"),
          ...skillDirs.map((dir) => path.join(dir, "*")),
          ...referenceDirs.map((dir) => path.join(dir, "*")),
        ]
        const readonlyExternalDirectory = {
          "*": "ask",
          ...Object.fromEntries(whitelistedDirs.map((dir) => [dir, "allow"])),
        } satisfies Record<string, "allow" | "ask" | "deny">

  const defaults = {
          "*": "allow",
          doom_loop: "ask",
          external_directory: {
            "*": "ask",
            ...Object.fromEntries(whitelistedDirs.map((dir) => [dir, "allow"])),
          },
          question: "deny",
          plan_enter: "deny",
          plan_exit: "deny",
          // mirrors github.com/github/gitignore Node.gitignore pattern for .env files
          read: {
            "*": "allow",
            "*.env": "ask",
            "*.env.*": "ask",
            "*.env.example": "allow",
          },
        } satisfies Info;
  const agentes: Record<string, { readonly permission: Info; readonly mode: string; readonly native: true; readonly hidden?: true }> = {
    build: { permission: {
                question: "allow",
                plan_enter: "allow",
              }, mode: "primary", native: true },
    plan: { permission: {
                question: "allow",
                plan_exit: "allow",
                task: {
                  general: "deny",
                },
                external_directory: {
                  [path.join(Global.Path.data, "plans", "*")]: "allow",
                },
                edit: {
                  "*": "deny",
                  [path.join(".opencode", "plans", "*.md")]: "allow",
                  [path.relative(ctx.worktree, path.join(Global.Path.data, path.join("plans", "*.md")))]: "allow",
                },
              }, mode: "primary", native: true },
    general: { permission: {
                todowrite: "deny",
              }, mode: "subagent", native: true },
    explore: { permission: {
                "*": "deny",
                grep: "allow",
                glob: "allow",
                list: "allow",
                bash: "allow",
                webfetch: "allow",
                websearch: "allow",
                read: "allow",
                external_directory: readonlyExternalDirectory,
              }, mode: "subagent", native: true },
    compaction: { permission: {
                "*": "deny",
              }, mode: "primary", native: true, hidden: true },
    title: { permission: {
                "*": "deny",
              }, mode: "primary", native: true, hidden: true },
    summary: { permission: {
                "*": "deny",
              }, mode: "primary", native: true, hidden: true },
  };
  return { defaults, agentes, truncamiento: Truncate.GLOB };
}
