//! Single-document browser policy; no filesystem/corpus admission.
use proof_core::{
    checks::{
        ascii_box::AsciiBoxCheck, ascii_char::AsciiCharCheck, markdown::MarkdownCheck,
        markdown_table::MarkdownTableCheck, Check,
    },
    config::{AsciiBoxConfig, AsciiCharConfig, MarkdownConfig, MarkdownTableConfig},
    diagnostic::Diagnostic,
};
use serde::Serialize;
mod data_chart;
pub use data_chart::{append_chart_json, inspect_data_json, render_data_chart_json};
use std::path::Path;
#[derive(Serialize)]
pub struct Output {
    pub model: &'static str,
    pub source: String,
    pub terminal: String,
    pub html: String,
    pub diagnostics: Vec<Diagnostic>,
    pub outline: Vec<proof_core::html::OutlineHeading>,
    pub unassessed: Vec<&'static str>,
}
pub fn evaluate(source: &str) -> Result<Output, String> {
    if source.len() > 65536 || source.lines().count() > 2000 {
        return Err("Use at most 64KB and 2000 lines".into());
    }
    let source = source.replace("\r\n", "\n");
    let checks: Vec<Box<dyn Check>> = vec![
        Box::new(MarkdownCheck {
            config: MarkdownConfig {
                enabled: true,
                max_h1: Some(1),
                check_duplicate_headings: true,
                check_links: false,
                ..Default::default()
            },
            root: None,
        }),
        Box::new(MarkdownTableCheck {
            config: MarkdownTableConfig {
                enabled: true,
                ..Default::default()
            },
        }),
        Box::new(AsciiBoxCheck {
            config: AsciiBoxConfig {
                enabled: true,
                tolerance: 0,
                ..Default::default()
            },
        }),
        Box::new(AsciiCharCheck {
            config: AsciiCharConfig {
                enabled: true,
                ..Default::default()
            },
        }),
    ];
    let mut diagnostics = checks
        .into_iter()
        .flat_map(|check| check.check(Path::new("document.md"), &source))
        .collect::<Vec<_>>();
    for (i, line) in source.lines().enumerate() {
        if line.trim_start().starts_with("```proof:") || line.trim_start().starts_with("~~~proof:")
        {
            diagnostics.push(Diagnostic::warning(
                "document.md".into(),
                i + 1,
                1,
                "WEB-001",
                "PROOF directives are not compiled here; use native proof compile",
            ));
        }
    }
    diagnostics
        .sort_by(|a, b| (a.span.line, a.span.col, a.code).cmp(&(b.span.line, b.span.col, b.code)));
    // Fence contents stay literal; math expansion is a terminal view, never source replacement.
    let code_lines = proof_core::html::code_block_lines(&source);
    let terminal = source
        .lines()
        .enumerate()
        .map(|(line_index, line)| {
            if code_lines.contains(&line_index) {
                line.to_string()
            } else {
                let (expanded, math_diags) = proof_math::expand_inline_math(line);
                for d in math_diags {
                    let constructor = match d.severity {
                        proof_math::DiagSeverity::Error => Diagnostic::error,
                        proof_math::DiagSeverity::Warning => Diagnostic::warning,
                    };
                    // Native math offsets are not a precise source-token contract.
                    // Report the source line honestly instead of inventing token columns.
                    let mut diagnostic = constructor("document.md".into(), line_index + 1, 1, d.code, d.message);
                    diagnostic.note = Some("Math preview finding is located by source line; token columns are unavailable.".into());
                    diagnostics.push(diagnostic);
                }
                expanded
            }
        })
        .collect::<Vec<_>>()
        .join("\n");
    diagnostics
        .sort_by(|a, b| (a.span.line, a.span.col, a.code).cmp(&(b.span.line, b.span.col, b.code)));
    let (fragment, outline) = proof_core::html::markdown_to_html_with_outline(&source);
    let html=format!("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>PROOF document</title><style>body{{font-family:system-ui;line-height:1.6;padding:20px;overflow-wrap:anywhere}}pre{{overflow:auto;padding:12px;background:#f4f4f0}}table{{border-collapse:collapse}}td,th{{border:1px solid #bbb;padding:8px}}img{{max-width:100%}}</style></head><body>{fragment}</body></html>");
    Ok(Output {
        model: "proof-workbench-v1",
        source,
        terminal,
        html,
        diagnostics,
        outline,
        unassessed: vec![
            "Cross-file links and md:// references",
            "Repository/cascading configuration and admission",
            "PROOF directives, DaVinci and document export targets",
        ],
    })
}
#[cfg_attr(feature = "wasm", wasm_bindgen::prelude::wasm_bindgen)]
pub fn evaluate_json(source: &str) -> Result<String, String> {
    serde_json::to_string(&evaluate(source)?).map_err(|e| e.to_string())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn shared_checks_and_source_custody() {
        let input = "# One\n# Two\n\n$\\alpha$\n";
        let out = evaluate(input).unwrap();
        assert_eq!(out.source, input);
        assert!(out.terminal.contains('α'));
        assert!(out.diagnostics.iter().any(|d| d.code == "md_h1_count"));
        assert!(out.html.contains("<h1 id=\"proof-heading-1\">One</h1>"));
        assert_eq!(out.outline[0].title, "One");
        assert_eq!(out.outline[0].line, 1);
    }
    #[test]
    fn container_and_long_fences_stay_literal() {
        for input in [
            "> ```\n> $\\alpha$\n> ```\n\n$\\beta$",
            "````\n```\n$\\alpha$\n````\n\n$\\beta$",
            "    $\\alpha$\n\n$\\beta$",
        ] {
            let out = evaluate(input).unwrap();
            assert!(out.terminal.contains("$\\alpha$"));
            assert!(out.terminal.contains('β'));
        }
    }
    #[test]
    fn math_findings_are_explicitly_line_only() {
        for source in [
            "abc $x}$",
            "界 $x}$",
            "abc $x + \\bogus$",
            "界 $x + \\bogus$",
        ] {
            let out = evaluate(source).unwrap();
            let d = out
                .diagnostics
                .iter()
                .find(|d| d.code.starts_with("MATH-"))
                .unwrap();
            assert_eq!(d.span.col, 1);
            assert!(d.note.as_ref().unwrap().contains("source line"));
        }
        assert!(evaluate("    界").is_ok());
    }
    #[test]
    fn bounds_and_unsupported_are_honest() {
        assert!(evaluate(&"x".repeat(65537)).is_err());
        assert!(evaluate(&"\n".repeat(2001)).is_err());
        let out = evaluate("```proof:tree\nA\n```\n").unwrap();
        assert!(out.diagnostics.iter().any(|d| d.code == "WEB-001"));
        assert!(evaluate("").unwrap().diagnostics.is_empty());
    }
    #[test]
    fn raw_html_and_external_resources_do_not_execute() {
        let out =
            evaluate("<script>alert(1)</script>\n![track](https://example.org/x.png)").unwrap();
        assert!(out.html.contains("&lt;script&gt;"));
        assert!(out.html.contains("default-src 'none'"));
    }
}
