# 2026-05-15 Closeout Ledger

This ledger consolidates the completed May 15 micro-wave closeouts that previously occupied one directory per `CLOSE.md`. The mission, outcome, validation, findings, tests, and carry-forward text below is preserved section by section with paragraph line breaks normalized. Full original file layout remains recoverable from Git history.

The multi-file `2026-05-15-arrow-barchart-signal` wave remains in place because it retains both its wave contract and closeout.

## Action Dispatch Adapters Closeout

Archived from `context/waves/2026-05-15-action-dispatch-adapters/CLOSE.md`.

- **Mission:** Continue reducing `main.rs` command dispatch boilerplate by letting action command modules consume their own argument structs.
- **Changes:** - Updated `cmd_fix::run` to accept `cmd_fix::Args` directly. - Updated `cmd_pin::run` to accept `cmd_pin::Args` directly. - Updated `cmd_tree::run` to accept `cmd_tree::Args` directly. - Simplified `main.rs` dispatch for `Command::Fix`, `Command::Pin`, and `Command::Tree` so it no longer destructures their fields. - Kept fix, pin, and tree behavior unchanged.
- **Validation:** - `cargo test binary_fix_dry_run_writes_nothing` - `cargo test binary_pin_appends_davinci_entry` - `cargo test binary_tree_generate_prints_dirtree` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Apply the same module-owned dispatch adapter pattern to path/config-heavy commands where shared path defaulting remains clear.

## Actual File Counts Close

Archived from `context/waves/2026-05-15-actual-file-counts/CLOSE.md`.

- **Outcome:** Made CLI summary counts match the files actually selected by the runner: - Added `Runner::file_count()` using the same include/exclude matcher as `Runner::run()`. - Updated `mdloom check` and `mdloom stats` directory summaries to use the runner count instead of a separate markdown-extension approximation. - Removed the old duplicate `count_files` helper from `main.rs`.
- **Tests Added:** - `binary_stats_file_count_honors_include_exclude` - `binary_check_summary_file_count_honors_include_exclude`
- **Validation:** - `cargo test binary_stats_file_count_honors_include_exclude` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** If future commands need both diagnostics and file count, consider a single `Runner::run_with_summary()` result to avoid collecting the file list twice.

## Addressing Dispatch Adapters Closeout

Archived from `context/waves/2026-05-15-addressing-dispatch-adapters/CLOSE.md`.

- **Mission:** Continue reducing `main.rs` command dispatch boilerplate by letting address lookup command modules consume their own argument structs.
- **Changes:** - Updated `cmd_resolve::run` to accept `cmd_resolve::Args` directly. - Updated `cmd_depends::run` to accept `cmd_depends::Args` directly. - Simplified `main.rs` dispatch for `Command::Resolve` and `Command::Depends` so it no longer destructures their fields. - Kept resolve and reverse-dependency behavior unchanged.
- **Validation:** - `cargo test binary_resolve_prints_json_for_heading` - `cargo test binary_depends_prints_json_references` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Apply the same module-owned dispatch adapter pattern to other self-contained commands where it reduces boilerplate without obscuring CLI behavior.

## Addressing Lookup Command Args Closeout

Archived from `context/waves/2026-05-15-addressing-lookup-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the related `mdloom resolve` and `mdloom depends` argument shapes into their command modules.
- **Changes:** - Added `cmd_resolve::Args` with the clap argument definitions for `mdloom resolve`. - Added `cmd_depends::Args` with the clap argument definitions for `mdloom depends`. - Replaced the inline `Command::Resolve { ... }` and `Command::Depends { ... }` fields in `main.rs` with tuple variants that reference their command-module argument types. - Kept resolve and reverse-dependency behavior unchanged. - Preserved the resolve and depends JSON CLI regressions.
- **Validation:** - `cargo test binary_resolve_prints_json_for_heading` - `cargo test binary_depends_prints_json_references` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue migrating command argument groups from `main.rs` into their command modules in small, independently validated waves.

## Artifact Manifest Closeout

Archived from `context/waves/2026-05-15-artifact-manifest/CLOSE.md`.

- **Mission:** Make compile output provenance durable so markdown, HTML, and future PPTX/site targets share one artifact graph.
- **Changes:** - Added `mdloom_lib::artifact` with serializable manifest, artifact, status, and diagnostic records. - `mdloom compile` now writes `.mdloom/artifacts.json` for non-watch compile runs. - Manifest entries record: - source path - output path - target (`md`, `html`, future publish backends) - status (`written`, `cached`, `up_to_date`, `error`) - resolved directive count - cache usage - diagnostics - The manifest records config root and generation timestamp. - Kept cache and manifest responsibilities separate: cache stores reusable content, manifest describes the latest compile run. - Added integration coverage for target-aware HTML manifest entries. - Updated README, SPEC, session plan, and wave history.
- **Validation:** - `cargo test binary_compile_writes_artifact_manifest` - `cargo test binary_compile_target_html_writes_html_document` - `cargo fmt && cargo test && cargo build && git --no-pager diff --check` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Next manifest work should wire stale checks and `mdloom status` to `.mdloom/artifacts.json`, then let watch mode and future PPTX/site backends record target-specific provenance through the same structure.

## Backfill Classifiers Closeout

Archived from `context/waves/2026-05-15-backfill-classifiers/CLOSE.md`.

- **Mission:** Make the backfill report useful for adoption planning without changing literal-first source generation.
- **Changes:** - Added advisory block inventory to `mdloom_lib::backfill`. - Reports now include aggregate and per-file block counts for: - prose - fenced blocks - markdown tables - ASCII table candidates - chart-like blocks - diagram-like blocks - ambiguous blocks - Reports now include evidence strings with source line hints for detected candidate blocks. - Kept generated `.source.md` output literal-first; classifiers only affect the JSON report. - Updated README and SPEC to document the classifier report surface. - Added integration coverage for markdown tables, fenced ASCII tables, chart-like blocks, and diagram-like blocks.
- **Validation:** - `cargo test binary_backfill_literal_generates_source_and_report` - `cargo test binary_backfill_report_classifies_candidate_blocks` - `cargo fmt && cargo test && cargo build && git --no-pager diff --check` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Structured extraction should consume these report classifications only behind explicit extraction flags and continue preserving literal fallback metadata until round-trip gates pass.

## Backfill MVP Closeout

Archived from `context/waves/2026-05-15-backfill-mvp/CLOSE.md`.

- **Mission:** Give existing markdown projects a safe first-day adoption bridge into mdloom source ownership.
- **Changes:** - Added `mdloom backfill`. - Added `mdloom_lib::backfill` with report types and literal-first source generation. - Mirrors existing `.md` files to `.source.md` candidates under `--output-source`. - Adds source provenance frontmatter: - `tags: [backfill]` - `ops: [backfill]` - `content_tags: [markdown]` - `mdloom_original: "..."` - Writes `backfill-report.json` with scan/generation/round-trip summary and per-file entries. - Supports `--literal-first`, `--report`, `--output-source`, and `--check-roundtrip`. - Round-trip mode compiles generated source and compares compiled output to the original markdown. - Updated README and SPEC CLI reference for the implemented MVP surface.
- **Validation:** - `cargo test binary_backfill_literal_generates_source_and_report` - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Next backfill work should add classifiers and confidence evidence without changing the literal-first round-trip contract. Semantic extraction should remain opt-in until report grouping and golden tests are in place.

## Backfill Review Role Closeout

Archived from `context/waves/2026-05-15-backfill-review-role/CLOSE.md`.

- **Mission:** Review the role system against the expanded compiler/typesetter and reverse backfill vision, then add missing review coverage.
- **Changes:** - Confirmed the existing roles already cover most of the expanded compiler and typesetter surface: - SOURCE for source/output document model and compile UX. - COMPOSE/PRESS/STAGE/PANEL for rendering, publishing, slides, and dashboards. - CACHE/PARSE/SCHEMA/BENCH/SIGNAL for compiler correctness, config semantics, tests, performance, and diagnostic quality. - Added BACKFILL as the missing reverse-adoption specialist. - Updated `.roles/ROLE.md` from twelve to thirteen roles. - Added BACKFILL to tiebreaker ranking, role tensions, and usage guidance. - Added `.roles/backfill.md` with lenses for round-trip fidelity, extraction confidence, provenance, cutover, and adoption speed.
- **Validation:** - `git --no-pager diff --check`
- **Carry-forward:** Use BACKFILL whenever reviewing `mdloom backfill`, markdown-to-source migration, extraction confidence, round-trip comparison, or source-of-truth cutover plans.

## Backfill Table Extraction Closeout

Archived from `context/waves/2026-05-15-backfill-table-extraction/CLOSE.md`.

- **Mission:** Begin structured reverse compilation without weakening the literal-first adoption contract.
- **Changes:** - Added `mdloom backfill --extract-tables`. - Added table extraction plumbing through `cmd_backfill` and `mdloom_lib::backfill`. - Reused the existing markdown table parser so extraction skips fenced code blocks consistently with markdown table checks. - Writes high-confidence markdown pipe tables to sibling sidecar files named `<stem>.tables.json`. - Sidecar data includes schema version, original markdown path, table id, source line, heading context, headers, and trimmed row cells. - Backfill reports now include `summary.tables_extracted` and per-file extraction entries with kind, sidecar path, confidence, line, row count, and column count. - Kept generated `.source.md` output literal-first even when extraction is enabled. - Updated README and SPEC for the implemented table extraction surface.
- **Validation:** - `cargo test binary_backfill_extract_tables_writes_sidecar_data` - `cargo test binary_backfill_report_classifies_candidate_blocks` - `cargo test binary_backfill_literal_generates_source_and_report` - `cargo fmt && cargo test && cargo build && git --no-pager diff --check` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Next extraction work should handle ASCII tables and chart-like blocks behind explicit flags with confidence thresholds, fallback provenance, and round-trip review gates before changing generated markdown.

## Check Command Args Closeout

Archived from `context/waves/2026-05-15-check-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the `mdloom check` argument shape into the check command module.
- **Changes:** - Added `cmd_check::Args` with the clap argument definitions for `mdloom check`. - Replaced the inline `Command::Check { ... }` fields in `main.rs` with a tuple variant that references `cmd_check::Args`. - Kept default check path resolution and global flag handling in `main.rs`. - Preserved the existing check help and file-count regressions.
- **Validation:** - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Other command argument groups can be migrated module-by-module where the move reduces `main.rs` without obscuring the public CLI structure.

