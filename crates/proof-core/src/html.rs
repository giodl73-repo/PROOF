use pulldown_cmark::{html, Event, Options, Parser};
pub fn markdown_to_html_fragment(markdown: &str) -> String {
    let parser = Parser::new_ext(markdown, markdown_options()).map(|event| match event {
        Event::Html(raw) | Event::InlineHtml(raw) => Event::Text(raw),
        other => other,
    });
    let mut html_out = String::new();
    html::push_html(&mut html_out, parser);
    html_out
}

fn markdown_options() -> Options {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_FOOTNOTES);
    options
}

/// Zero-based lines occupied by CommonMark code blocks, including container fences.
pub fn code_block_lines(source: &str) -> std::collections::HashSet<usize> {
    let mut lines = std::collections::HashSet::new();
    for (event, range) in
        pulldown_cmark::Parser::new_ext(source, markdown_options()).into_offset_iter()
    {
        if matches!(
            event,
            pulldown_cmark::Event::Start(pulldown_cmark::Tag::CodeBlock(_))
        ) {
            let first = source[..range.start]
                .bytes()
                .filter(|b| *b == b'\n')
                .count();
            let last = source.as_bytes()[..range.end.saturating_sub(1)]
                .iter()
                .copied()
                .filter(|b| *b == b'\n')
                .count();
            lines.extend(first..=last);
        }
    }
    lines
}

/// A heading in the same CommonMark event stream used for browser HTML.
#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct OutlineHeading {
    pub level: u8,
    pub line: usize,
    pub title: String,
    pub anchor: String,
}

/// Browser HTML with document-local, unique heading anchors and source locations.
/// The native fragment renderer retains its existing output contract.
pub fn markdown_to_html_with_outline(source: &str) -> (String, Vec<OutlineHeading>) {
    use pulldown_cmark::{Tag, TagEnd};
    let events: Vec<_> = Parser::new_ext(source, markdown_options())
        .into_offset_iter()
        .collect();
    // Footnote definitions also create IDs, so never collide with their names.
    let mut ids: std::collections::HashSet<String> = events
        .iter()
        .filter_map(|(event, _)| {
            if let Event::Start(Tag::FootnoteDefinition(name)) = event {
                Some(name.to_string())
            } else {
                None
            }
        })
        .collect();
    let mut outline = Vec::new();
    let mut current: Option<OutlineHeading> = None;
    let mut counter = 0;
    let decorated = events.into_iter().map(|(event, range)| match event {
        Event::Start(Tag::Heading {
            level,
            classes,
            attrs,
            ..
        }) => {
            let anchor = loop {
                counter += 1;
                let candidate = format!("proof-heading-{counter}");
                if ids.insert(candidate.clone()) {
                    break candidate;
                }
            };
            current = Some(OutlineHeading {
                level: level as u8,
                line: source.as_bytes()[..range.start]
                    .iter()
                    .filter(|b| **b == b'\n')
                    .count()
                    + 1,
                title: String::new(),
                anchor: anchor.clone(),
            });
            Event::Start(Tag::Heading {
                level,
                id: Some(anchor.into()),
                classes,
                attrs,
            })
        }
        Event::End(TagEnd::Heading(level)) => {
            if let Some(mut heading) = current.take() {
                heading.title = heading.title.trim().to_string();
                outline.push(heading);
            }
            Event::End(TagEnd::Heading(level))
        }
        Event::Text(text) => {
            if let Some(heading) = &mut current {
                heading.title.push_str(&text);
            }
            Event::Text(text)
        }
        Event::Code(text) => {
            if let Some(heading) = &mut current {
                heading.title.push_str(&text);
            }
            Event::Code(text)
        }
        Event::Html(text) | Event::InlineHtml(text) => {
            if let Some(heading) = &mut current {
                heading.title.push_str(&text);
            }
            Event::Text(text)
        }
        Event::SoftBreak => {
            if let Some(heading) = &mut current {
                heading.title.push(' ');
            }
            Event::SoftBreak
        }
        Event::HardBreak => {
            if let Some(heading) = &mut current {
                heading.title.push(' ');
            }
            Event::HardBreak
        }
        other => other,
    });
    let mut html_out = String::new();
    html::push_html(&mut html_out, decorated);
    (html_out, outline)
}

#[cfg(test)]
mod outline_tests {
    use super::*;
    #[test]
    fn commonmark_outline_matches_heading_ids_and_lines() {
        let source = "# 界 *Title* `x`\n\nSetext heading\n--------------\n\n> ## Quoted\n\n```text\n# Not a heading\n```\n\n    # Also code\n\n## Repeat\n## Repeat\n";
        let (html, outline) = markdown_to_html_with_outline(source);
        assert_eq!(
            outline
                .iter()
                .map(|h| (h.level, h.line, h.title.as_str()))
                .collect::<Vec<_>>(),
            vec![
                (1, 1, "界 Title x"),
                (2, 3, "Setext heading"),
                (2, 6, "Quoted"),
                (2, 14, "Repeat"),
                (2, 15, "Repeat")
            ]
        );
        for heading in &outline {
            assert!(html.contains(&format!("id=\"{}\"", heading.anchor)));
        }
        assert_ne!(outline[3].anchor, outline[4].anchor);
        assert!(markdown_to_html_fragment("# Native").contains("<h1>Native</h1>"));
    }
    #[test]
    fn heading_anchors_avoid_footnote_ids_and_raw_html_stays_escaped() {
        let (html, outline) = markdown_to_html_with_outline("# <script>Bad</script>\n\nText[^proof-heading-1].\n\n[^proof-heading-1]: A footnote.\n");
        assert_eq!(outline[0].anchor, "proof-heading-2");
        assert_eq!(outline[0].title, "<script>Bad</script>");
        assert!(html.contains("&lt;script&gt;"));
        assert!(!html.contains("<script>"));
    }
    #[test]
    fn empty_and_crlf_headings_have_valid_locations() {
        assert!(markdown_to_html_with_outline("").1.is_empty());
        let (_, outline) = markdown_to_html_with_outline("\r\n#\r\n\r\n## Next\r\n");
        assert_eq!(outline[0].line, 2);
        assert_eq!(outline[0].title, "");
        assert_eq!(outline[1].line, 4);
    }
}
