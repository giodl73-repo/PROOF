# Browser workbench acceptance

Accepted before implementation, 2026-10-05. Scope: single pasted Markdown document, existing native heading/table/ASCII box/character checks, HTML preview via existing renderer, terminal math expansion via proof-math, Markdown/HTML/diagnostic JSON downloads. Real Rust computation runs in WASM worker. Cross-file links, cascading config, md:// resolution, directives, file watching, AI, corpus lint, DaVinci and document exports remain native-only in this first slice. Unsupported directives must be labelled, not falsely compiled. Browser results are not corpus admission.

PARSE: preserve existing checks and diagnostic semantics through a shared proof-core crate with native reexports; bounded UTF8 input and deterministic ordering. PIXEL: retain visual columns and click diagnostics by line, avoiding byte/character confusion. SOURCE: edited source remains the download truth; plain Markdown preview does not imply directive compilation. SCHEMA: fixed documented browser policy, not consumer proof.toml. SIGNAL: disabled cross-file checks explicitly unassessed, not clean; findings identify severity/location. BENCH: native regression fixtures plus actual WASM failure/reset/export/multibyte/mobile tests and artifact budget. PRESS: examples, edit/diagnostic/preview panes, visible loading and keyboard navigation. CACHE: latest-request results only, exports disabled while pending. BACKFILL: no generated source admission or repair writes. COMPOSE/BOOK/PANEL/STAGE: retain readable monospace output and mobile layout; advanced layouts/corpus/slide compilation defer to a later accepted slice.

These are AI role lenses, not external endorsements. No unresolved publication-blocking finding under this contract. Gates: root/native and shared-crate tests, format/clippy, release WASM, real-browser tests, Codex review, default-branch CI/deploy/live proof, scoped TRACKER snapshot. Prior tracked local PITFALL/source-custody closure stays preserved, original local branch retained.

## Local validation

Full `cargo test --locked --workspace` passed 1,159 tests and four doc tests before review fixes. Focused core/math/web tests passed after adding CommonMark container fences and explicit line-only math diagnostic cases. `cargo clippy --locked --workspace --all-targets -- -D warnings` and formatting passed. Seven actual-WASM Playwright cases cover diagnostics/line selection, math/source sharing, limits/source download, escaped HTML/sandbox/mobile, failed WASM loading plus edits, and footnote fragment navigation. Desktop/mobile screenshots inspected. Artifact remains under the enforced 5 MB limit (461,687 bytes locally). Rust 1.95.0 / wasm-bindgen 0.2.127 / Playwright 1.61.1.

Four accepted P2 review findings were fixed: container code fences stay literal; math findings use explicitly line-only locations because native math offsets do not guarantee source-token columns; blob-backed isolated preview keeps footnotes document-local; worker failures remain visible after editing. No native detector/config implementation changes: moved modules compare equivalent to original code. Original local policy branch `pitfall/use-case-integration-20260829` remains bbb602edce4890be8444f75dddff0fe51f929d97.

Final browser validation also found an intermittent preview replacement race: hide pending previews without navigating to about:blank; revoke the previous blob URL only after its replacement loads. No stale export is enabled.

After the preview lifecycle correction, the six browser cases passed three repeats (18/18) without retries.

Final lifecycle review identified overwritten cleanup handlers under rapid preview replacements. Retired blob URLs now have an independent set; a delayed three-result browser regression checks that all retired documents are revoked and the current document remains usable.

Final `codex review --uncommitted` exited 0 clean with no accepted or rejected findings. Seven final real-WASM browser cases passed.

Native CI and release jobs explicitly install Rust 1.95.0 to match the repository pin and validated Pages toolchain. Earlier floating-stable CI failed on Rust 1.98 Clippy warnings; strict checks remain enabled, and downstream tool invocations inherit the reproducible default.

Follow-up CI toolchain-pin review (`codex review --uncommitted`) exited 0 clean.