## Check Command Module Closeout

Archived from `context/waves/2026-05-15-check-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the default lint command, `mdloom check`.
- **Changes:** - Added `src/cmd_check.rs`. - Moved check orchestration out of `main.rs`, including DaVinci validation, unused-figure scanning, diagnostic filtering/sorting, output rendering, deduplication, summary printing, and `.mdloom/last-check.json` writing. - Kept clap/default-path handling in `main.rs` and passed command/global flags through a focused `cmd_check::Options` struct. - Preserved the existing check regression that verifies selected file counts honor include/exclude config.
- **Validation:** - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom fix`, `mdloom resolve`, and `mdloom depends` remain in `main.rs`; `fix` is the next natural extraction target because its plan application is already encapsulated in mdloom_lib and has an existing CLI regression.

## Check Dispatch Flags Closeout

Archived from `context/waves/2026-05-15-check-dispatch-flags/CLOSE.md`.

- **Mission:** Continue simplifying the CLI shell after command argument modularization by moving check-specific dispatch flag aggregation into the check command module.
- **Changes:** - Added `cmd_check::Flags` as the normalized check-specific option state. - Added `cmd_check::Args::flags()` to derive runtime flags from clap arguments. - Replaced mutable `main.rs` locals for `--daVinci`, `--by-code`, `--deduplicate`, and `--unused` with a single `cmd_check::Flags` value. - Kept default check path routing and global CLI options in `main.rs`. - Kept check behavior and output unchanged.
- **Validation:** - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** With command argument shapes and check flag normalization complete, future CLI cleanup can focus on dispatch ergonomics and separating default-check routing from command dispatch.

## Check Global Adapter Closeout

Archived from `context/waves/2026-05-15-check-global-adapter/CLOSE.md`.

- **Mission:** Move the remaining check-specific global option adaptation out of `main.rs` and into the check command module.
- **Changes:** - Added `cmd_check::Options::from_globals` to convert CLI global options into check runtime options. - Added `cmd_check::run_with_globals` so both explicit and default check routes can call the check module directly. - Removed the `run_check` helper from `main.rs`. - Kept explicit `mdloom check`, implicit default check, and global flag behavior unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `main.rs` is now a thin dispatcher. Future cleanup should focus on readability of command routing rather than moving behavior back into the shell.

## Check Path Helper Closeout

Archived from `context/waves/2026-05-15-check-path-helper/CLOSE.md`.

- **Mission:** Keep command path defaulting in command helper modules instead of individual command implementations.
- **Changes:** - Added `cmd_paths::check_paths_or_cwd`. - Updated `cmd_check` to use the shared helper for both explicit `mdloom check` and default-check routing. - Removed the duplicate private path fallback helper from `cmd_check`. - Preserved check behavior: command paths win, top-level default-check paths are honored next, and current directory remains the final fallback.
- **Validation:** - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_stats_command_runs` - `cargo test runner_path_summary_counts_file_and_directory_inputs` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Keep command-specific path fallback helpers in `cmd_paths` when the behavior is shared across dispatch routes or differs from ordinary cwd fallback.

## CLI Command Shell Cleanup Closeout

Archived from `context/waves/2026-05-15-cli-command-shell-cleanup/CLOSE.md`.

- **Mission:** Follow the command-module extraction by simplifying the now-thin CLI shell in `main.rs`.
- **Changes:** - Removed a dead pre-dispatch match that no longer performed any work. - Added shared path-defaulting helpers for command paths and default `check` paths. - Replaced repeated empty-path-to-current-directory branches for `draft`, `stats`, `compile`, and default `check` dispatch. - Kept command modules responsible for command behavior while `main.rs` remains focused on clap types and dispatch.
- **Validation:** - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The command architecture is now module-oriented. Future cleanup can move clap argument structs/enums into their command modules where that improves readability without making the public CLI less discoverable.

## CLI Dispatch Input Closeout

Archived from `context/waves/2026-05-15-cli-dispatch-input/CLOSE.md`.

- **Mission:** Make the CLI-to-dispatch boundary explicit by replacing positional tuple output with a named dispatch input.
- **Changes:** - Added `cli::DispatchInput` with named `command`, `top_level_paths`, and `globals` fields. - Replaced `Cli::into_parts()` with `Cli::into_dispatch()`. - Updated dispatch to destructure the named boundary type instead of relying on tuple order. - Tightened `cmd_init::run` visibility to `pub(crate)`.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_init_command_writes_default_config` - `cargo test binary_check_summary_file_count_honors_include_exclude` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** The dispatch boundary is now named. If more dispatch context appears, prefer adding fields to `DispatchInput` or command-owned adapters over adding positional tuples.

## CLI Dispatch Module Closeout

Archived from `context/waves/2026-05-15-cli-dispatch-module/CLOSE.md`.

- **Mission:** Move command routing out of `main.rs` so the binary entry point only parses and delegates.
- **Changes:** - Added `src/dispatch.rs` to own command routing. - Moved explicit command dispatch, default check routing, and shared path default usage out of `main.rs`. - Updated `main.rs` to declare modules, parse `Cli`, and call `dispatch::run`. - Kept parser ownership in `cli.rs` and command behavior ownership in command modules. - Kept public CLI behavior unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_draft_command_writes_plan` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `main.rs` is now parse-and-delegate only. Future CLI architecture work should focus on dispatch readability and shared command adapter patterns in `dispatch.rs`.

## CLI Dispatch Routing Closeout

Archived from `context/waves/2026-05-15-cli-dispatch-routing/CLOSE.md`.

- **Mission:** Continue simplifying `main.rs` by separating explicit command dispatch from the default check route.
- **Changes:** - Added a `run(Cli)` entry point so `main()` only parses and delegates. - Destructured `Cli` once before dispatch, avoiding follow-up matching against the parsed command state. - Routed explicit `mdloom check` and implicit default check through a shared `run_check` helper. - Kept global options, top-level default check paths, and command behavior unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Future CLI cleanup can continue reducing dispatch boilerplate where command modules can own small adapter functions without hiding public CLI behavior.

## CLI Global Accessors Closeout

Archived from `context/waves/2026-05-15-cli-global-accessors/CLOSE.md`.

- **Mission:** Keep the root CLI parser and global option bundle encapsulated after command routing moved into dispatch.
- **Changes:** - Made root `Cli` parser fields private; only `Cli::into_parts()` exposes parsed command, top-level paths, and globals. - Made `GlobalOptions` fields private. - Added explicit accessors for global config, format, errors-only, no-fail, and output options. - Updated dispatch and check global adaptation to use those accessors instead of reading fields directly.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_config_prints_effective_cascaded_config` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Dispatch is now close to pure routing. Future waves can move config-aware command adapters into command modules to reduce the remaining dispatch/context coupling.

## CLI Global Context Closeout

Archived from `context/waves/2026-05-15-cli-global-context/CLOSE.md`.

- **Mission:** Keep parser-owned data decomposition in the CLI module so `main.rs` receives a small dispatch-ready shape.
- **Changes:** - Moved `GlobalOptions` from `main.rs` into `src/cli.rs`. - Added `Cli::into_parts()` to decompose the parsed CLI into command, top-level default-check paths, and global options. - Updated `main.rs` to use `cli.into_parts()` instead of destructuring every root parser field itself. - Kept command dispatch behavior and public CLI flags unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue keeping parser ownership in `cli.rs` and behavior ownership in command modules; `main.rs` should stay focused on dispatch and shared path defaults.

## CLI Global Options Closeout

Archived from `context/waves/2026-05-15-cli-global-options/CLOSE.md`.

- **Mission:** Continue reducing dispatch plumbing in `main.rs` by grouping root-level global options into one context value.
- **Changes:** - Added a `GlobalOptions` dispatch context for root `--config`, `--format`, `--errors-only`, `--no-fail`, and `--output` values. - Updated command dispatch to pass `globals.config` to commands that need the optional config override. - Updated `run_check` to accept `&GlobalOptions` instead of a long parameter list. - Kept command behavior and public CLI flags unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Future CLI cleanup can continue reducing command dispatch boilerplate where command modules can own small adapter functions without hiding public CLI behavior.

## CLI Lint Summary Helper Closeout

Archived from `context/waves/2026-05-15-cli-lint-summary-helper/CLOSE.md`.

- **Mission:** Remove duplicated CLI orchestration for linting paths now that the runner owns file-vs-directory summary behavior.
- **Changes:** - Added `lint_paths(paths, config_override)` in `main.rs`. - The helper loads the effective config for each input, builds the appropriate runner, calls `Runner::run_path_summary`, and aggregates diagnostics plus file counts into one `RunSummary`. - Updated `mdloom check`, `mdloom stats`, and `mdloom draft` to use the helper.
- **Validation:** - Reuse the check/stats file-count regressions and full test suite. - Draft uses the same helper but still builds its plan from diagnostics only. - `cargo test runner_path_summary_counts_file_and_directory_inputs` - `cargo test binary_stats_file_count_honors_include_exclude` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** This helper is a stepping stone toward splitting command handlers out of `main.rs`: future `cmd_check`, `cmd_stats`, and `cmd_draft` modules can share the same lint orchestration boundary instead of each reconstructing it.

