# Skill Definition (SKILL_DEFINITION.md)

This document defines the automated workflow for the Migration Manager Skill.

## 1. The Skill: `migration-manager`
The `migration-manager` is an agentic workflow that orchestrates the movement of code into sub-packages based on the `MIGRATION_SPEC.md` task list.

### Core Workflow:
1. **Identify Task:** Read `MIGRATION_SPEC.md`, find the first task marked as "Pending".
2. **Lock Task:** Update `MIGRATION_SPEC.md` to change state to "In Progress".
3. **Execute Migration:** Perform file moves and configuration updates.
4. **Validation Pipeline:**
   - Run `npm run lint` in the destination package.
   - Run `npm run lint` in the root app.
   - Run `npm run verify` (60s runtime test).
5. **Release Phase:**
   - If validation passes: 
     - Update `CHANGELOG.md`.
     - Bump beta version.
     - Execute `npm run release`.
     - Output: "Migration step successful. Ready for manual testing."
   - If validation fails:
     - Revert changes or request manual intervention.

## 2. Verification Tooling
We will add a `verify` script to the root `package.json`.

**Script Logic (Pseudo-code):**
```bash
# 1. Static checks
npm run lint && \
# 2. Runtime check
electron-template-core verify-runtime --timeout 60
```

## 3. Command Usage
- `npm run task:next`: Activates the skill to process the next pending migration task.
- `npm run verify`: Manually triggers the verification pipeline.
