// Copyright (c) 2025 opencode. Licencia MIT: ver ./LICENSE.
// Descripciones literales de agent.ts, tag v1.18.25; ver PROCEDENCIA.md.
export const descripcionesAgentes = {
  build: "The default agent. Executes tools based on configured permissions.",
  plan: "Plan mode. Disallows all edit tools.",
  general: "General-purpose agent for researching complex questions and executing multi-step tasks. Use this agent to execute multiple units of work in parallel.",
  explore: "Fast agent specialized for exploring codebases. Use this when you need to quickly find files by patterns (eg. \"src/components/**/*.tsx\"), search code for keywords (eg. \"API endpoints\"), or answer questions about the codebase (eg. \"how do API endpoints work?\"). When calling this agent, specify the desired thoroughness level: \"quick\" for basic searches, \"medium\" for moderate exploration, or \"very thorough\" for comprehensive analysis across multiple locations and naming conventions.",
} as const;