## CLI Parser Module Closeout

Archived from `context/waves/2026-05-15-cli-parser-module/CLOSE.md`.

- **Mission:** Continue slimming `main.rs` by moving the root clap parser and command enum into a dedicated CLI module.
- **Changes:** - Added `src/cli.rs` to own the root `Cli` parser and `Command` enum. - Updated `main.rs` to import `cli::{Cli, Command}` and keep only module wiring, dispatch, and default check routing. - Kept command-specific argument shapes owned by their command modules. - Preserved the public clap help/version surface.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Future CLI cleanup can focus on dispatch ergonomics and separating default-check routing from explicit command dispatch.

## CLI Path Defaults Closeout

Archived from `context/waves/2026-05-15-cli-path-defaults/CLOSE.md`.

- **Mission:** Keep CLI path default semantics with the parser-owned CLI module instead of the dispatch shell.
- **Changes:** - Moved `paths_or_cwd` from `main.rs` into `src/cli.rs`. - Moved `check_paths_or_cwd` from `main.rs` into `src/cli.rs`. - Updated `main.rs` dispatch to import and use the CLI-owned path default helpers. - Kept draft, stats, compile, explicit check, and default check path behavior unchanged.
- **Validation:** - `cargo test binary_draft_command_writes_plan` - `cargo test binary_stats_command_runs` - `cargo test cli_compile_output_dir_flag` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** With parser decomposition and path defaults in `cli.rs`, `main.rs` can stay a thin dispatcher over command modules and shared check routing.

## CLI Path Extraction Closeout

Archived from `context/waves/2026-05-15-cli-path-extraction/CLOSE.md`.

- **Mission:** Make dispatch path handling more declarative by centralizing command-path extraction with CLI default semantics.
- **Changes:** - Added `cli::take_paths_or_cwd` for commands whose path vectors default to the current directory. - Added `cli::take_check_paths_or_cwd` for explicit/default check routing, where top-level paths can supply the default check targets. - Replaced repeated `std::mem::take(&mut args.paths)` calls in `dispatch.rs` with the new helpers. - Kept draft, stats, compile, explicit check, and default check path behavior unchanged.
- **Validation:** - `cargo test binary_draft_command_writes_plan` - `cargo test binary_stats_command_runs` - `cargo test cli_compile_output_dir_flag` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Keep parser/path-default semantics in `cli.rs` and command routing in `dispatch.rs`; future cleanup should improve routing readability without moving behavior back into `main.rs`.

## Command Args Privacy Closeout

Archived from `context/waves/2026-05-15-command-args-privacy/CLOSE.md`.

- **Mission:** Complete the command argument encapsulation pass after dispatch stopped reading command fields directly.
- **Changes:** - Made command argument fields private across check, compile, config, depends, draft, fix, layout, pin, resolve, spec-generate, stats, status, and tree. - Kept the command argument structs themselves `pub(crate)` so the root CLI enum can still expose subcommand variants to dispatch. - Made the tree subcommand action enum module-private. - Preserved clap parsing and all command behavior; dispatch continues to route through module-owned `run` functions and path accessors.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_stats_by_tag_reports_source_frontmatter` - `cargo test binary_layout_composes_file_sources` - `cargo test binary_pin_appends_davinci_entry` - `cargo test binary_tree_generate_prints_dirtree` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** The remaining root CLI fields and global option fields can be wrapped behind accessors/adapters in a later shell-hardening wave.

## Command Args Visibility Closeout

Archived from `context/waves/2026-05-15-command-args-visibility/CLOSE.md`.

- **Mission:** Tighten command module encapsulation after dispatch stopped destructuring most command argument structs.
- **Changes:** - Narrowed remaining `pub` fields on `cmd_compile::Args` to `pub(crate)`. - Narrowed remaining `pub` fields on `cmd_layout::Args` to `pub(crate)`. - Narrowed `cmd_check::Args`, `cmd_check::Flags`, and `cmd_check::Options` fields so check internals are no more visible than dispatch requires. - Kept clap parsing, command dispatch, and command behavior unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test cli_compile_output_dir_flag` - `cargo test binary_layout_composes_file_sources` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue preferring module-owned adapters and narrow visibility as command modules stabilize.

## Command Config Global Adapters Closeout

Archived from `context/waves/2026-05-15-command-config-global-adapters/CLOSE.md`.

- **Mission:** Move remaining global config plumbing out of dispatch and into config-aware command modules.
- **Changes:** - Added command-owned global adapters for compile, config, draft, pin-list, spec-generate, and stats. - Made each adapter pass the global config override to its module-private implementation. - Updated dispatch to route by command without passing raw `globals.config()` into individual command implementations. - Preserved explicit `--config` behavior and command output.
- **Validation:** - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_stats_command_runs` - `cargo test binary_draft_command_writes_plan` - `cargo test cli_compile_output_dir_flag` - `cargo test binary_pin_list_prints_registered_davinci_entries` - `cargo test binary_spec_generate_static_outputs_toml` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Dispatch is now mostly command selection plus context forwarding. A later wave can consider a `DispatchContext` wrapper if more shared context appears.

## Command Global Options Module Closeout

Archived from `context/waves/2026-05-15-command-global-options-module/CLOSE.md`.

- **Mission:** Separate command execution context from the CLI parser module.
- **Changes:** - Added `cmd_context::GlobalOptions`. - Moved global option construction and accessors out of `cli.rs`. - Updated config-aware command modules and dispatch to import global options from the command context module. - Kept `cli.rs` focused on clap parser types and the dispatch input boundary. - Preserved all global option behavior.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_stats_command_runs` - `cargo test cli_compile_output_dir_flag` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Command execution context should live outside parser modules. If additional shared command context appears, add it to command context modules rather than growing `cli.rs`.

## Command-Owned Dispatch Context Closeout

Archived from `context/waves/2026-05-15-command-owned-dispatch-context/CLOSE.md`.

- **Mission:** Make the dispatch routing context own the selected command along with globals and default-check paths.
- **Changes:** - Added `command: Option<Command>` to `DispatchContext`. - Changed `dispatch::run` to build an owned context and call `run()` directly. - Kept parser-to-dispatch conversion behind `DispatchContext::from_cli` and `DispatchContext::from_input`. - Preserved all explicit command routing and default-check behavior.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_stats_command_runs` - `cargo test cli_compile_output_dir_flag` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Keep `dispatch::run` as a shallow shell. Future routing state should be added to the owned dispatch context rather than threaded through positional arguments.

## Command Path Accessors Closeout

Archived from `context/waves/2026-05-15-command-path-accessors/CLOSE.md`.

- **Mission:** Keep command path extraction owned by command modules instead of exposing path fields to dispatch.
- **Changes:** - Added `take_paths()` accessors to check, compile, draft, and stats command argument structs. - Narrowed draft, stats, and compile path fields so dispatch no longer reaches into those command internals. - Updated CLI path default helpers to consume command-owned path accessors. - Preserved existing cwd defaulting and top-level `mdloom PATH` check routing.
- **Validation:** - `cargo test cli_compile_output_dir_flag` - `cargo test binary_draft_command_writes_plan` - `cargo test binary_stats_command_runs` - `cargo test cli_mdloom_version_exits_zero` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue moving any remaining dispatch-time command data shaping behind module-owned adapters before tightening command argument visibility further.

## Command Path Default Adapters Closeout

Archived from `context/waves/2026-05-15-command-path-default-adapters/CLOSE.md`.

- **Mission:** Move command-specific path defaulting out of dispatch so routing stays close to a pure command match.
- **Changes:** - Let compile, draft, and stats own their own cwd fallback for empty path lists. - Removed the generic dispatch-side path extraction trait/helper that only served those commands. - Moved check/default-check path fallback rules into `cmd_check`. - Narrowed check internals further by making check flags, options, and low-level runner functions module-private. - Kept the root `mdloom PATH` default-check behavior unchanged.
- **Validation:** - `cargo test cli_compile_output_dir_flag` - `cargo test binary_draft_command_writes_plan` - `cargo test binary_stats_command_runs` - `cargo test binary_stats_by_tag_reports_source_frontmatter` - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test cli_mdloom_version_exits_zero` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Dispatch now routes commands without inspecting command flags or paths. Future waves can reduce remaining config coupling by giving config-aware command modules small global-context adapters.

## Command Path Helper Module Closeout

Archived from `context/waves/2026-05-15-command-path-helper-module/CLOSE.md`.

- **Mission:** Keep the CLI parser module focused on parsing by moving shared command path defaulting into a command helper module.
- **Changes:** - Added `cmd_paths::paths_or_cwd`. - Removed the shared cwd path helper from `cli.rs`. - Updated compile, draft, and stats to use the command helper module. - Registered the helper module in the binary shell. - Preserved cwd fallback behavior for empty command path lists.
- **Validation:** - `cargo test cli_compile_output_dir_flag` - `cargo test binary_draft_command_writes_plan` - `cargo test binary_stats_command_runs` - `cargo test binary_stats_by_tag_reports_source_frontmatter` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Keep parser-specific types in `cli.rs`; put shared command execution helpers in command-owned modules instead of growing the parser module again.

## Compile Command Args Closeout

Archived from `context/waves/2026-05-15-compile-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the `mdloom compile` argument shape into the compile command module.
- **Changes:** - Added `cmd_compile::Args` with the clap argument definitions for `mdloom compile`. - Replaced the inline `Command::Compile { ... }` fields in `main.rs` with a tuple variant that references `cmd_compile::Args`. - Kept default compile path normalization in `main.rs` while command behavior remains in `cmd_compile`. - Preserved compile help and output-dir routing regressions.
- **Validation:** - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test cli_compile_output_dir_flag` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The remaining command variants can be converted to module-owned clap argument structs in small batches, prioritizing larger variants first.

