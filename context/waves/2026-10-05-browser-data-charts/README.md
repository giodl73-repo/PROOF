# Browser local data charts

Mission: expose existing native data binding and text chart rendering to local browser attachments.

Shared proof-core owns the existing chart renderers and table/JSON parsers; native facades preserve API paths and behavior. Browser adapters accept bounded file content, selected label/value fields and bar/line/area options without filesystem access. Source remains unchanged until materialized insertion; attachments are session-only and separate from recovery/sharing. Binding records are informational metadata, not native directives. Full URI resolution and tree/corpus/directive compilation remain native.

SOURCE/PARSE: literal source custody, explicit undo, field/value/size validation. CACHE: stale attachment and generation replies cannot revive invalidated output. SIGNAL: fixed checks remain unchanged and no full directive compilation is claimed. COMPOSE/PANEL: labeled controls and mobile layout. BENCH: native compatibility, Rust unit and actual WASM browser gates. These are AI role lenses, not external endorsement.

Release receipts recorded in TRACKER after hosted CI, deployment and live verification.

Review fixes: browser Markdown binding preserves leading/trailing empty data cells without changing native lenient parser semantics. CommonMark offset events validate materialized append boundaries, including list fences and unfinished code/HTML blocks; source snapshots prevent async insertion from overwriting edits.
