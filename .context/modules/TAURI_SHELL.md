# Tauri Shell Context

<!-- AUTO_START -->
[auto] Manual context only. Tauri shell scaffold was added after the Gateway lifecycle CLI existed.
<!-- AUTO_END -->

<!-- MANUAL_START -->
## [manual] Design Decisions

The Tauri shell should reuse the Gateway lifecycle behavior that is already tested by the CLI.

For M1, the shell is intentionally thin:

```text
Tauri setup
  -> call Gateway lifecycle start command
  -> remember whether this shell started Gateway
  -> expose runtime commands for UI polling
  -> stop Gateway on shell shutdown only when owned
```

This keeps startup policy aligned with `scripts/gateway-lifecycle.mjs` and avoids creating a second lifecycle implementation.

## [manual] Invariants & Constraints

The Tauri shell must not write SQLite directly.

The Tauri shell must not kill a Gateway it did not start.

Port conflict must remain actionable and must not trigger process killing.

Gateway health failure should be represented as degraded or unavailable runtime state for the UI, not as a shell crash.

The static dev client remains temporary; Tauri commands are the bridge for the future desktop UI.

## [manual] Test Strategy

The shell lifecycle module should be covered by Rust unit tests once Rust/Cargo is available locally.

Local Rust/Tauri toolchain is available in WSL Debian after sourcing Cargo env:

```bash
source /home/shinkuro/.cargo/env
cargo test --manifest-path src-tauri/Cargo.toml
node --check scripts/gateway-lifecycle.mjs
npm run smoke:lifecycle
python3 ../context-mapping/cli.py check-consistency .
```

If Cargo is missing from PATH, source `/home/shinkuro/.cargo/env`.

If Tauri build fails at `pkg-config`, ask the human to install the WSL Debian packages listed in `.local/ENVIRONMENT.md`.

Manual desktop verification should run the Tauri shell with Node 24 available and confirm:

- absent Gateway starts and becomes healthy
- existing healthy Gateway is reused
- occupied non-Gateway port is reported as conflict
- shell shutdown stops only a Gateway it started
<!-- MANUAL_END -->