## Compile Command Module Closeout

Archived from `context/waves/2026-05-15-compile-command-module/CLOSE.md`.

- **Mission:** Complete the command-module split for the largest remaining command, `mdloom compile`.
- **Changes:** - Added `src/cmd_compile.rs`. - Moved normal compile orchestration out of `main.rs`, including output-dir routing, compile target discovery, violation rendering, stale-output deletion, progress output, and exit behavior. - Moved compile watch mode and its helper functions out of `main.rs`, including watch target discovery, initial compile pass, mdpath dependency indexing, and per-source recompilation. - Updated `main.rs` so compile dispatch only normalizes default paths and calls `cmd_compile::run` or `cmd_compile::run_watch`. - Preserved the existing CLI regression that verifies `--output-dir` routing.
- **Validation:** - `cargo test cli_compile_output_dir_flag` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The top-level CLI dispatch is now module-oriented for command implementations. Future cleanup can focus on extracting shared command option structs or moving remaining default-path normalization out of `main.rs`.

## Compiler Typesetter Spec Closeout

Archived from `context/waves/2026-05-15-compiler-typesetter-spec/CLOSE.md`.

- **Mission:** Update the project bible so future work is judged against mdloom as a staged document compiler and LaTeX-style markdown-native typesetter, not only a linter.
- **Changes:** - Bumped `design/SPEC.md` to v0.3. - Rewrote the purpose around source trees, reference-aware compilation, rendered artifacts, stable diagnostics, and deterministic repair. - Added a compiler/typesetter model covering source, resolve, compile/typeset, check, and plan/fix layers. - Made the CLI architecture boundary part of the spec: `main.rs -> cli parser -> dispatch context -> command adapters -> mdloom_lib`. - Updated backlog, skills, documentation, tests, and non-goals toward corpus compile graphs, tag-driven operations, artifact manifests, and golden source-to-artifact tests.
- **Validation:** - `git --no-pager diff --check`
- **Carry-forward:** Future features should map to compiler phases and artifact contracts before implementation. Source frontmatter tags should become selection and policy inputs for compile/check/report slices rather than remaining only summaries.

## Config Command Module Closeout

Archived from `context/waves/2026-05-15-config-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the small, stabilized `mdloom config` command.
- **Changes:** - Added `src/cmd_config.rs`. - Moved effective-config printing out of `main.rs`. - Preserved automatic cascade behavior for `mdloom config [PATH]`. - Preserved explicit `--config` behavior through `mdloom_lib::lint::load_config_for_path`.
- **Validation:** - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_config_honors_explicit_config_override` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `cmd_check` remains the main lint-facing extraction. Small command extractions can continue first, but `check` is the highest-value split once output helpers are ready to move.

## Depends Command Module Closeout

Archived from `context/waves/2026-05-15-depends-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the reverse dependency lookup command, `mdloom depends`.
- **Changes:** - Added `src/cmd_depends.rs`. - Moved reverse dependency lookup, mdloom-root discovery from the current directory, text rendering, and JSON rendering out of `main.rs`. - Preserved existing root handling: `--root` when supplied, nearest ancestor `mdloom.toml` otherwise, and current directory as the fallback. - Added a CLI regression that scans a `.source.md` mdloom fence and verifies JSON output reports the reference.
- **Validation:** - `cargo test binary_depends_prints_json_references` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom tree`, `mdloom spec-generate`, `mdloom compile`, and `mdloom layout` remain in `main.rs`; `tree` is the next contained command-family extraction candidate.

## Directive Parser Boundary Closeout

Archived from `context/waves/2026-05-15-directive-classifier-module/CLOSE.md`.

- **Mission:** Start reducing `compile.rs` into compiler phase modules without changing source syntax or renderer behavior.
- **Changes:** - Added `mdloom_lib::compile_directive`. - Moved mdloom directive kind classification out of `compile.rs`. - Moved mdloom directive fence span scanning out of `compile.rs`. - Moved mdloom directive header attribute slicing out of `compile.rs` and onto `DirectiveSpan`. - Moved shared directive `key=value` attribute extraction out of `compile.rs`. - Moved `mdloom:element` directive attribute/kind/source/field/inline-value parsing out of `compile.rs`. - Moved `mdloom:row` foreach/separator/width/no-chrome and row-element body parsing out of `compile.rs`. - Moved `mdloom:tree` directive attribute/kind/source/inline-body parsing out of `compile.rs`. - Moved `mdloom:layout` directive attribute/body URI parsing and config conversion out of `compile.rs`. - Moved `mdloom:chart` directive attribute/source/field/body parsing out of `compile.rs`. - Moved `mdloom:math` directive attribute/expression-body parsing out of `compile.rs`. - Moved `mdloom:toc` directive payload parsing out of `compile.rs`. - Moved `mdloom:xref` directive payload parsing out of `compile.rs`. - Moved `mdloom:blockquote` directive attribute/text-body parsing out of `compile.rs`. - Moved `mdloom:symbol` directive payload parsing out of `compile.rs`. - Moved `mdloom:shape` directive payload parsing behind the directive parser boundary. - Moved `mdloom:region` directive name/body parsing out of `compile.rs`. - Moved `mdloom:include` directive pin/body URI parsing out of `compile.rs`. - Moved `mdloom:table` directive payload parsing out of `compile.rs`. - Moved typed `Directive` ownership and directive collection into `compile_directive`; kept `compile.rs` as the compile/render facade. - Moved the public quick-inspection `parse_directives` implementation behind `compile_directive`. - Added `mdloom_lib::compile_prose` and moved prose-only `mdloom:xref` and `mdloom:blockquote` rendering helpers out of `compile.rs`. - Added `mdloom_lib::compile_source` and moved shared compile-time source resolution out of `compile.rs`. - Added `mdloom_lib::compile_chart` and moved `mdloom:chart` data resolution and markdown table extraction out of `compile.rs`. - Added `mdloom_lib::compile_tree` and moved inline tree/outline rendering helpers out of `compile.rs`. - Added `mdloom_lib::compile_toc` and moved `mdloom:toc` heading collection, section narrowing, and list/tree/numbered formatting out of `compile.rs`. - Preserved existing directive aliases, including `mdloom:numbered-list` and `mdloom:ol` mapping to `ol`. - Added focused unit coverage for known directive kinds, aliases, unknown directives, and non-mdloom fences. - Re-ran existing compile parser coverage to prove behavior stayed stable.
- **Validation:** - `cargo test classifies_known_directive_kinds` - `cargo test ignores_unknown_or_non_mdloom_fences` - `cargo test scans_directive_spans_with_body_and_closing_line` - `cargo test scans_multiple_directive_spans` - `cargo test slices_directive_header_attrs` - `cargo test extracts_quoted_and_unquoted_attr_values` - `cargo test extract_attr_value_respects_word_boundaries` - `cargo test parses_element_attrs_with_defaults_and_flags` - `cargo test parses_element_directive_kind_source_field_and_inline_value` - `cargo test parses_tree_attrs_with_defaults_and_lists` - `cargo test parses_tree_directive_kind_source_and_inline_body` - `cargo test parses_layout_attrs_with_defaults_and_flags` - `cargo test parses_layout_directive_attrs_and_body_uris` - `cargo test parses_chart_attrs_with_defaults_and_aliases` - `cargo test parses_chart_directive_source_fields_and_inline_body` - `cargo test parses_math_attrs_with_defaults` - `cargo test parses_math_directive_attrs_and_expression_body` - `cargo test parses_toc_attrs_with_body_source_and_aliases` - `cargo test parses_toc_directive_payload` - `cargo test parses_xref_attrs_with_uri_source_and_body_fallback` - `cargo test parses_xref_directive_payload` - `cargo test parses_blockquote_attrs_with_defaults_and_aliases` - `cargo test parses_blockquote_directive_attrs_and_text_body` - `cargo test parses_symbol_attrs_with_defaults` - `cargo test parses_symbol_directive_payload` - `cargo test parses_shape_attrs_with_symbol_defaults` - `cargo test parses_shape_directive_payload` - `cargo test parses_region_directive_name_and_body` - `cargo test parses_include_directive_uri_and_pin` - `cargo test parses_table_uri_from_body` - `cargo test parses_table_directive_payload` - `cargo test parses_foreach_positional_and_source_attr_forms` - `cargo test parses_row_element_lines` - `cargo test parses_row_directive_attrs_and_elements` - `cargo test test_parse_include_directive` - `cargo test test_parse_layout_directive` - `cargo test test_parse_table_directive` - `cargo test test_parse_no_directives` - `cargo test test_parse_multiple_directives` - `cargo test test_collect_directives_include` - `cargo test test_collect_directives_row_explicit_separator` - `cargo test test_collect_directives_element_kind_value` - `cargo test test_parse_foreach_extracts_var_and_uri` - `cargo test test_parse_row_element_line_label` - `cargo test test_attrs_parse_gap` - `cargo test test_attrs_parse_labels_quoted` - `cargo test test_attrs_parse_border_flag` - `cargo test test_attrs_parse_combined` - `cargo test toc_directive_parses_section_attr` - `cargo test xref_parses_label_override` - `cargo test xref_parses_uri_and_format` - `cargo test xref` - `cargo test blockquote_collected_from_directive_block` - `cargo test blockquote` - `cargo test source` - `cargo test chart` - `cargo test tree` - `cargo test outline` - `cargo test toc` - `cargo test test_collect_directives_region` - `cargo test include_pin_attribute_parsed` - `cargo test compile_directive` - `cargo fmt && cargo test && cargo build && git --no-pager diff --check` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Next directive split work should continue extracting artifact-family renderers behind the compile facade.

