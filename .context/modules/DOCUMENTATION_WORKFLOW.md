# Documentation Workflow Context

<!-- AUTO_START -->
[auto] Manual context only. Documentation files are the source for this workflow.
<!-- AUTO_END -->

<!-- MANUAL_START -->
## [manual] Design Decisions

Documentation is treated as part of the agent operating system, not a final cleanup task.

The project separates design memory from implementation evidence:

```text
docs/design/      # source design docs and architecture decisions
docs/milestones/  # completed work, grouped by milestone
```

Design docs are ordered with `01_`, `02_`, `03_` because they are conceptual sources. Milestone docs are ordered with `<milestone>_<sequence>_` because they must match `.context/MILESTONES.md`.

## [manual] Invariants & Constraints

Every meaningful completed implementation slice must be documented in `docs/milestones/`.

Milestone filenames must use the current milestone code from `.context/MILESTONES.md`.

Milestone docs must describe what is already working. They must not be written as vague future plans.

Each milestone doc must start with a workflow diagram or workflow section before detailed prose.

Each milestone doc must include:

```text
workflow
what was implemented
files changed or added
design patterns used
verification commands or acceptance checks
known limits
```

`docs/README.md` must be updated whenever a docs file is added, renamed, or moved.

Design docs must not be moved into an archive folder unless the human explicitly says they are obsolete.

## [manual] Test Strategy

Documentation changes should be verified by:

```bash
rg --files docs
python ../context-mapping/cli.py check-consistency .
```

If docs mention commands, those commands should be run when practical, or the doc should clearly state that they were not run.

## [manual] Behavior chưa implement (TODO)

There is no automated docs linter yet for filename conventions.

There is no generated changelog yet.

There is no automatic mapping from changed source files to milestone docs yet.
<!-- MANUAL_END -->
