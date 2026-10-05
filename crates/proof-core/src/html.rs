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