## Dispatch Context Runner Closeout

Archived from `context/waves/2026-05-15-dispatch-context-runner/CLOSE.md`.

- **Mission:** Make `dispatch::run` a parse-and-delegate shell by moving command/default routing behind the dispatch context.
- **Changes:** - Added `DispatchContext::run(command)` as the single routing entry inside dispatch. - Reduced top-level `dispatch::run` to parse CLI input, extract the command, build context, and delegate. - Kept explicit command routing and default-check behavior unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test cli_compile_output_dir_flag` - `cargo test binary_draft_command_writes_plan` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Keep dispatch orchestration shallow: parse at the top, route inside context, and push command-specific behavior into command modules.

## Dispatch Context Closeout

Archived from `context/waves/2026-05-15-dispatch-context/CLOSE.md`.

- **Mission:** Name the shared routing context inside dispatch so command selection does not pass loose globals and top-level paths around.
- **Changes:** - Added a private `DispatchContext` wrapper in `dispatch.rs`. - Bundled global options and top-level default-check paths into the context. - Routed config-aware commands through `context.globals()`. - Routed explicit and default check paths through context methods. - Preserved command behavior while making the dispatch match read as command selection plus context forwarding.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test cli_compile_output_dir_flag` - `cargo test binary_pin_list_prints_registered_davinci_entries` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** If dispatch accumulates more helper behavior, keep it on `DispatchContext` or move it into command-owned adapters rather than adding ad hoc local plumbing.

## Dispatch Expression Routing Closeout

Archived from `context/waves/2026-05-15-dispatch-expression-routing/CLOSE.md`.

- **Mission:** Improve dispatch readability now that command routing lives in `src/dispatch.rs`.
- **Changes:** - Refactored `dispatch::run` so the command routing is a single match expression. - Removed repeated early `return` statements from each command branch. - Moved the implicit default-check route into the `None` branch of the same expression. - Kept explicit command behavior and default check behavior unchanged.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_draft_command_writes_plan` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Future dispatch work can focus on command grouping or reducing config override plumbing, but the routing shell should remain behavior-light.

## Dispatch Input Privacy Closeout

Archived from `context/waves/2026-05-15-dispatch-input-privacy/CLOSE.md`.

- **Mission:** Keep the named CLI dispatch boundary explicit without exposing its fields outside the CLI module.
- **Changes:** - Made `DispatchInput` fields private. - Added accessors for top-level paths and global options. - Added a consuming `take_command()` method for dispatch routing. - Changed `DispatchContext` to borrow `DispatchInput` instead of owning loose copies of its fields. - Preserved command routing and default-check behavior.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_help_documents_progress_only_for_compile` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Keep parse-boundary state private to the CLI module; add named accessors for new dispatch needs rather than exposing fields directly.

## Draft Command Args Closeout

Archived from `context/waves/2026-05-15-draft-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the `mdloom draft` argument shape into the draft command module.
- **Changes:** - Added `cmd_draft::Args` with the clap argument definitions for `mdloom draft`. - Replaced the inline `Command::Draft { ... }` fields in `main.rs` with a tuple variant that references `cmd_draft::Args`. - Kept default path handling in `main.rs` through the shared `paths_or_cwd` helper. - Kept draft-plan generation behavior in `cmd_draft::run` unchanged. - Preserved the draft CLI regression that writes a DraftPlan-shaped JSON file.
- **Validation:** - `cargo test binary_draft_command_writes_plan` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue migrating command argument groups from `main.rs` into their command modules in small, independently validated waves.

## Draft Command Module Closeout

Archived from `context/waves/2026-05-15-draft-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting `mdloom draft`, which now shares library lint orchestration with `check` and `stats`.
- **Changes:** - Added `src/cmd_draft.rs`. - Moved the `draft` command implementation out of `main.rs`. - Kept CLI dispatch, output text, and draft-plan JSON generation behavior unchanged. - Added an E2E regression that verifies `mdloom draft -o <path> <input>` writes a DraftPlan-shaped JSON file.
- **Validation:** - `cargo test binary_draft_command_writes_plan` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `cmd_check` is the largest remaining lint-facing command extraction. It should reuse `mdloom_lib::lint::lint_paths` and leave formatting/output helpers either in main for now or in a later renderer module.

## Effective Config Command Close

Archived from `context/waves/2026-05-15-effective-config-command/CLOSE.md`.

- **Outcome:** Implemented the documented `mdloom config [PATH]` behavior: - `mdloom config [PATH]` now prints the resolved effective config as TOML. - Auto mode resolves PATH through normal config cascade. - Explicit `--config` mode prints the supplied config with defaults and skips auto-cascade. - Config structs now derive `Serialize` so effective config output is generated from the real data model rather than a hand-written summary.
- **Tests Added:** - `binary_config_prints_effective_cascaded_config` - `binary_config_honors_explicit_config_override`
- **Validation:** - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_config_honors_explicit_config_override` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom config` now exposes the current effective model. A future raw/effective config split should keep this command backed by the effective, post-resolution view.

## Explicit Config Failure Close

Archived from `context/waves/2026-05-15-explicit-config-failure/CLOSE.md`.

- **Outcome:** Made explicit `--config` authoritative across CLI paths that load mdloom config: - `load_config` now returns `Result<MdloomConfig>`. - Explicit config load errors are propagated with context instead of warning and falling back to discovered/default config. - Check, stats, draft, compile, watch, pin-list, and spec-generate config loads now propagate explicit config failures.
- **Tests Added:** - `binary_missing_config_override_fails_loudly` - `binary_invalid_config_override_fails_loudly` Existing `binary_stats_honors_config_override` continues to cover the successful explicit-config path.
- **Validation:** - `cargo test binary_missing_config_override_fails_loudly` - `cargo test binary_invalid_config_override_fails_loudly` - `cargo test binary_stats_honors_config_override` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The deeper raw/effective config split remains the preferred architecture for future cascade work. This wave only removes the unsafe explicit-config fallback.

## Extends Cascade Semantics Close

Archived from `context/waves/2026-05-15-extends-cascade-semantics/CLOSE.md`.

- **Outcome:** Aligned `extends` behavior with the config contract: - A config that declares `extends = ".../base.toml"` now loads that explicit parent and stops automatic ancestor discovery. - The effective merge order is explicit parent first, then extending child. - Ordinary directory cascade without `extends` remains additive from root to nearest child.
- **Tests Added:** - `config_extends_stops_automatic_ancestor_cascade` Existing `config_cascade_additive_required_sections` continues to cover normal ancestor + child cascade.
- **Validation:** - `cargo test config_extends_stops_automatic_ancestor_cascade` - `cargo test config_cascade_additive_required_sections` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The raw/effective config split remains the larger cleanup target. This wave focuses only on correcting the explicit-parent stop condition.

## Fix Command Args Closeout

Archived from `context/waves/2026-05-15-fix-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the `mdloom fix` argument shape into the fix command module.
- **Changes:** - Added `cmd_fix::Args` with the clap argument definitions for `mdloom fix`. - Replaced the inline `Command::Fix { ... }` fields in `main.rs` with a tuple variant that references `cmd_fix::Args`. - Kept fix plan loading, dry-run/apply behavior, confidence parsing, and verification behavior in `cmd_fix::run` unchanged. - Preserved the fix CLI regression that verifies dry-run mode writes nothing.
- **Validation:** - `cargo test binary_fix_dry_run_writes_nothing` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Only the tree command wrapper still has inline clap structure in `main.rs`; move that final wrapper into `cmd_tree` in a follow-up wave.

## Fix Command Module Closeout

Archived from `context/waves/2026-05-15-fix-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the AI-assisted fix application command, `mdloom fix`.
- **Changes:** - Added `src/cmd_fix.rs`. - Moved fix plan loading, DraftPlan-to-FixPlan conversion, confidence parsing, dry-run/apply reporting, signal-check option wiring, and post-apply verification out of `main.rs`. - Preserved existing exit semantics for invalid confidence levels and remaining verification errors. - Preserved the existing CLI regression that verifies dry-run mode writes nothing.
- **Validation:** - `cargo test binary_fix_dry_run_writes_nothing` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom resolve` and `mdloom depends` are now the smallest remaining command extractions; they share mdpath URI/root behavior and can be split in either order.

## Fix Pipeline Consistency Closeout

Archived from `context/waves/2026-05-15-fix-pipeline-consistency/CLOSE.md`.

- **Mission:** Bring `mdloom fix` into the same command architecture contract as check, stats, draft, and compile.
- **Changes:** - Routed `mdloom fix` through global command options. - Verification now uses the explicit global `--config` override instead of loading a default config independently. - Verification checks the files modified by the applied plan. - Extended `FixResult` with `modified_files` for precise downstream reporting. - Added `.mdloom/last-fix.json` for every successful fix command run. - The fix log records: - schema version - plan path - dry-run flag - minimum confidence - applied/skipped counts - modified file count and paths - verification status, errors, warnings, config, and paths - Added integration coverage proving explicit `--config` is honored during verification and the structured log is written. - Updated README, SPEC, session plan, and wave history.
- **Validation:** - `cargo test binary_fix_uses_global_config_for_verification_and_writes_log` - `cargo test binary_fix_dry_run_writes_nothing` - `cargo test fix_plan_confidence_filtering` - `cargo fmt && cargo test && cargo build && git --no-pager diff --check` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Future fix work should connect `.mdloom/last-fix.json` to `mdloom status` and extend the log with per-fix skip details if review tooling needs a richer audit trail.

## Generation Dispatch Adapters Closeout

Archived from `context/waves/2026-05-15-generation-dispatch-adapters/CLOSE.md`.

- **Mission:** Continue reducing `main.rs` command dispatch boilerplate by letting generation and summary command modules consume their own argument structs.
- **Changes:** - Updated `cmd_draft::run` to accept `cmd_draft::Args` directly alongside the dispatch-normalized paths. - Updated `cmd_stats::run` to accept `cmd_stats::Args` directly alongside the dispatch-normalized paths. - Updated `cmd_spec_generate::run` to accept `cmd_spec_generate::Args` directly. - Simplified `main.rs` dispatch for `Command::Draft`, `Command::Stats`, and `Command::SpecGenerate`. - Kept path defaulting for draft and stats in `main.rs`, where shared CLI path semantics are already centralized. - Kept draft, stats, and spec-generate behavior unchanged.
- **Validation:** - `cargo test binary_draft_command_writes_plan` - `cargo test binary_stats_command_runs` - `cargo test cli_spec_generate_outputs_toml` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Apply the same module-owned dispatch adapter pattern to compile and layout once their path/output routing can stay readable.

## HTML Publish Target Closeout

Archived from `context/waves/2026-05-15-html-publish-target/CLOSE.md`.

- **Mission:** Prove that mdloom's compiler/typesetter model can publish beyond markdown without forking the source workflow.
- **Changes:** - Added `mdloom compile --target md|html`, with `md` as the default. - Added `mdloom_lib::publish` with a deterministic markdown-to-HTML document renderer for headings, paragraphs, and fenced code blocks. - HTML compilation resolves `.source.md` through the existing markdown compiler first, so source frontmatter stripping and directive expansion stay shared. - HTML outputs derive from source names when using `--output-dir` and accept explicit `-o` for single-file compiles. - Guarded `--watch` to `--target md` until watch-mode target tracking is modeled in the artifact manifest. - Preserved the existing markdown target behavior and fixed cached compile hits so an unchanged cached output is still counted as successfully compiled instead of falling through to source copying. - Added integration coverage for HTML output escaping and fenced code rendering. - Updated README and SPEC to frame HTML as the first publish target and PPTX as a future backend behind the compile graph.
- **Validation:** - `cargo test binary_compile_target_html_writes_html_document` - `cargo fmt && cargo test && cargo build && git --no-pager diff --check` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** The artifact manifest should record the target (`md`, `html`, future `pptx`), source path, output path, config root, and stale status before broadening watch mode or adding PPTX generation.

## Init Command Module Closeout

Archived from `context/waves/2026-05-15-init-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the self-contained `mdloom init` command.
- **Changes:** - Added `src/cmd_init.rs`. - Moved default `mdloom.toml` creation out of `main.rs`. - Updated dispatch to call `cmd_init::run`. - Reused the existing init E2E regression.
- **Validation:** - `cargo test binary_init_creates_default_mdloom_toml` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The small command modules are now mostly separated. Remaining high-value splits include `cmd_check`, `cmd_fix`, and the compile command family.

