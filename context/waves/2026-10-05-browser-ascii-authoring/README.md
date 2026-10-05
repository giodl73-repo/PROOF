# Browser ASCII authoring

Mission: make literal diagram editing practical in the existing Markdown workbench.

Source-owned operations insert box/flow/branch templates, indent selected lines and move blocks. UTF-16 selection coordinates match the textarea; next-line boundary selections exclude that next line. Escape then Tab leaves the editor. The fixed Rust policy is unchanged; no inferred automatic diagram repairs.

Role lenses: SOURCE preserves surrounding text, PARSE guards selection and fence boundaries, COMPOSE/PANEL provide mobile controls, SIGNAL retains the existing check scope, BENCH exercises keyboard, Unicode and engine-failure cases.

Validation: browser suite, JavaScript syntax, Pages build and codex review. Release receipts recorded in TRACKER after deployment.

Review fixes: explicit single-operation undo, caret-preserving indentation, current-line fence boundaries and always-visible keyboard exit instructions, and a branch template without conflicting box borders, and indentation-preserving templates inside indented fences. Regression coverage exercises each behavior.
