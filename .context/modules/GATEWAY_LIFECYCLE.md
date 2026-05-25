# Gateway Lifecycle Context

<!-- AUTO_START -->
[auto] Pending context-mapping build.
<!-- AUTO_END -->

<!-- MANUAL_START -->
## [manual] Design Decisions

Gateway lifecycle is implemented first as a reusable CLI so the behavior can be tested before a Tauri shell exists.

The lifecycle manager is responsible for checking health, detecting port conflicts, starting Gateway, recording ownership state, and stopping only processes it started.

This module is a stepping stone toward Tauri lifecycle integration. Tauri should call or port the same behavior instead of inventing a second startup policy.

## [manual] Invariants & Constraints

The lifecycle manager must not kill a process it did not start.

If the Gateway port is occupied but `/health` does not respond, the lifecycle manager must report an actionable conflict instead of killing the process.

`start` must mean Gateway is actually healthy, not merely spawned.

Lifecycle state must be machine-local and must not be committed.

Gateway health failure must be represented as degraded/unavailable state, not as a crash in clients.

When the human asks to manually test in a browser, the agent must provide WSL foreground instructions and must not start a hidden Windows background process.

## [manual] Test Strategy

Test through CLI commands:

```bash
npm run gateway:status
npm run gateway:start
npm run gateway:stop
```

Critical cases:

- Gateway absent -> `gateway:start` spawns and waits for `/health`
- Gateway already healthy -> `gateway:start` reports `already_running`
- Gateway managed -> `gateway:stop` stops it
- Gateway external/existing -> `gateway:stop` refuses to stop it

Manual browser test instruction:

```bash
cd /mnt/d/Github/ZeroClaw-Vbee-Automate
source ~/.nvm/nvm.sh
nvm use 24
HOST=0.0.0.0 npm run dev
```

## [manual] Behavior chưa implement (TODO)

Tauri Rust integration is not implemented yet.

Automatic restart-on-crash is not implemented yet.

Windows-native process discovery is not implemented yet.
<!-- MANUAL_END -->