## Layout Command Args Closeout

Archived from `context/waves/2026-05-15-layout-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the `mdloom layout` argument shape into the layout command module.
- **Changes:** - Added `cmd_layout::Args` with the clap argument definitions for `mdloom layout`. - Replaced the inline `Command::Layout { ... }` fields in `main.rs` with a tuple variant that references `cmd_layout::Args`. - Kept layout behavior in `cmd_layout::run` unchanged. - Preserved the layout CLI regression that composes two file sources.
- **Validation:** - `cargo test binary_layout_composes_file_sources` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue migrating command argument groups from `main.rs` into their command modules in small, independently validated waves.

## Layout Command Module Closeout

Archived from `context/waves/2026-05-15-layout-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the figure composition command, `mdloom layout`.
- **Changes:** - Added `src/cmd_layout.rs`. - Moved layout option parsing, file/mdpath source resolution, figure content extraction, composition, and output-file handling out of `main.rs`. - Preserved existing behavior for empty source lists, alignment/direction parsing, `--root`, labels, wrapping, borders, and output routing. - Added a CLI regression that composes two temporary file sources and verifies both appear in the layout output.
- **Validation:** - `cargo test binary_layout_composes_file_sources` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom compile` is the last large command implementation remaining in `main.rs` and should be extracted with care because it includes normal and watch modes.

## Library Lint Orchestration Closeout

Archived from `context/waves/2026-05-15-library-lint-orchestration/CLOSE.md`.

- **Mission:** Turn the CLI-local lint summary helper into a reusable library boundary so future command-module extraction does not have to move orchestration logic again.
- **Changes:** - Added `src/lint.rs`. - Moved config loading for lint inputs into `load_config_for_path`. - Moved path aggregation into `lint_paths`. - Kept explicit `--config` semantics inside the shared boundary: explicit configs use `Runner::new_with_config`; automatic configs use normal runner cascade. - Exported `lint_paths` from `mdloom_lib`. - Updated `main.rs` to import the library helpers and removed the local duplicates.
- **Validation:** - `cargo fmt` - `cargo test runner_path_summary_counts_file_and_directory_inputs` - `cargo test binary_stats_file_count_honors_include_exclude` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The next command-split wave can move `cmd_check`, `cmd_stats`, or `cmd_draft` into a module while depending on `mdloom_lib::lint::lint_paths` instead of recreating config/runner orchestration.

## Loaded Config Explicitness Closeout

Archived from `context/waves/2026-05-15-loaded-config-explicitness/CLOSE.md`.

- **Mission:** Separate parser-only TOML explicitness from mdloom's effective runtime config without changing the public config schema or cascade behavior.
- **Changes:** - Removed `include_set` from `FilesConfig` and `enabled_set` from `MarkdownConfig`, so `MdloomConfig` is again a clean effective config shape. - Added an internal `LoadedConfig` layer that carries `ConfigExplicitness` while resolving cascades. - Updated cascade merge to use TOML-loaded explicitness for ambiguous defaults: `files.include = ["**/*.md"]` can still intentionally replace a parent include, and `markdown.enabled = false` can still intentionally disable inherited markdown checks. - Kept the public `merge(parent, child)` helper for effective configs, with explicitness inferred from non-default child values.
- **Tests:** - Added regression coverage for explicit default `files.include` replacement through real TOML cascade resolution. - Added regression coverage for explicit `markdown.enabled = false` overriding an enabled parent. - Re-ran the existing config cascade regressions.
- **Validation:** - `cargo fmt` - `cargo test config_` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The next deeper config cleanup is a full raw/effective model where every TOML section is represented as optional raw fields before resolving to the complete runtime `MdloomConfig`.

## Mdloom Architecture Config Boundary Close

Archived from `context/waves/2026-05-15-mdloom-architecture-config-boundary/CLOSE.md`.

- **Outcome:** Repaired two architecture drift points where config ownership crossed CLI and runner boundaries incorrectly: - Added an explicit-config runner path for `--config`, so check-like commands can apply the supplied config directly instead of re-resolving per-file config from disk. - Wired `mdloom stats --config` through the same config path instead of ignoring the override. - Preserved `files.include` cascade semantics by distinguishing omitted includes from explicitly set includes, including explicit values equal to the default.
- **Tests Added:** - `runner_explicit_config_skips_disk_cascade` - `binary_stats_honors_config_override` - `config_merge_default_child_include_preserves_parent_include` - `config_merge_explicit_default_child_include_replaces_parent_include`
- **Validation:** - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The larger architecture finding remains: `src/main.rs` and `src/compile.rs` are large orchestration modules. Future architecture waves should extract command handlers and compile directive families behind smaller module boundaries after the config boundary is stable.

## Named Run Summary Closeout

Archived from `context/waves/2026-05-15-named-run-summary/CLOSE.md`.

- **Mission:** Finish the runner/reporting API cleanup by replacing positional tuple results with a named summary type.
- **Changes:** - Added `RunSummary` with named `diagnostics` and `files_checked` fields. - Replaced `Runner::run_with_count()` with `Runner::run_summary()`. - Exported `RunSummary` from `mdloom_lib`. - Updated `mdloom check` and `mdloom stats` to read named summary fields.
- **Validation:** - Reuse the file-count regressions from the prior runner summary wave: `binary_stats_file_count_honors_include_exclude` and `binary_check_summary_file_count_honors_include_exclude`. - `cargo fmt` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** If runner reporting grows again, add fields to `RunSummary` rather than adding parallel return values or duplicating directory walks.

## Owned Dispatch Context Closeout

Archived from `context/waves/2026-05-15-owned-dispatch-context/CLOSE.md`.

- **Mission:** Make command routing own the parsed execution context instead of borrowing from a partially consumed CLI parser boundary.
- **Changes:** - Changed `DispatchContext` to own top-level default-check paths and global command options. - Added `DispatchInput` take-style accessors for command, top-level paths, and globals. - Updated dispatch routing to construct `(DispatchContext, command)` from one consumed `DispatchInput`. - Preserved command routing, global option propagation, and default-check path behavior.
- **Validation:** - `cargo test cli_mdloom_version_exits_zero` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_stats_command_runs` - `cargo test cli_compile_output_dir_flag` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Keep parser output consumption explicit at the dispatch boundary. New routing state should be owned by dispatch or command context modules, not borrowed from CLI parser structs.

## Pin Command Args Closeout

