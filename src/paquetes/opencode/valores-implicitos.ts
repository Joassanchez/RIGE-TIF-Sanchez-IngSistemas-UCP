import type { ValorJson } from "@rige/nucleo/contrato/adaptador";

// Metadatos de agent.ts del tag 1.18.25. Resumenes: vendor/PROCEDENCIA.md.
export const valoresNativos: Readonly<Record<string, Readonly<Record<string, ValorJson>>>> = {
  "build": {
    "name": "build",
    "description": "The default agent. Executes tools based on configured permissions.",
    "options": {},
    "mode": "primary",
    "native": true
  },
  "plan": {
    "name": "plan",
    "description": "Plan mode. Disallows all edit tools.",
    "options": {},
    "mode": "primary",
    "native": true
  },
  "general": {
    "name": "general",
    "description": "General-purpose agent for researching complex questions and executing multi-step tasks. Use this agent to execute multiple units of work in parallel.",
    "options": {},
    "mode": "subagent",
    "native": true
  },
  "explore": {
    "name": "explore",
    "description": "Fast agent specialized for exploring codebases. Use this when you need to quickly find files by patterns (eg. \"src/components/**/*.tsx\"), search code for keywords (eg. \"API endpoints\"), or answer questions about the codebase (eg. \"how do API endpoints work?\"). When calling this agent, specify the desired thoroughness level: \"quick\" for basic searches, \"medium\" for moderate exploration, or \"very thorough\" for comprehensive analysis across multiple locations and naming conventions.",
    "prompt": {
      "tipo": "texto-nativo",
      "sha256": "97c4780dea390f347fed0879fb30aaa08c0fc65c8cad0f6c1aec02ca6fd91e13"
    },
    "options": {},
    "mode": "subagent",
    "native": true
  },
  "compaction": {
    "name": "compaction",
    "mode": "primary",
    "native": true,
    "hidden": true,
    "prompt": {
      "tipo": "texto-nativo",
      "sha256": "552db0de0af1873a8acd4a631e2548345d4c43192de1d9be69c8feab4b41f80c"
    },
    "options": {}
  },
  "title": {
    "name": "title",
    "mode": "primary",
    "options": {},
    "native": true,
    "hidden": true,
    "temperature": 0.5,
    "prompt": {
      "tipo": "texto-nativo",
      "sha256": "e7a6848eba328f28c7e870874cf0591e4edbaf90d7602ad8fdfe90601c6e656f"
    }
  },
  "summary": {
    "name": "summary",
    "mode": "primary",
    "options": {},
    "native": true,
    "hidden": true,
    "prompt": {
      "tipo": "texto-nativo",
      "sha256": "307314eb41cc38a90881ae9f26e0402ceeed04e71046014486a9908ad4520233"
    }
  }
};
