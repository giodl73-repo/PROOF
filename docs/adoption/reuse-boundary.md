# MDLOOM reuse boundary

MDLOOM has one proven portfolio reuse lane: a repository adopts the `mdloom`
CLI, cascading `mdloom.toml` configuration, directives, diagnostics, and
versioned output artifacts to check and compile its own Markdown corpus.

MAXIM is the reference adopter. It retains a root configuration plus 42
directory configurations for a large, heterogeneous documentation corpus.
MDLOOM's historical corpus gates also use MAXIM to distinguish detector defects
from consumer-owned content and policy.

## Reusable contract

The supported cross-repository contract is:

- CLI workflows such as `check`, `compile`, `backfill`, `status`, `stats`,
  `depends`, `index`, and `catalog`;
- cascading `mdloom.toml` configuration and exact consumer-owned policy;
- `.source.md` directives and deterministic Markdown/HTML publication behavior;
- diagnostics with file, line, column, code, severity, and message;
- `.mdloom/artifacts.json` artifact records;
- `mdport.v1`, `mdloom.publish.json_report.v1`,
  `mdloom.publication_ast.v1`, and `mdloom.publish.site.v1` records; and
- explicit failure for invalid configuration, broken references, failed
  invariants, or unsupported publication inputs.

Consumers own their source corpus, schema strictness, warning budget, accepted
baselines, generated-artifact admission, publication policy, and deployment.
MDPATH owns stable `md://` addressing. MDPORT owns portable transfer semantics.
MDLOOM owns compilation, validation, rendering, diagnostics, and artifact
production.

## Not yet a portfolio contract

The broad `mdloom_lib` module surface is primarily the CLI's implementation
boundary. `mdloom-canvas` and `mdloom-math` are intentionally separable crates,
but no independent portfolio repository currently declares either crate in its
dependency manifest.

Do not count public Rust modules, examples, or internal workspace use as
cross-repository adoption. A Rust library surface becomes a portfolio contract
only when a named external adopter:

1. pins a tested MDLOOM revision;
2. uses a narrow public API without compiler-internal imports;
3. retains accepted and failure fixtures in both repositories;
4. records compatibility and migration ownership; and
5. passes its rehearsal before MDLOOM admits a breaking change.

Until then, prefer the CLI and versioned artifact boundary over embedding
MDLOOM compiler internals.

## MAXIM rehearsal

MAXIM records its adopted surfaces in `mdloom-adoption.toml`. Its focused
consumer gate is:

```powershell
mdloom check --config mdloom.toml .
```

MDLOOM changes that alter diagnostics or policy should first run focused
fixtures, then the MAXIM corpus gate. A detector change that bulk-mutates MAXIM
content or converts accepted policy into errors requires explicit MAXIM review;
it is not a transparent library refactor.