Archived from `context/waves/2026-05-15-pin-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the `mdloom pin` argument shape into the pin command module.
- **Changes:** - Added `cmd_pin::Args` with the clap argument definitions for `mdloom pin`. - Replaced the inline `Command::Pin { ... }` fields in `main.rs` with a tuple variant that references `cmd_pin::Args`. - Kept DaVinci pinning behavior in `cmd_pin::run` unchanged. - Preserved the pin CLI regression that appends a DaVinci entry to `mdloom.toml`.
- **Validation:** - `cargo test binary_pin_appends_davinci_entry` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue migrating command argument groups from `main.rs` into their command modules in small, independently validated waves.

## Pin Command Module Closeout

Archived from `context/waves/2026-05-15-pin-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the DaVinci pinning command, `mdloom pin`.
- **Changes:** - Added `src/cmd_pin.rs`. - Moved DaVinci URI resolution and config mutation out of `main.rs`. - Preserved the existing pin behavior: resolve the supplied `md://` URI, append a `[[davinci]]` entry, keep duplicate-id detection, and print follow-up guidance. - Added a CLI regression that verifies `mdloom pin` appends the expected DaVinci entry to `mdloom.toml`.
- **Validation:** - `cargo test binary_pin_appends_davinci_entry` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Larger commands remain in `main.rs`; `mdloom check` is the next natural extraction target because it owns more output/rendering decisions than the small commands completed so far.

## Pin List Command Module Closeout

Archived from `context/waves/2026-05-15-pin-list-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the small DaVinci listing command, `mdloom pin-list`.
- **Changes:** - Added `src/cmd_pin_list.rs`. - Moved DaVinci-entry listing out of `main.rs`. - Preserved explicit `--config` behavior through `mdloom_lib::lint::load_config_for_path`. - Added a CLI regression that verifies registered DaVinci entries are rendered.
- **Validation:** - `cargo test binary_pin_list_prints_registered_davinci_entries` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** The larger `mdloom pin` command still lives in `main.rs`; it is a natural follow-up once URI/config mutation behavior is covered by focused tests.

## Progress Surface Contract Close

Archived from `context/waves/2026-05-15-progress-surface-contract/CLOSE.md`.

- **Outcome:** Aligned the progress option contract with the actual CLI surface: - `--progress` is a `mdloom compile` option, where it already shows a running compiled/total count. - `mdloom check` does not expose `--progress`; the spec no longer advertises it as a check option. - Added a CLI help regression to ensure `check --help` does not list `--progress` while `compile --help` does.
- **Tests Added:** - `binary_help_documents_progress_only_for_compile`
- **Validation:** - `cargo test binary_help_documents_progress_only_for_compile` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** If check-time progress becomes desirable, it should be added deliberately with a runner API that can report per-file progress without giving up parallelism.

## Render Dispatch Adapters Closeout

Archived from `context/waves/2026-05-15-render-dispatch-adapters/CLOSE.md`.

- **Mission:** Finish the module-owned dispatch adapter pattern for render-oriented commands.
- **Changes:** - Updated `cmd_compile::run` to accept `cmd_compile::Args` directly alongside the dispatch-normalized paths. - Moved compile watch-vs-one-shot routing into `cmd_compile::run`. - Kept the one-shot compile implementation as an internal `run_once` helper and watch mode as an internal helper. - Updated `cmd_layout::run` to accept `cmd_layout::Args` directly. - Simplified `main.rs` dispatch for `Command::Compile` and `Command::Layout`. - Kept compile path defaulting in `main.rs`, where shared CLI path semantics are already centralized. - Kept compile and layout behavior unchanged.
- **Validation:** - `cargo test cli_compile_output_dir_flag` - `cargo test binary_layout_composes_file_sources` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** With command modules now consuming their own argument structs, future CLI cleanup can focus on the remaining default-check routing and root path helpers.

## Reporting Command Args Closeout

Archived from `context/waves/2026-05-15-reporting-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the reporting command argument shapes for `mdloom config`, `mdloom status`, and `mdloom stats` into their command modules.
- **Changes:** - Added `cmd_config::Args` with the clap argument definitions for `mdloom config`. - Added `cmd_status::Args` with the clap argument definitions for `mdloom status`. - Added `cmd_stats::Args` with the clap argument definitions for `mdloom stats`. - Replaced the inline `Command::Config { ... }`, `Command::Status { ... }`, and `Command::Stats { ... }` fields in `main.rs` with tuple variants that reference their command-module argument types. - Kept default stats path handling in `main.rs` through the shared `paths_or_cwd` helper. - Kept config, status, and stats behavior unchanged.
- **Validation:** - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_config_honors_explicit_config_override` - `cargo test binary_status_command_reports_project_summary` - `cargo test binary_stats_command_runs` - `cargo test binary_stats_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue migrating the few remaining command argument groups from `main.rs` into their command modules in small, independently validated waves.

## Reporting Dispatch Adapters Closeout

Archived from `context/waves/2026-05-15-reporting-dispatch-adapters/CLOSE.md`.

- **Mission:** Continue reducing `main.rs` command dispatch boilerplate by letting reporting command modules consume their own argument structs.
- **Changes:** - Updated `cmd_config::run` to accept `cmd_config::Args` directly. - Updated `cmd_status::run` to accept `cmd_status::Args` directly. - Simplified `main.rs` dispatch for `Command::Config` and `Command::Status` so it no longer destructures their fields. - Kept effective-config and status summary behavior unchanged.
- **Validation:** - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test binary_config_honors_explicit_config_override` - `cargo test binary_status_command_reports_project_summary` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Apply the same module-owned dispatch adapter pattern to other self-contained commands where it reduces boilerplate without obscuring CLI behavior.

## Resolve Command Module Closeout

Archived from `context/waves/2026-05-15-resolve-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the mdpath lookup command, `mdloom resolve`.
- **Changes:** - Added `src/cmd_resolve.rs`. - Moved mdpath URI parsing, element resolution, text rendering, and JSON rendering out of `main.rs`. - Preserved existing root handling: `--root` when supplied, current directory otherwise. - Added a CLI regression that resolves a heading URI in JSON format and verifies the resolved element metadata.
- **Validation:** - `cargo test binary_resolve_prints_json_for_heading` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom depends` is the next smallest remaining command extraction and shares the same mdpath-facing command surface.

## Reverse Backfill Spec Closeout

Archived from `context/waves/2026-05-15-reverse-backfill-spec/CLOSE.md`.

- **Mission:** Define how existing markdown systems can adopt mdloom quickly by generating reviewable `.source.md` candidates from current `.md` artifacts.
- **Changes:** - Added `mdloom backfill` as the reverse compiler/adoption bridge in `design/SPEC.md`. - Defined the backfill pipeline: inventory/classify, extract candidates, generate source, compile, compare, and report. - Added conservative extraction classes for literal markdown, ASCII figures, ASCII tables, markdown tables, chart-like blocks, repeated patterns, and ambiguous blocks. - Documented quick adoption with a safe upgrade path: mirror, inspect, improve, automate, adopt. - Added planned CLI options including `--literal-first`, `--check-roundtrip`, and `--cutover-plan`. - Added backlog items for the reverse/backfill command, classifiers, cutover plans, review skill, migration guide, and round-trip golden tests.
- **Validation:** - `git --no-pager diff --check`
- **Carry-forward:** Backfill should prioritize round-trip fidelity and reviewability before semantic extraction. Teams should be able to use mdloom automation against existing markdown before committing to generated artifacts as the source of truth.

## Runner Path Summary Closeout

Archived from `context/waves/2026-05-15-runner-path-summary/CLOSE.md`.

- **Mission:** Move file-vs-directory lint summary behavior into the runner boundary so CLI commands do not duplicate input-shape branching.
- **Changes:** - Added `Runner::run_path_summary(path)` for single files and directories. - Kept `Runner::run()` as a compatibility convenience over `run_summary()`. - Updated `mdloom check`, `mdloom stats`, and `mdloom draft` to consume `RunSummary` through the unified path API. - Added a regression that verifies file inputs count as one checked file while directory inputs count only runner-selected markdown files.
- **Validation:** - `cargo test runner_path_summary_counts_file_and_directory_inputs` - `cargo test binary_stats_file_count_honors_include_exclude` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** If commands need richer run metadata, add it to `RunSummary` and keep the file-vs-directory input semantics centralized in `Runner::run_path_summary`.

## Runner Summary API Close

Archived from `context/waves/2026-05-15-runner-summary-api/CLOSE.md`.

- **Outcome:** Reduced runner/reporting duplication introduced by actual file counts: - Replaced separate `Runner::file_count()` + `Runner::run()` directory flows with `Runner::run_with_count()`. - `run_with_count()` collects matching files once, returns the selected count, and lints that same file set in parallel. - `mdloom check` and `mdloom stats` now use the one-pass API for directory inputs.
- **Tests Reused:** - `binary_stats_file_count_honors_include_exclude` - `binary_check_summary_file_count_honors_include_exclude`
- **Validation:** - `cargo test binary_stats_file_count_honors_include_exclude` - `cargo test binary_check_summary_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** If more summary fields are needed, promote the tuple to a named `RunSummary` struct rather than adding more parallel return values.

## Source Frontmatter Tags Closeout

Archived from `context/waves/2026-05-15-source-frontmatter-tags/CLOSE.md`.

- **Mission:** Give ordinary `.source.md` files first-class source-only metadata for corpus, operation, and content tagging.
- **Changes:** - Added a generic source frontmatter parser for top-of-file `---` blocks. - Supported `tags`, `ops`, and `content_tags` / `content` metadata in inline list, scalar, and block-list forms. - Stripped frontmatter from ordinary `.source.md` compile output while preserving the source body. - Added `mdloom stats --by-tag` to summarize tag, op, and content-tag counts across the same files selected for stats. - Added status surface for source frontmatter/tag coverage. - Documented source frontmatter in README and the CLI spec.
- **Validation:** - `cargo test frontmatter` - `cargo test source_frontmatter_is_stripped_from_compile_output` - `cargo test binary_stats_by_tag_reports_source_frontmatter` - `cargo test runner_path_summary_counts_file_and_directory_inputs`
- **Carry-forward:** Tag metadata is passive in this wave. Future waves can use it for config selectors, check filters, compile routing, wave/pulse grouping, and content policy rules.

## Spec Alignment Implementation Plan Closeout

