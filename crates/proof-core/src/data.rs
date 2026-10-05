//! Shared file-content table parsers; no filesystem resolution.
use anyhow::{bail, Result};
use std::collections::HashMap;

pub fn parse_md_table(content: &str) -> Result<(Vec<String>, Vec<HashMap<String, String>>)> {
    let lines: Vec<&str> = content
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty() && l.contains('|'))
        .collect();

    if lines.len() < 2 {
        bail!("source table must have at least a header row and a separator row");
    }

    let headers: Vec<String> = parse_table_row(lines[0])
        .into_iter()
        .map(|h| h.trim().to_string())
        .filter(|h| !h.is_empty())
        .collect();

    if headers.is_empty() {
        bail!("source table header row is empty");
    }

    // Verify line 1 is a separator row (`---|---|---` or similar). If not,
    // treat lines[1..] as data rows (some authors omit the separator).
    let is_separator = lines[1].chars().all(|c| matches!(c, '-' | ':' | '|' | ' '));
    let body_start = if is_separator { 2 } else { 1 };

    let mut rows = Vec::new();
    for &line in &lines[body_start..] {
        let cells: Vec<String> = parse_table_row(line)
            .into_iter()
            .map(|c| c.trim().to_string())
            .collect();

        let mut row = HashMap::new();
        for (i, header) in headers.iter().enumerate() {
            row.insert(header.clone(), cells.get(i).cloned().unwrap_or_default());
        }
        rows.push(row);
    }

    Ok((headers, rows))
}

fn parse_table_row(line: &str) -> Vec<String> {
    let trimmed = line.trim_start_matches('|').trim_end_matches('|');
    trimmed.split('|').map(|s| s.to_string()).collect()
}

// ─────────────────────────────────────────────────────────
// JSON parsing (simple — no serde dependency beyond what proof already has)
// ─────────────────────────────────────────────────────────

/// Parse a JSON array of objects into rows for tree generation.
/// Uses serde_json which is already a proof dependency.
pub fn parse_json_source(content: &str) -> Result<(Vec<String>, Vec<HashMap<String, String>>)> {
    let value: serde_json::Value =
        serde_json::from_str(content).map_err(|e| anyhow::anyhow!("JSON parse error: {}", e))?;

    let arr = value
        .as_array()
        .ok_or_else(|| anyhow::anyhow!("JSON source must be an array of objects"))?;

    if arr.is_empty() {
        return Ok((Vec::new(), Vec::new()));
    }

    // Collect all keys from the first object as headers
    let first = arr[0]
        .as_object()
        .ok_or_else(|| anyhow::anyhow!("JSON array elements must be objects"))?;
    let headers: Vec<String> = first.keys().cloned().collect();

    let mut rows = Vec::new();
    for item in arr {
        let obj = item
            .as_object()
            .ok_or_else(|| anyhow::anyhow!("JSON array element is not an object"))?;
        let mut row = HashMap::new();
        for header in &headers {
            let val = obj
                .get(header)
                .map(|v| match v {
                    serde_json::Value::String(s) => s.clone(),
                    serde_json::Value::Null => String::new(),
                    other => other.to_string().trim_matches('"').to_string(),
                })
                .unwrap_or_default();
            row.insert(header.clone(), val);
        }
        rows.push(row);
    }

    Ok((headers, rows))
}
