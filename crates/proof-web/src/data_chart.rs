//! Bounded browser data binding over the same native parsers and renderer.
use proof_core::{
    chart::{ChartAttrs, ChartData, ChartKind, ChartPoint},
    data,
};
use serde::Serialize;
use std::collections::{HashMap, HashSet};
type Rows = (Vec<String>, Vec<HashMap<String, String>>);
fn parse(content: &str, format: &str) -> Result<Rows, String> {
    if content.len() > 65536 {
        return Err("Attach at most 64 KB of UTF-8 data".into());
    }
    let mut parsed = match format {
        "json" => data::parse_json_source(content),
        "markdown" => data::parse_md_table(content),
        _ => return Err("Use a Markdown table or JSON array of objects".into()),
    }
    .map_err(|e| e.to_string())?;
    if format == "markdown" {
        let lines: Vec<&str> = content
            .lines()
            .map(str::trim)
            .filter(|line| !line.is_empty() && line.contains('|'))
            .collect();
        let cells = |line: &str| {
            let inner = line.strip_prefix('|').unwrap_or(line);
            inner
                .strip_suffix('|')
                .unwrap_or(inner)
                .split('|')
                .map(|cell| cell.trim().to_string())
                .collect::<Vec<_>>()
        };
        let headers = cells(lines[0]);
        if headers.iter().any(String::is_empty)
            || lines
                .iter()
                .skip(1)
                .any(|line| cells(line).len() != headers.len())
        {
            return Err(
                "Use one pipe table with nonempty headers and matching row column counts".into(),
            );
        }
        let body = if lines[1].chars().all(|c| matches!(c, '-' | ':' | '|' | ' ')) {
            2
        } else {
            1
        };
        // Native parsing stays lenient. The browser's validated table preserves
        // empty boundary cells so unrelated blank fields cannot shift bindings.
        parsed.1 = lines[body..]
            .iter()
            .map(|line| headers.iter().cloned().zip(cells(line)).collect())
            .collect();
    }
    let (fields, rows) = &parsed;
    if rows.is_empty() || rows.len() > 200 {
        return Err("Use between 1 and 200 data rows".into());
    }
    if fields.is_empty()
        || fields.len() > 50
        || fields
            .iter()
            .any(|f| f.is_empty() || f.chars().count() > 80 || f.chars().any(char::is_control))
        || fields.iter().collect::<HashSet<_>>().len() != fields.len()
    {
        return Err("Use 1–50 unique, nonempty field names, at most 80 characters each".into());
    }
    Ok(parsed)
}
#[derive(Serialize)]
struct Inspection {
    fields: Vec<String>,
    rows: usize,
}
#[cfg_attr(feature = "wasm", wasm_bindgen::prelude::wasm_bindgen)]
pub fn inspect_data_json(content: &str, format: &str) -> Result<String, String> {
    let (fields, rows) = parse(content, format)?;
    serde_json::to_string(&Inspection {
        fields,
        rows: rows.len(),
    })
    .map_err(|e| e.to_string())
}
#[derive(Serialize)]
struct Generated {
    text: String,
    markdown: String,
    rows: usize,
}
#[cfg_attr(feature = "wasm", wasm_bindgen::prelude::wasm_bindgen)]
pub fn render_data_chart_json(
    content: &str,
    format: &str,
    label: &str,
    value: &str,
    kind: &str,
    width: usize,
) -> Result<String, String> {
    let (fields, rows) = parse(content, format)?;
    if !fields.iter().any(|f| f == label) || !fields.iter().any(|f| f == value) {
        return Err("Choose existing label and numeric value fields".into());
    }
    let kind = match kind {
        "bar" => ChartKind::Bar,
        "line" => ChartKind::Line,
        "area" => ChartKind::Area,
        _ => return Err("Choose bar, line or area".into()),
    };
    if !(20..=120).contains(&width) {
        return Err("Chart width must be 20–120 columns".into());
    }
    let mut points = Vec::new();
    for (i, row) in rows.iter().enumerate() {
        let name = &row[label];
        if name.is_empty() || name.chars().count() > 80 || name.chars().any(char::is_control) {
            return Err(format!(
                "Row {}: use a nonempty single-line label of at most 80 characters",
                i + 1
            ));
        }
        let number = row[value]
            .trim()
            .parse::<f64>()
            .map_err(|_| format!("Row {}: {:?} is not a number", i + 1, value))?;
        if !number.is_finite() || number.abs() > 1e12 || (kind == ChartKind::Bar && number < 0.0) {
            return Err(format!(
                "Row {}: use finite values within ±1 trillion; bars require nonnegative values",
                i + 1
            ));
        }
        points.push(ChartPoint {
            label: name.clone(),
            value: number,
            extras: vec![],
        });
    }
    let text = proof_core::chart::render_chart(
        &ChartData(points),
        &ChartAttrs {
            kind,
            width,
            ..Default::default()
        },
    )
    .map_err(|e| e.message)?
    .join("\n");
    let fence = "`".repeat(
        text.split(|c: char| c != '`')
            .map(str::len)
            .max()
            .unwrap_or(0)
            .max(2)
            + 1,
    );
    let markdown = format!("{fence}text\n{text}\n{fence}\n");
    serde_json::to_string(&Generated {
        text,
        markdown,
        rows: rows.len(),
    })
    .map_err(|e| e.to_string())
}
#[cfg_attr(feature = "wasm", wasm_bindgen::prelude::wasm_bindgen)]
pub fn append_chart_json(source: &str, markdown: &str) -> Result<String, String> {
    serde_json::to_string(&proof_core::html::append_fenced_block(source, markdown)?)
        .map_err(|e| e.to_string())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn shared_rendering_and_binding() {
        let content = "| Team | Score |\n|---|---|\n| Alpha | 10 |\n| Beta | 5 |";
        let a: serde_json::Value = serde_json::from_str(
            &render_data_chart_json(content, "markdown", "Team", "Score", "bar", 40).unwrap(),
        )
        .unwrap();
        let b: serde_json::Value = serde_json::from_str(
            &render_data_chart_json(
                r#"[{"Team":"Alpha","Score":10},{"Team":"Beta","Score":5}]"#,
                "json",
                "Team",
                "Score",
                "bar",
                40,
            )
            .unwrap(),
        )
        .unwrap();
        assert_eq!(a, b);
        assert!(a["text"].as_str().unwrap().contains("Alpha"));
    }
    #[test]
    fn reject_invalid_numbers_fields_and_limits() {
        for number in ["NaN", "inf", "-1", "1000000000001", "oops"] {
            assert!(render_data_chart_json(
                &format!("| name | value |\n|---|---|\n| A | {number} |"),
                "markdown",
                "name",
                "value",
                "bar",
                40
            )
            .is_err());
        }
        assert!(inspect_data_json("| x | x |\n|---|---|\n|1|2|", "markdown").is_err());
        assert!(inspect_data_json("[]", "json").is_err());
        assert!(inspect_data_json("||value|\n|---|---|\n|A|1|", "markdown").is_err());
        assert!(inspect_data_json("|a|b|\n|---|---|\n|A|", "markdown").is_err());
        assert!(inspect_data_json(&"x".repeat(65537), "markdown").is_err());
    }
    #[test]
    fn fence_cannot_be_closed_by_data() {
        let out: serde_json::Value = serde_json::from_str(
            &render_data_chart_json(
                r#"[{"name":"```","value":1}]"#,
                "json",
                "name",
                "value",
                "bar",
                40,
            )
            .unwrap(),
        )
        .unwrap();
        assert!(out["markdown"].as_str().unwrap().starts_with("````text\n"));
    }
}
