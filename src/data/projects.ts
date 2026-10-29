/**
 * Demo projects selectable with ?project=<id>. Each entry is a fictional
 * project's chat identity; its knowledge base feeds the shared /api/chat.
 * To add a client later: add an entry here plus its knowledge/system prompt
 * in src/lib/ai/systemPrompt.ts (getSystemPrompt).
 */
import { starterSuggestions, welcomeMessage } from "./projectKnowledge";

export interface DemoProject {
  id: string;
  name: string;
  initials: string;
  /** Instagram handle. */
  handle: string;
  /** Placeholder profile stats for the Instagram intro card. */
  igStats: string;
  welcome: string;
  starters: string[];
}

export const DEFAULT_PROJECT_ID = "skyline-heights";

export const demoProjects: Record<string, DemoProject> = {
  "skyline-heights": {
    id: "skyline-heights",
    name: "Skyline Heights",
    initials: "SH",
    handle: "skylineheights.homes",
    igStats: "1.2K followers · 48 posts",
    welcome: welcomeMessage,
    starters: starterSuggestions,
  },
};

export function getDemoProject(id?: string | null): DemoProject {
  return (id && demoProjects[id]) || demoProjects[DEFAULT_PROJECT_ID];
}
