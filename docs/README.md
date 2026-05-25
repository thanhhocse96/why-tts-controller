# Documentation Index

Docs are split into two layers:

```text
docs/design/
  01_...  # design source documents and architecture decisions

docs/milestones/
  M0_001_...  # implemented work, named after .context/MILESTONES.md
```

## Naming Rules

Design docs use numeric order:

```text
01_<name>.md
02_<name>.md
```

Milestone docs use:

```text
<milestone>_<sequence>_<name>.md
```

Example:

```text
M0_001_gateway-core-fake-end-to-end.md
```

The milestone code must match `.context/MILESTONES.md`.

## Agent Rules

When an agent completes a meaningful implementation slice, it must create or update a milestone doc.

Milestone docs must start with workflow first, then explain:

```text
what was implemented
files changed or added
design patterns used
verification commands or acceptance checks
known limits
```

After adding, moving, or renaming a docs file, update this index.

## Design Docs

1. [ZeroClaw Vbee Working Spec](design/01_zeroclaw-vbee-working-spec.md)
2. [MVP Architecture](design/02_mvp-architecture.md)
3. [Phase 1 Design](design/03_phase-1-design.md)
4. [Migration Plan To Gateway Core](design/04_migration-plan-to-gateway-core.md)
5. [Critique Response And Plan Amendments](design/05_critique-response-and-plan-amendments.md)

## Implemented Milestone Docs

### M0 - Gateway Core Fake End-to-End

1. [Gateway Core Fake End-to-End](milestones/M0_001_gateway-core-fake-end-to-end.md)
2. [Dev Client Gateway Validation](milestones/M0_002_dev-client-gateway-validation.md)
3. [Dev Runtime Scripts](milestones/M0_003_dev-runtime-scripts.md)
