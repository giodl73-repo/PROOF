use crate::checks::Check;
use crate::config::{CustomRule, CustomRuleWarnWhen};
use crate::diagnostic::Diagnostic;
use globset::{Glob, GlobSetBuilder};
use regex::Regex;
use std::path::{Path, PathBuf};

pub struct CustomRulesCheck {
    pub rules: Vec<CustomRule>,
    pub root: PathBuf,
}

impl Check for CustomRulesCheck {
    fn name(&self) -> &'static str {
        "custom_rules"
    }

    fn check(&self, path: &Path, content: &str) -> Vec<Diagnostic> {
        self.rules
            .iter()
            .filter(|rule| rule_applies(rule, path, &self.root))
            .filter_map(|rule| check_rule(rule, path, content))
            .collect()
    }
}

fn rule_applies(rule: &CustomRule, path: &Path, root: &Path) -> bool {
    if rule.only_in.is_empty() {
        return true;
    }

    let rel = path.strip_prefix(root).unwrap_or(path);
    let rel_str = rel.to_string_lossy().replace('\\', "/");
    let mut builder = GlobSetBuilder::new();
    for pattern in &rule.only_in {
        let Ok(glob) = Glob::new(pattern) else {
            return false;
        };
        builder.add(glob);
    }
    builder
        .build()
        .map(|set| set.is_match(&*rel_str))
        .unwrap_or(false)
}

fn check_rule(rule: &CustomRule, path: &Path, content: &str) -> Option<Diagnostic> {
    let regex = match Regex::new(&rule.pattern) {
        Ok(regex) => regex,
        Err(err) => {
            return Some(Diagnostic::error(
                path.to_path_buf(),
                1,
                1,
                "custom_rule_invalid_regex",
                format!(
                    "custom rule {:?} has invalid regex {:?}: {}",
                    rule.name, rule.pattern, err
                ),
            ));
        }
    };

    let found = regex.find(content);
    let should_warn = match rule.warn_when() {
        CustomRuleWarnWhen::Found => found.is_some(),
        CustomRuleWarnWhen::Missing => found.is_none(),
    };
    if !should_warn {
        return None;
    }

    let (line, col) = found
        .map(|m| line_col(content, m.start()))
        .unwrap_or((1usize, 1usize));
    let message = match rule.warn_when() {
        CustomRuleWarnWhen::Found => format!(
            "custom rule {:?}: {} (pattern found: {:?})",
            rule.name, rule.description, rule.pattern
        ),
        CustomRuleWarnWhen::Missing => format!(
            "custom rule {:?}: {} (pattern missing: {:?})",
            rule.name, rule.description, rule.pattern
        ),
    };

    if rule.severity.eq_ignore_ascii_case("error") {
        Some(Diagnostic::error(
            path.to_path_buf(),
            line,
            col,
            "custom_rule",
            message,
        ))
    } else {
        Some(Diagnostic::warning(
            path.to_path_buf(),
            line,
            col,
            "custom_rule",
            message,
        ))
    }
}

fn line_col(content: &str, byte_offset: usize) -> (usize, usize) {
    let mut line = 1usize;
    let mut col = 1usize;
    for (idx, ch) in content.char_indices() {
        if idx >= byte_offset {
            break;
        }
        if ch == '\n' {
            line += 1;
            col = 1;
        } else {
            col += 1;
        }
    }
    (line, col)
}
