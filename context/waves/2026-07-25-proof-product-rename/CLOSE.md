# PROOF product rename closeout

PROOF is now the repository, Cargo package, binary, library, directive prefix,
configuration/state namespace, schema namespace, skill family, and release
identity. GitHub moved from `giodl73-repo/PROOF` to
`giodl73-repo/PROOF`.

The rename also simplified the publication boundary:

- `proof-math` is the single math implementation.
- `proof-canvas` and `proof-math` package independently.
- PROOF no longer has direct Git dependencies on MDPORT or SLICE.
- MDPATH remains the only portfolio Git dependency until `mdpath` is published.

Validation evidence:

- `cargo test`
- `cargo clippy -- -D warnings`
- `cargo package --allow-dirty --no-verify` for `proof-math`
- `cargo package --allow-dirty --no-verify` for `proof-canvas`
- `proof --version` reports `proof 0.8.0`
- live legacy-name audit is clean outside explicit naming history

The root `proof` package must be published after `proof-canvas` and
`proof-math`; its dry run correctly stops until those package names exist in
the crates.io index.