Archived from `context/waves/2026-05-15-spec-alignment-implementation-plan/CLOSE.md`.

- **Mission:** Review the refreshed compiler/typesetter/backfill spec for implementation drift, align small documented mismatches, and plan the remaining implementation waves.
- **Review Findings:** The spec, roles, and wave history are directionally aligned after the compiler/typesetter and BACKFILL updates. The review found small fixable drift: - `backfill` was documented like a live command even though it is planned. - `mdloom fix -o/--output` was documented but is not implemented. - `mdloom compile --root` is implemented but was missing from the CLI reference. - The sample fix plan included `generated_at`, which is not in `FixPlan`. - `md_broken_link` is registered but was missing from markdown-table diagnostics.
- **Changes:** - Marked `backfill` as planned in the CLI command list. - Removed undocumented `mdloom fix -o/--output` from the spec. - Added `mdloom compile --root` to the compile options. - Removed `generated_at` from the sample fix plan. - Added `md_broken_link` to the markdown-table diagnostics table. - Created the session implementation plan at: `C:\Users\giodl\.copilot\session-state\a620d177-e5f9-4b77-8433-f3c0137c3ec8\plan.md` - Reflected remaining implementation waves into SQL todos.
- **Implementation Waves Planned:** 1. Backfill MVP, literal-first. 2. Backfill classifiers. 3. Structured extraction. 4. Artifact manifest and compile graph. 5. Tag-driven operations. 6. Fix pipeline consistency. 7. Directive module split. 8. Docs and review skills.
- **Validation:** - `git --no-pager diff --check`
- **Carry-forward:** Start with the backfill MVP. Do not implement semantic extraction before literal round-trip gates and report formats are stable.

## Spec Generate Command Args Closeout

Archived from `context/waves/2026-05-15-spec-generate-command-args/CLOSE.md`.

- **Mission:** Continue modularizing the CLI shell by moving the `mdloom spec-generate` argument shape into the spec-generate command module.
- **Changes:** - Added `cmd_spec_generate::Args` with the clap argument definitions for `mdloom spec-generate`. - Replaced the inline `Command::SpecGenerate { ... }` fields in `main.rs` with a tuple variant that references `cmd_spec_generate::Args`. - Kept spec generation behavior in `cmd_spec_generate::run` unchanged. - Preserved the spec-generate CLI regression that emits DaVinci TOML.
- **Validation:** - `cargo test cli_spec_generate_outputs_toml` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** Continue migrating command argument groups from `main.rs` into their command modules in small, independently validated waves.

## Spec Generate Command Module Closeout

Archived from `context/waves/2026-05-15-spec-generate-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the invariant suggestion command, `mdloom spec-generate`.
- **Changes:** - Added `src/cmd_spec_generate.rs`. - Moved mdpath URI resolution, ID derivation, static invariant generation, optional AI-assisted invariant generation, output-file handling, and summary rendering out of `main.rs`. - Kept global explicit-config behavior by loading config inside the command module with the same `load_config_for_path` helper used by other commands. - Preserved the existing CLI regression that verifies `spec-generate` emits DaVinci TOML.
- **Validation:** - `cargo test cli_spec_generate_outputs_toml` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom compile` and `mdloom layout` remain in `main.rs`; `layout` is smaller, while `compile` may deserve a command module plus helper extraction.

## Spec Registry Boundary Close

Archived from `context/waves/2026-05-15-spec-registry-boundary/CLOSE.md`.

- **Outcome:** Created a diagnostic-code registry boundary so emitted mdloom diagnostics have a single discoverable contract: - Added `src/diagnostic_registry.rs` with code, default severity, owner family, and description entries. - Exported the registry through `mdloom_lib`. - Added an invariant test that scans source string literals and fails when a diagnostic-like code is not registered. - Updated `design/SPEC.md` to document the registry, larger command surface, compile/render diagnostic families, raw/effective config direction, and the new registry invariant.
- **Design Decision:** The registry is intentionally descriptive first. Existing checks still emit their current string codes, while tests now prevent new undocumented codes from being introduced. A later wave can migrate emitters to constants from the registry if that becomes valuable.
- **Validation:** - `cargo test invariant_all_source_diagnostic_codes_are_registered` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** - Split raw TOML config from resolved effective config. - Add typed rich-context contracts for table, link, chart, compile, and markdown diagnostics. - Extract large command and compile directive modules after the registry and spec contract stabilize.

## Stats Command Module Closeout

Archived from `context/waves/2026-05-15-stats-command-module/CLOSE.md`.

- **Mission:** Begin the command-module split with the most self-contained command: `mdloom stats`.
- **Changes:** - Added `src/cmd_stats.rs`. - Moved the `stats` implementation out of `main.rs`. - Kept command dispatch, CLI argument parsing, and output behavior unchanged. - Reused `mdloom_lib::lint::lint_paths` from the prior orchestration wave.
- **Validation:** - `cargo test binary_stats_command_runs` - `cargo test binary_stats_file_count_honors_include_exclude` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `cmd_check` and `cmd_draft` are natural follow-up extractions because they now share the same library lint orchestration seam.

## Status Command Module Closeout

Archived from `context/waves/2026-05-15-status-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting `mdloom status`, including its small cached-check JSON helper.
- **Changes:** - Added `src/cmd_status.rs`. - Moved source/compiled/stale counting, last-check cache rendering, and config summary rendering out of `main.rs`. - Updated dispatch to call `cmd_status::run`. - Added a CLI smoke regression that verifies `mdloom status <dir>` reports the project summary fields.
- **Validation:** - `cargo test binary_status_command_reports_project_summary` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `cmd_check` remains the largest lint-facing extraction. The status split removes another self-contained block from `main.rs` without touching check rendering.

## Status Global Config Adapter Closeout

Archived from `context/waves/2026-05-15-status-global-config-adapter/CLOSE.md`.

- **Mission:** Bring `mdloom status` into the config-aware command adapter pattern so explicit global config overrides are reflected in status summaries.
- **Changes:** - Added `cmd_status::run_with_globals`. - Routed `Command::Status` through global options in dispatch. - Preserved default status behavior when no explicit config is supplied. - Added a regression that `mdloom --config <path> status <dir>` reports the explicit config's section schema count.
- **Validation:** - `cargo test binary_status_command_reports_project_summary` - `cargo test binary_status_command_honors_explicit_config` - `cargo test binary_config_prints_effective_cascaded_config` - `cargo test cli_mdloom_version_exits_zero` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Any command that reads runtime config should route through `GlobalOptions` so `--config` remains authoritative across the CLI surface.

## Tag-Driven Operations Closeout

Archived from `context/waves/2026-05-15-tag-driven-operations/CLOSE.md`.

- **Mission:** Turn source frontmatter tags from passive metadata into explicit operation selectors while preserving inclusive default behavior.
- **Changes:** - Added reusable `FrontmatterFilter` for exact-match source metadata filtering. - Added opt-in filters to `mdloom check`: - `--tag <TAG>` - `--op <OP>` - `--content-tag <TAG>` - Added the same filters to `mdloom compile`. - Added the same filters to `mdloom stats`. - Filters are additive: when multiple filters are supplied, a source must match all requested fields. - Defaults remain behavior-safe: without filters, tags never exclude content. - Compile manifests honor the filtered source set because filtering happens before artifact records are written. - Added focused coverage for stats, check, compile, and the reusable filter matcher. - Updated README, SPEC, session plan, and wave history.
- **Validation:** - `cargo test frontmatter_filter_requires_requested_fields` - `cargo test binary_stats_tag_filter_limits_files` - `cargo test binary_compile_tag_filter_limits_sources` - `cargo test binary_check_tag_filter_limits_sources` - `cargo fmt && cargo test && cargo build && git --no-pager diff --check` The sibling `mdpath` crate still emits its known warning set during workspace test/build; this wave did not change sibling repository code.
- **Carry-forward:** Future config policy hooks may use these filters, but should stay opt-in until selection semantics are stable across watch mode, manifests, and status views.

## Tree Command Args Closeout

Archived from `context/waves/2026-05-15-tree-command-args/CLOSE.md`.

- **Mission:** Finish the remaining inline command wrapper by moving the `mdloom tree` subcommand argument shape into the tree command module.
- **Changes:** - Added `cmd_tree::Args` with the clap subcommand wrapper for `mdloom tree`. - Replaced the inline `Command::Tree { ... }` fields in `main.rs` with a tuple variant that references `cmd_tree::Args`. - Kept the existing `TreeAction` subcommand enum and tree behavior in `cmd_tree`. - Preserved the tree CLI regression that generates dirtree output.
- **Validation:** - `cargo test binary_tree_generate_prints_dirtree` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** All command-specific clap argument shapes now live in command modules; future CLI cleanup can focus on dispatch ergonomics and default check routing.

## Tree Command Module Closeout

Archived from `context/waves/2026-05-15-tree-command-module/CLOSE.md`.

- **Mission:** Continue the command-module split by extracting the tree generation command family, `mdloom tree`.
- **Changes:** - Added `src/cmd_tree.rs`. - Moved the `TreeAction` clap subcommand enum out of `main.rs` with the tree command implementation. - Moved dirtree generation, schema-driven tree generation, source resolution, output-file handling, and tree-specific helper imports out of `main.rs`. - Added a CLI regression that runs `mdloom tree generate` against a temporary directory and verifies dirtree output.
- **Validation:** - `cargo test binary_tree_generate_prints_dirtree` - `cargo test` - `cargo build` - `git diff --check` The sibling `mdpath` crate still emits its known warning set during workspace build/test; this wave did not change sibling repository code.
- **Carry-forward:** `mdloom spec-generate`, `mdloom compile`, and `mdloom layout` remain in `main.rs`; `spec-generate` is the next medium-sized extraction candidate.
