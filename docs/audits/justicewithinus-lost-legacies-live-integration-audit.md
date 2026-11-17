# JusticeWithinUs repository audit and Lost Legacies Live integration plan

**Audit date:** 2026-11-17  
**Audited ref:** `main` at `81bac7c330c0c564b8d958ffd1553f61e2d3cb86`  
**Status:** Repository inventory and design-level audit complete; runtime integration is not yet verified.

## Executive assessment

JusticeWithinUs currently behaves as a mixed archive/prototype repository, not a reproducible application checkout. It contains useful Odin integration sketches, JUSCR UI prototypes, project notes, deployment fragments, and binary/document archives. It does not contain a root `package.json`, a lockfile, a conventional application entry point, or an automated test suite. The existing Next.js Pages workflow expects a package manager and application build that are not present at the audited root.

**Decision:** do not merge this repository into the Lost Legacies Live application, do not deploy it, and do not connect it to the Time Engine through direct database writes. First establish a small, versioned, API-level integration boundary. Keep the Time Engine and private Secret Rooms authoritative in their existing repository.

## Repository inventory

The default branch is `main`. At audit time it contains 58 tree entries (including directories), one branch, no open pull requests, and no open issues. The latest commit adds `codex/goals/systemGoals.json`.

### Reusable prototype assets

| Path | Current content | Assessment |
|---|---|---|
| `tools/odin/getProjects.js` | Odin projects API request | Prototype; missing input/config validation, timeout, and typed response validation |
| `tools/odin/createChat.js` | Odin chat API request | Prototype; missing input/config validation, timeout, and typed response validation |
| `codex/agents/odinBrain.codex` | Five-step chat agent outline | Specification only |
| `codex/agents/projectSelector.codex` | Project selection outline | Specification only |
| `codex/flows/initProjectFlow.codex` | Selects first returned project | Unsafe default for multi-project use; selection must be explicit |
| `codex/flows/multiProject.codex` | Loop projects and send task | Specification only; no fan-out limits, per-project authorization, or partial-failure policy |
| `codex/flows/githubSync.codex` | Commit-to-memory outline | Specification only; no event signature, idempotency key, retry policy, or data minimization |
| `codex/memory/sessionMemory.json` | Empty active project/history/context | Seed data only; no persistence adapter or tenant isolation |
| `codex/goals/systemGoals.json` | Four system goals | Valid configuration concept; needs schema/version |
| `juscr/multi-user-layer.ts` | In-memory user/event map | Prototype only; no auth, persistence, schema validation, or unsubscribe lifecycle |
| `juscr/collaborative-dashboard.tsx` | React dashboard | Prototype only; module-level localhost WebSocket, no auth/reconnect, duplicate listener risk |
| `juscr/widget-system.ts` | Widget registry/loader | Prototype only; interpolates message into `innerHTML`, allowing HTML injection |
| `.github/workflows/nextjs.yml` | Next.js Pages build/deploy workflow | Not runnable at this root until package manager, manifest, app, and build output exist |

### Repository hygiene and operational blockers

- No root `README.md`, `package.json`, package lock, TypeScript config, test runner, or app build config was found.
- Several root files and workflow-directory entries are unstructured notes, duplicated artifacts, scripts, or code with misleading names. In particular, `.github/workflows/deploy` and `.github/workflows/deploymeny` are shell scripts, while `.github/workflows/deployment` is TypeScript source. They are not valid GitHub Actions workflow files.
- The shell deployment fragments reference a developer-specific `/Users/sarai/...` path, local keypairs, and a devnet deploy. They must not be executed by CI or treated as production deployment automation.
- `.github/workflows/main.yml` contains prose rather than YAML workflow syntax. `.github/workflows/startup` is a pasted workflow proposal, not an executable workflow.
- The Next.js workflow assumes a package manager, `package.json`, and `out/` output. Those prerequisites are absent.
- Some archive and note files duplicate content or make claims of completed deployment that are not supported by executable source or observed deployment evidence. Treat narrative status statements as unverified.
- A legacy note contains personal contact details and proposed unsolicited outreach automation. Do not reproduce those details, activate outreach, or use them in CI. Review and remove/restrict such material only through a deliberate owner-approved cleanup.
- No evidence in this repository establishes a running Odin API credential, a deployed collaborative service, production database, authenticated WebSocket service, or successful deployment.

## Confirmed defects in prototype code

1. **Odin API clients:** `getProjects` and `createChat` read `ODIN_API_KEY` but do not fail early with a safe configuration error, set a timeout, validate input, or validate the response shape. Error messages reveal only HTTP status, but response bodies and retry semantics are not modeled.
2. **Project initialization:** `select_first` silently binds a session to whichever project is returned first. This can route a user request to the wrong project. Require an explicit project choice or a previously authorized active project.
3. **Session memory:** the JSON file is a placeholder. It must not become shared global mutable memory. Persist state by authenticated user/tenant and project, with access control and retention rules.
4. **GitHub sync:** the flow has no webhook signature verification, event deduplication, repository allowlist, commit fetch authorization, or payload minimization.
5. **WebSocket:** `new WebSocket("ws://localhost:8080")` runs at module load, uses insecure `ws://`, is not environment-configured, and has no authentication, reconnect, lifecycle cleanup, or message validation.
6. **Multi-user state:** events accept arbitrary `any` payloads and user IDs; there is no authenticated identity binding or authorization check. Listener subscriptions cannot be removed.
7. **Widget rendering:** `innerHTML` inserts `props.message` without escaping. Use DOM text APIs or React rendering; do not inject untrusted content as HTML.
8. **Deployment:** no app build can be truthfully verified until the actual application root and dependency graph are identified. No deployment should be triggered from this repository in its current state.

