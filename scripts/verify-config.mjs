import { readFileSync } from "node:fs";

const files = [
  "codex/goals/systemGoals.json",
  "codex/memory/sessionMemory.json",
  "codex/tools/odinTools.codex.json",
  "codex/flows/githubSync.codex",
  "codex/flows/initProjectFlow.codex",
  "codex/flows/multiProject.codex",
];

const failures = [];
for (const file of files) {
  try {
    const parsed = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"));
    if (file.endsWith("systemGoals.json") && !Array.isArray(parsed.goals)) {
      failures.push(`${file}: expected a goals array`);
    }
    if (file.endsWith("sessionMemory.json") &&
        (!("active_project_id" in parsed) || !Array.isArray(parsed.history) || typeof parsed.context !== "object")) {
      failures.push(`${file}: unexpected session memory shape`);
    }
    if (file.endsWith("odinTools.codex.json") && !Array.isArray(parsed.tools)) {
      failures.push(`${file}: expected a tools array`);
    }
    console.log(`OK  ${file}`);
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
  }
}

if (failures.length) {
  console.error("\nConfiguration validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("\nConfiguration validation passed. This does not constitute an application build or production-readiness check.");
}
