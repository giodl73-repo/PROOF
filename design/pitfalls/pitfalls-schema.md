# Schema & Config Pitfalls (SC-01..SC-05)

Failure modes in the schema loading, config composition, and rule interpretation layer.

---

## SC-01: Schema silently ignored when config file not found

**Pattern:** If `load_or_default()` falls through all candidate config paths and returns a default
config, the user gets no feedback. They believe their `proof.toml` is being applied when it isn't
(wrong file name, wrong directory, typo). All checks run with default settings, not schema settings.

**Domain:** CI pipelines and pre-commit hooks where the config path is assumed correct.

**Why it's hard to catch:** Defaults are valid, so the command still produces
normal diagnostics. Unless the user sees an explicit config-loading note, they
cannot distinguish "clean under my schema" from "checked under defaults."

**Structural solution:** Add a `--config` flag that is required-or-explicit. When `--config` is
given but the file doesn't exist, fail immediately with a clear error. When auto-detection is used
and no config is found, emit a `note:` line on stderr: `"no proof.toml found — using defaults"`.
This makes silent fallback visible.

**Status:** PARTIAL — `--config` flag exists and errors on missing file; auto-detection is silent.
**Test:** `tests/integration_tests.rs::default_config_loads_without_panic` covers safe default loading only; add a CLI test for missing explicit `--config`.

---

## SC-02: Glob patterns applied from wrong base directory

**Pattern:** `include = ["**/*.md"]` is matched against paths relative to the `root` argument
passed to `Runner::run()`. If the caller passes an absolute path as root but the glob is written
expecting a relative path from the project directory, no files match and `run()` returns zero
diagnostics — silently.

**Domain:** Integration scenarios where `proof` is invoked from a different working directory
than the project root.

**Why it's hard to catch:** Zero matched files can look like a clean run in
automation. The bug depends on invocation directory and path shape, so tests
that run from the repo root do not exercise the failing base-directory route.

**Structural solution:** Always strip the root prefix before globbing: `path.strip_prefix(root)`.
Add a `--verbose` flag that logs `"checked N files"` — if N=0, the user knows something is wrong
with their include patterns.

**Status:** SOLVED — `matches()` uses `path.strip_prefix(root)` for glob matching.
**Test:** `tests/integration_tests.rs::runner_scans_fixture_dir`

---

## SC-04: `paths_exclude` not prefixed alongside `paths` in directory configs

**Pattern:** When a directory-level `proof.toml` defines a `section_schema` with both
`paths` and `paths_exclude`, the path-prefix logic (which makes `languages/*.md` from `*.md`)
applies to `paths` but forgets to apply the same prefix to `paths_exclude`. The result:
`paths_exclude = ["00-OVERVIEW.md"]` stays as-is while `paths` becomes `"languages/*.md"`.
When matching `languages/00-OVERVIEW.md`, include fires (it matches `languages/*.md`) but
exclude misses (its pattern is still bare `"00-OVERVIEW.md"`, not `"languages/00-OVERVIEW.md"`).
The section schema applies to the overview file when it should be excluded.

**Domain:** Any directory-level `proof.toml` that uses `paths_exclude` to carve out special
files from a generic `paths = ["*.md"]` rule.

**Why it's hard to catch:** Include and exclude globs are both syntactically
valid, and the included file still receives diagnostics. The error only appears
when a directory-local rule relies on exclusion to protect a special file.

**Structural solution:** The prefix loop must iterate over both `schema.paths` and
`schema.paths_exclude` and apply the same prefix transform to both. A single closure
`prefix_glob` applied to both fields ensures they stay in sync.

**Status:** SOLVED
**Proved by:** `directory_schema_paths_relative_to_its_dir` and `paths_exclude_glob_pattern`
in `tests/integration_tests.rs`
**Test:** `tests/integration_tests.rs::section_schema_paths_exclude_skips_matching_files`

---

## SC-03: Custom rules with `negate = true` cause confusion

**Pattern:** A custom rule with `negate = true` warns when the pattern IS found. A user reads
`negate = true` as "negate the rule" (i.e., "don't apply this rule") rather than "invert the
match sense." When they toggle `negate = true` thinking they're disabling the rule, they instead
flip from "warn when absent" to "warn when present."

**Domain:** Schema authors unfamiliar with lint-rule inversion terminology.

**Why it's hard to catch:** Both inverted and non-inverted rules execute and
emit plausible diagnostics. A user trying to disable a rule can accidentally
change when it fires without creating a parse or validation error.

**Structural solution:** Rename the field to make the semantics explicit. Options:
- `match_mode = "present" | "absent"` — warn when pattern is present vs. absent
- `warn_when = "found" | "missing"` — direct statement of when to warn

Until the rename, the schema file comment must be very explicit with an example showing
both states.

**Status:** SOLVED — custom rules now support explicit
`warn_when = "found" | "missing"` semantics, legacy `negate = true` remains a
backward-compatible alias for `warn_when = "found"`, and the runner actually
executes configured custom rules.
**Test:** `tests/integration_tests.rs` —
`custom_rule_warn_when_found_reports_matching_content`,
`custom_rule_warn_when_missing_reports_absent_content`,
`custom_rule_legacy_negate_true_warns_when_found`

---

## SC-05: Generated output becomes the edited source

**Pattern:** A user opens a compiled `.md`, generated `.source.md` candidate,
TOC, tree, diagram, status report, or backfill artifact and treats the easiest
visible file as the correct place to edit. The next `proof compile`, `proof
backfill`, generated index refresh, or source migration overwrites the change
or silently splits source truth across generated and hand-authored files.

**Domain:** `.source.md` adoption, `proof backfill`, generated guide output,
TOCs, tree diagrams, `md://` cross-references, DaVinci pins, publisher reports,
and MAXIM-style corpus migrations.

**Detection difficulty:** The generated artifact is usually more readable than
the source contract, and existing docs correctly explain the source-output model
but do not make every generated surface self-describing.

**Structural solution:** Every generated or derived surface should expose its
source path, derived status, safe edit path, and repair command. Backfill and
compile guides should include a user-task fixture that starts from a visible
generated artifact and leads the user back to the authoritative source.

**Status:** OPEN
**Evidence:** `README.md`, `docs/guides/00-getting-started.md`,
`docs/guides/14-backfill-migration.md`, and
`docs/adoption/reuse-boundary.md`.