## Target architecture and ownership boundaries

- **JusticeWithinUs / Odin:** project directory, authorized project selection, orchestration, agent/tool routing, and project-scoped operational context.
- **Lost Legacies Live:** product experience, participant identity/consent workflows, and commercial experience surfaces.
- **Time Engine / Secret Rooms:** remain authoritative in the existing Lost Legacies Live technical repository. The Time model specification places the first Energy/Economy prototype inside private dual-zero Secret Rooms, with private-by-default drafts, explicit sharing consent, reversible actions, and no monetary/token transfer in the first prototype.
- **Integration contract:** use a versioned authenticated API or MCP tool boundary. Do not share database credentials, write directly into another project's tables, or move private legacy content into Odin memory.
- **Minimum event envelope:** `event_id`, `event_type`, `schema_version`, `occurred_at`, `actor_id` (pseudonymous where possible), `project_id`, `correlation_id`, `consent_scope`, and a minimal payload reference. Store content separately under its own access policy.
- **No autonomous external action:** an agent may draft or recommend. Publication, third-party messaging, identity changes, financial activity, token issuance, and on-chain actions require separate explicit authorization and auditable confirmation.

## Implementation sequence

### Phase 0 — Stabilize repository (this PR)
- Add this audit and phased implementation contract.
- Add dependency-free validation for the existing JSON configuration files.
- Add a minimal CI workflow that validates configuration only; it must not deploy, install app dependencies, access secrets, or claim to build the application.
- Keep all existing runtime prototypes untouched pending a testable implementation boundary.

### Phase 1 — Make Odin tools safe and testable
- Identify the supported Odin API contract and confirm auth/header, endpoint, response schemas, rate limits, and retry guidance.
- Add shared client configuration, required API key validation, abort/timeout handling, bounded retries for safe GET requests only, and typed response validation.
- Validate `projectId` and message size/content constraints before chat requests.
- Add unit tests with mocked fetch; no live API key in tests.
- Add explicit project selection, authorization, and no-project/ambiguous-project states. Never auto-select the first project.

### Phase 2 — Identity, memory, and event integrity
- Define tenant/user/project ownership and an authorization matrix.
- Replace JSON session placeholder with a persistence adapter only after selecting the actual datastore and retention model.
- Add schema-versioned events, stable idempotency keys, webhook signature validation, replay protection, and repository allowlists.
- Keep private Secret Room content out of Odin memory. Store only opaque references and consent-approved metadata.

### Phase 3 — Collaborative UI hardening
- Remove module-level socket construction; configure secure `wss://` endpoint at runtime.
- Authenticate the connection, authorize every event, validate event schemas, and enforce origin/rate limits server-side.
- Add connection lifecycle cleanup, reconnect/backoff, and listener unsubscribe functions.
- Replace `innerHTML` with safe text rendering; add component tests and XSS regression tests.
- Do not ship a multi-user dashboard until a real authenticated server exists.

### Phase 4 — Lost Legacies Live integration
- Publish a versioned integration API contract with a mock server and contract tests.
- Map Odin project IDs to LL Live product/project IDs through an explicit allowlisted registry.
- Integrate first with read-only project metadata and task-status updates.
- Add a private Secret Room adapter only for consent-approved metadata; no content sync by default.
- Preserve the Time Engine's six-position model, symbolic vocabulary, privacy boundaries, and independent release gates. Any unresolved additional zero realm remains undefined until the project owner specifies it.
- Require explicit human confirmation before any shared publication or external economy action.

### Phase 5 — Production readiness
- Establish app root, supported runtime, dependency lockfile, build/test commands, deployment target, and environment inventory.
- Add security review, dependency scanning, secret scanning, access-control tests, backup/restore verification, monitoring, incident response, and rollback.
- Enable deployment only after production environment approvals and successful protected CI.
- Measure reliability and user outcomes before describing the platform as production-ready or making performance claims.

## Required acceptance criteria

- Clean checkout can run the documented configuration validation without secrets or network access.
- All committed machine-readable configuration parses and matches a versioned schema.
- No application build/deployment is advertised until an app manifest and successful build are present.
- Odin tools reject missing credentials and invalid inputs before network calls; time out safely; do not leak credentials in logs.
- Project routing cannot happen by array order or implicit first-project selection.
- User A cannot read or modify User B's memory, projects, events, or private content.
- Duplicate webhook delivery creates one logical event; invalid signatures and replayed events are rejected.
- No untrusted message is inserted into HTML.
- Secret Room content stays private by default; only purpose-specific consent can authorize a defined export.
- No private exercise triggers a post, message, payment, token, blockchain transaction, or other external side effect.
- All external actions have an auditable actor, scope, confirmation, and result.

## Open decisions (must be resolved before runtime integration)

1. Which deployed Odin API product/version and response schema are authoritative?
2. Which service owns authentication and project membership?
3. What is the canonical Lost Legacies Live API base URL and supported auth mechanism?
4. Which repository/branch contains the current Time Engine API and private Secret Room implementation?
5. Which datastore is authoritative for user/project state? Do not infer Supabase from roadmap notes.
6. Which frontend/runtime is intended for this repository? The current root does not identify one.
7. Which deployment environment and domain should serve the collaborative UI?

## Verification performed

- Repository metadata and default branch inspected through GitHub.
- Complete recursive Git tree inspected (58 entries, not truncated).
- Odin clients, agent/flow definitions, session memory, goals, JUSCR UI prototypes, and selected workflow/deployment fragments fetched and reviewed.
- Existing Lost Legacies Live Time/Energy-Economy insertion specification inspected in `archonfractureback` on `codex/six-segment-interoperability`.
- No production credentials were requested or used; no deployment, payment, blockchain transaction, external message, or live Odin API call was performed.
