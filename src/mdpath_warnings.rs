use mdpath::uri::Selector;

pub(crate) const NUMERIC_URI_STALE_CODE: &str = "md_numeric_uri_stale";

#[derive(Debug, Clone)]
pub(crate) struct NumericUriStaleWarning {
    pub(crate) code: &'static str,
    pub(crate) message: String,
    pub(crate) named_uri: String,
}

pub(crate) fn numeric_uri_stale_warning(
    uri: &mdpath::MdUri,
    element: &mdpath::ResolvedElement,
) -> Option<NumericUriStaleWarning> {
    if !matches!(uri.selector, Selector::Index(_)) {
        return None;
    }

    let label = element.label.as_ref()?;
    if label.trim().is_empty() {
        return None;
    }

    let named_uri = uri.clone().with_label(label.clone()).to_uri_string();
    Some(NumericUriStaleWarning {
        code: NUMERIC_URI_STALE_CODE,
        message: format!(
            "numeric md:// URI resolved to a labeled element; update to {}",
            named_uri
        ),
        named_uri,
    })
}
