# Orchestration Plan

## Mode Selection

- Repo: `/Users/stephenbrown/Code/OPENSOURCE/chillmeapp`
- Branch: `dev`
- Work mode: `full`
- Run folder: `agent-runs/2026-06-20-codebase-pass`
- Verifiable gates: `npm run lint`, `npm run tslint`, `npm run test`, `npm run build`, `git diff --check`, Git remote read, dry-run push
- Human-decision blockers: product roadmap priority changes, Firebase/LiveKit/Stripe dashboard work, broad architecture choices without local verification
- Resume policy: re-run Git preflight, read `run-state.md` and `task-queue.md`, push any validated local phase commit before new edits, then continue the recorded next action

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop, Quality Gate Selection Loop | Lint, typecheck, tests, and build are run or classified | Baseline is clean or every failure is reproducible and classified |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Targeted task check plus lint and relevant broader checks pass | Highest-priority executable issue is fixed/pushed or blocked with evidence |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Dependency/dead-code changes have evidence and lint/test/build pass | Safe cleanup is pushed or risky cleanup is deferred |
| Review | Judge Loop | Reviewer verdict is PASS or creates bounded follow-up tasks | Review report is pushed with no unhandled P0/P1 issues |
| Stabilization Loop | Stabilization Loop, Judge Loop, Reflect-or-Kill Loop as needed | Completion criteria pass or a real blocker is recorded | Stabilization report is pushed |
| Integrator | Final Completion Gate | Remote read/dry-run push, clean tree, branch sync, recorded gates | Final report is pushed and local dev matches origin/dev |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | `00-orchestration-plan.md`, `run-state.md`, `task-queue.md`, `01-preflight-and-repo-docs.md`, `skill-improvement-log.md`, `AGENTS.md`, `spec.md` | Startup planning, docs sweep, and resume state |
| T-002 | `02-baseline-validation.md`, `run-state.md`, `task-queue.md` | Baseline command results and failure classification |
| T-003 | `03-findings-backlog.md`, `run-state.md`, `task-queue.md` | Evidence-backed findings backlog and architecture scorecard |
| T-004 | Source files identified by findings, `04-execute-fixes-and-improvements.md`, `run-state.md`, `task-queue.md` | Focused fixes only after backlog evidence |
| T-005 | `package.json`, `package-lock.json`, dead-code targets with proof, `05-package-and-dead-code-cleanup.md` | Safe package/dead-code cleanup only |
| T-006 | `06-review.md`, `run-state.md`, `task-queue.md` | Judge loop review |
| T-007 | Stabilization-owned source/report files, `07-stabilization-loop.md` | Final fix/validate/review cycles |
| T-008 | `08-integrator.md`, `final-report.md`, `run-state.md`, `task-queue.md` | Final completion gate and report |
