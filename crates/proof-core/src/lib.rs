#![allow(
    clippy::approx_constant,
    clippy::doc_lazy_continuation,
    clippy::empty_line_after_doc_comments,
    clippy::explicit_counter_loop,
    clippy::manual_strip,
    clippy::needless_range_loop,
    clippy::ptr_arg,
    clippy::redundant_closure,
    clippy::redundant_field_names,
    clippy::single_match,
    clippy::too_many_arguments,
    clippy::type_complexity,
    clippy::unnecessary_map_or,
    clippy::unnecessary_sort_by,
    clippy::unnecessary_to_owned
)]

//! Shared text checks and HTML rendering used by native PROOF and its browser adapter.
pub mod checks;
pub mod config;
pub mod diagnostic;
pub mod html;
