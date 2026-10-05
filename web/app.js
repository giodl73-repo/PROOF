const $ = id => document.getElementById(id);
const examples={guide:'# Field notes\n\n## A small system\n\nKeep the source readable and the output useful.\n\n| Stage | Result |\n|-------|--------|\n| Draft | Markdown |\n| Check | Diagnostics |\n\n```text\n+----------+\n|  SOURCE  |\n+----------+\n```\n',broken:'# First title\n# Second title\n\n#### Skipped level\n\n| Name | Value |\n|------|-------|\n| One |\n\n```text\n+---------+\n| broken |\n+---------+\n```\n',math:'# Terminal math\n\n$\\alpha + \\beta = \\gamma$\n\n$\\sqrt{x} + x^2$\n\nInline math expands in the terminal view. HTML shows the original Markdown math text.\n\n```text\n$\\alpha$ stays literal in a fence.\n```\n'};

const draftKey = 'proof-workbench-draft-v1';
const savedLimit = 1024 * 1024;
let id = 0, result = null, ready = false, failed = false, previewURL = null;
let undoSource = null, timer = null, worker = null, fileRequest = 0;
const retiredURLs = new Set();
const generatedDownloads = ['html', 'json'];
const bytes = text => new TextEncoder().encode(text).length;
const rulerMeasure = document.createElement('canvas').getContext('2d');
function notice(text) { $('draft-status').textContent = text; }
function action(text) { $('action-status').textContent = text; }
function saveDraft() {
  if (bytes($('source').value) > savedLimit) {
    try { localStorage.removeItem(draftKey); } catch {}
    notice('Draft exceeds the 1 MB recovery limit. Download Markdown to keep it.');
    return;
  }
  try { localStorage.setItem(draftKey, $('source').value); notice('Draft saved in this browser.'); }
  catch { notice('Local recovery unavailable. Download Markdown to keep your draft.'); }
}
function sourceAids() {
  const source = $('source');
  const lines = source.value.split('\n');
  $('line-number-text').textContent = lines.map((_, i) => i + 1).join('\n');
  const font = getComputedStyle($('ruler'));
  if (rulerMeasure) rulerMeasure.font = `${font.fontSize} ${font.fontFamily}`;
  const cellWidth = rulerMeasure?.measureText('0').width || 8;
  const marks = Math.max(200, Math.ceil(source.scrollWidth / cellWidth) + 20);
  $('ruler-text').textContent = '123456789|'.repeat(Math.ceil(marks / 10));
  $('size').textContent = `${bytes(source.value).toLocaleString()} bytes · ${lines.length.toLocaleString()} lines`;
  // Translate clipped aids: independent scroll boxes can clamp at different offsets.
  $('line-number-text').style.transform = `translateY(${-source.scrollTop}px)`;
  $('ruler-text').style.transform = `translateX(${-source.scrollLeft}px)`;
}
function invalidate() {
  id++; result = null;
  generatedDownloads.forEach(key => $(key).disabled = true);
  $('diagnostics').replaceChildren(); $('finding-count').textContent = 'Not checked';
  $('outline').replaceChildren(); $('outline-summary').textContent = 'Outline · not checked';
  $('preview').hidden = true; $('terminal').textContent = '';
  $('status').textContent = failed ? 'Rust engine unavailable. Your source can still be edited and downloaded.' : ready ? 'Checking with Rust…' : 'Loading Rust engine…';
}
function check() {
  clearTimeout(timer); invalidate(); sourceAids();
  if (ready) {
    const request = id;
    timer = setTimeout(() => worker.postMessage({id: request, source: $('source').value}), 120);
  }
}
function edited() {
  fileRequest++; action('');
  // URL bookkeeping must never block source saving or result invalidation.
  try { history.replaceState(null, '', location.pathname); }
  catch { action('Could not update this URL. Copy or download the current source instead of sharing the old address.'); }
  saveDraft(); check();
}
function pane(name, focus = false) {
  document.querySelector('.workspace').dataset.pane = name;
  document.querySelectorAll('[role="tab"]').forEach(tab => {
    const active = tab.dataset.pane === name;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  if (name === 'source') sourceAids();
}
function replaceSource(text, message) {
  undoSource = $('source').value; $('undo').disabled = false;
  $('source').value = text; edited(); action([message, $('action-status').textContent].filter(Boolean).join(' ')); pane('source');
}
const guidance = {
  md_h1_count: 'Keep one document title (#). Use ## for sections beneath it.',
  md_heading_hierarchy: 'Move down one heading level at a time: # → ## → ###.',
  md_duplicate_heading: 'Give repeated headings distinct names so references stay clear.',
  md_table_col_mismatch: 'Give each table row the same number of cells as the header.',
  ascii_box: 'Match this row to the box border width and separator columns. Use the ruler and terminal view to compare spacing.'
};
function renderFindings(diagnostics) {
  const errors = diagnostics.filter(d => d.severity === 'error').length;
  $('finding-count').textContent = `${errors} errors · ${diagnostics.length - errors} warnings`;
  if (!diagnostics.length) { $('diagnostics').textContent = 'No findings under this browser policy.'; return; }
  const groups = new Map();
  for (const d of diagnostics) {
    const family = d.code.startsWith('ascii_box_') ? 'ascii_box' : d.code;
    const key = `${d.span.line}:${family}`;
    if (!groups.has(key)) groups.set(key, {line: d.span.line, family, items: []});
    groups.get(key).items.push(d);
  }
  for (const group of groups.values()) {
    const section = document.createElement('section'); section.className = 'finding-group';
    const help = document.createElement('p');
    help.textContent = guidance[group.family] || 'Select the finding to inspect its source line. The report retains the complete diagnostic.';
    section.append(help);
    for (const d of group.items) {
      const button = document.createElement('button'); button.className = 'diagnostic';
      const title = document.createElement('strong');
      title.textContent = `${d.severity} · ${d.code} · line ${d.span.line}${d.code.startsWith('MATH-') ? ' (line only)' : `, column ${d.span.col}`}`;
      button.append(title, document.createTextNode(d.message));
      button.onclick = () => {
        selectSourceLine(d.span.line);
      };
      button.title = 'Select this source line'; section.append(button);
    }
    $('diagnostics').append(section);
  }
}

function selectSourceLine(line) {
  pane('source'); const source = $('source'); const lines = source.value.split('\n');
  const offset = lines.slice(0, line - 1).reduce((n, text) => n + text.length + 1, 0);
  source.focus(); source.setSelectionRange(offset, offset + (lines[line - 1]?.length || 0));
  source.scrollTop = Math.max(0, (line - 3) * 22); sourceAids();
}
function renderOutline(headings) {
  $('outline-summary').textContent = `Outline · ${headings.length} heading${headings.length === 1 ? '' : 's'}`;
  if (!headings.length) { $('outline').textContent = 'No Markdown headings in this document.'; return; }
  for (const heading of headings) {
    const row = document.createElement('div'); row.className = 'outline-row';
    row.style.paddingLeft = `${(heading.level - 1) * 10}px`;
    const source = document.createElement('button'); source.className = 'outline-source';
    source.textContent = `H${heading.level} · ${heading.title || '(Untitled heading)'} · line ${heading.line}`;
    source.title = 'Select heading in source'; source.onclick = () => selectSourceLine(heading.line);
    const preview = document.createElement('button'); preview.className = 'outline-preview'; preview.textContent = 'Preview';
    preview.setAttribute('aria-label', `Preview ${heading.title || 'untitled heading'} at line ${heading.line}`);
    preview.onclick = () => {
      if (!result || !previewURL) return;
      pane('preview'); $('view').value = 'html'; $('terminal').hidden = true; $('preview').hidden = false;
      // Navigate the isolated document by fragment without reading its opaque origin.
      $('preview').src = previewURL + '#' + heading.anchor;
      $('view').focus();
    };
    row.append(source, preview); $('outline').append(row);
  }
}
// All offsets use textarea UTF-16 coordinates, including non-ASCII surrounding text.
const diagrams = {
  box: '+--------------+\n| Your label   |\n+--------------+',
  flow: '+-------+     +-------+\n| Input | --> | Output|\n+-------+     +-------+',
  branch: '+-----+\n| Ask |\n+-----+\n   |\n   +------> Yes\n   |\n   +------> No'
};
function applyEdit(start, end, text) {
  const source = $('source'); undoSource = source.value; $('undo').disabled = false; source.focus();
  source.setRangeText(text, start, end, 'select'); edited(); sourceAids();
}
function selectedLines() {
  const source = $('source'), value = source.value;
  const start = source.selectionStart === 0 ? 0 : value.lastIndexOf('\n', source.selectionStart - 1) + 1;
  // A selection ending at the next line's start does not include that line.
  const last = source.selectionEnd > source.selectionStart && value[source.selectionEnd - 1] === '\n' ? source.selectionEnd - 1 : source.selectionEnd;
  const newline = value.indexOf('\n', last);
  return {start, end: newline < 0 ? value.length : newline};
}
function indentLines(outdent = false) {
  const source = $('source'), {start, end} = selectedLines();
  const selection = [source.selectionStart, source.selectionEnd];
  let position = start;
  const deltas = [];
  const text = source.value.slice(start, end).split('\n').map(line => {
    const removed = outdent ? (line.match(/^( {1,2}|\t)/)?.[0].length || 0) : 0;
    deltas.push({position, removed}); position += line.length + 1;
    return outdent ? line.slice(removed) : '  ' + line;
  }).join('\n');
  const adjusted = selection.map(offset => offset + deltas.reduce((delta, item) =>
    delta + (outdent ? -Math.min(item.removed, Math.max(0, offset - item.position)) : offset >= item.position ? 2 : 0), 0));
  applyEdit(start, end, text); source.setSelectionRange(...adjusted);
}
function moveLines(down) {
  const source = $('source'), value = source.value, {start, end} = selectedLines();
  if (down) {
    if (end === value.length) return;
    const nextBreak = value.indexOf('\n', end + 1), nextEnd = nextBreak < 0 ? value.length : nextBreak;
    const next = value.slice(end + 1, nextEnd), block = value.slice(start, end);
    applyEdit(start, nextEnd, next + '\n' + block);
    source.setSelectionRange(start + next.length + 1, nextEnd);
  } else {
    if (!start) return;
    const previous = start <= 1 ? 0 : value.lastIndexOf('\n', start - 2) + 1, block = value.slice(start, end);
    applyEdit(previous, end, block + '\n' + value.slice(previous, start - 1));
    source.setSelectionRange(previous, previous + block.length);
  }
}
$('insert-diagram').onclick = () => {
  const source = $('source'), before = source.value.slice(0, source.selectionStart);
  // Track CommonMark fence delimiters; tilde fences and longer backtick fences
  // must not receive nested triple-backtick templates.
  let fence = null, fenceIndent = '';
  for (const line of before.split('\n')) {
    const match = line.match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
    if (!match) continue;
    if (!fence && !(match[2][0] === '`' && match[3].includes('`'))) { fence = match[2]; fenceIndent = match[1]; }
    else if (fence && match[2][0] === fence[0] && match[2].length >= fence.length && !match[3].trim()) { fence = null; fenceIndent = ''; }
  }
  const diagram = diagrams[$('diagram').value].split('\n').map(line => fenceIndent + line).join('\n');
  const prefix = before && !before.endsWith('\n') ? '\n' : '';
  const after = source.value.slice(source.selectionEnd);
  const suffix = after && !after.startsWith('\n') ? '\n' : '';
  applyEdit(source.selectionStart, source.selectionEnd, prefix + (fence ? diagram : '```text\n' + diagram + '\n```') + suffix);
};
$('indent').onclick = () => indentLines(); $('outdent').onclick = () => indentLines(true);
$('move-up').onclick = () => moveLines(false); $('move-down').onclick = () => moveLines(true);
let releaseTab = false;
$('source').addEventListener('keydown', event => {
  if (event.key === 'Escape') { releaseTab = true; return; }
  if (event.key === 'Tab' && releaseTab) { releaseTab = false; return; }
  releaseTab = false;
  if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); indentLines(event.shiftKey); }
  if (event.altKey && !event.ctrlKey && !event.metaKey && ['ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); moveLines(event.key === 'ArrowDown'); }
});
$('focus').onclick = () => {
  const focused = $('focus').getAttribute('aria-pressed') !== 'true';
  $('focus').setAttribute('aria-pressed', String(focused)); $('focus').textContent = focused ? 'Exit focus view' : 'Focus view';
  document.body.classList.toggle('focus-mode', focused); $('workspace').dataset.focus = String(focused);
  pane('source'); sourceAids();
};
$('show-findings').onclick = () => {
  pane('checks'); $('pane-checks').scrollIntoView({block:'nearest'});
  $('pane-checks').setAttribute('tabindex', '-1'); $('pane-checks').focus();
};

function workerFailed() { failed = true; ready = false; clearTimeout(timer); invalidate(); }
try {
  worker = new Worker('worker.js', {type: 'module'});
  worker.onerror = workerFailed;
  worker.onmessage = ({data}) => {
    if (data.ready) { ready = true; check(); return; }
    if (data.id !== id) return;
    if (data.error) { $('status').textContent = data.error; return; }
    result = data.result;
    generatedDownloads.forEach(key => $(key).disabled = false);
    $('status').textContent = `Rust checked this document · ${result.diagnostics.length} diagnostic${result.diagnostics.length === 1 ? '' : 's'}`;
    renderFindings(result.diagnostics);
    renderOutline(result.outline);
    $('held').replaceChildren(...result.unassessed.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    if (previewURL) retiredURLs.add(previewURL);
    previewURL = URL.createObjectURL(new Blob([result.html], {type: 'text/html'}));
    $('preview').onload = () => { for (const url of retiredURLs) URL.revokeObjectURL(url); retiredURLs.clear(); };
    $('preview').src = previewURL; $('preview').hidden = $('view').value !== 'html';
    $('terminal').textContent = result.terminal;
  };
} catch { workerFailed(); }
$('source').addEventListener('input', edited);
$('source').addEventListener('scroll', sourceAids);
$('load').onclick = () => replaceSource(examples[$('example').value], 'Example loaded. Undo source change restores your previous source.');
$('undo').onclick = () => {
  if (undoSource === null) return;
  const previous = undoSource; undoSource = null; $('undo').disabled = true;
  $('source').value = previous; edited(); action(['Previous source restored.', $('action-status').textContent].filter(Boolean).join(' '));
};
$('clear-draft').onclick = () => {
  try { localStorage.removeItem(draftKey); notice('Saved draft cleared. Current source stays editable; later edits save a new draft.'); }
  catch { notice('Local storage unavailable. Current source stays editable.'); }
};
$('open').onclick = () => $('file').click();
$('file').onchange = async () => {
  const file = $('file').files[0]; $('file').value = ''; if (!file) return;
  const request = ++fileRequest;
  if (file.size > savedLimit) { action('Open files up to 1 MB. Current source was kept.'); return; }
  try {
    const text = new TextDecoder('utf-8', {fatal: true}).decode(await file.arrayBuffer());
    if (request !== fileRequest) return;
    replaceSource(text.replace(/\r\n/g, '\n'), `Opened ${file.name} locally. Undo source change restores the previous source.`);
  } catch { if (request === fileRequest) action('Could not read UTF-8 Markdown. Current source was kept.'); }
};
$('view').onchange = () => { $('preview').hidden = !result || $('view').value !== 'html'; $('terminal').hidden = $('view').value !== 'terminal'; };
for (const tab of document.querySelectorAll('[role="tab"]')) {
  tab.onclick = () => pane(tab.dataset.pane);
  tab.onkeydown = event => {
    const names = ['source', 'checks', 'preview']; let index = names.indexOf(tab.dataset.pane);
    if (event.key === 'ArrowRight') index = (index + 1) % 3;
    else if (event.key === 'ArrowLeft') index = (index + 2) % 3;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = 2;
    else return;
    event.preventDefault(); pane(names[index], true);
  };
}
function download(content, name, type) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('markdown').onclick = () => download($('source').value, 'document.md', 'text/markdown');
$('html').onclick = () => result && download(result.html, 'document.html', 'text/html');
$('json').onclick = () => result && download(JSON.stringify(result, null, 2), 'proof-report.json', 'application/json');
$('share').onclick = () => {
  if (bytes($('source').value) > 8192) { action('Sharing is limited to 8 KB. Download larger sources instead.'); return; }
  try {
    history.replaceState(null, '', location.pathname + '#source=' + encodeURIComponent($('source').value));
    action('Source is in this URL. Copy the address to share it.');
  } catch { action('Could not create a shared URL. Download Markdown to keep your source.'); }
};
const key = new URLSearchParams(location.search).get('example');
$('example').value = Object.hasOwn(examples, key) ? key : 'guide';
$('source').value = examples[$('example').value];
try {
  if (location.hash.startsWith('#source=')) {
    if (location.hash.length >= 26000) throw new Error('Shared source too large');
    const shared = decodeURIComponent(location.hash.slice(8));
    if (bytes(shared) > 8192) throw new Error('Shared source too large');
    $('source').value = shared; notice('Shared source opened. Edit to save a local draft.');
  } else if (!Object.hasOwn(examples, key)) {
    const saved = localStorage.getItem(draftKey);
    if (saved !== null && bytes(saved) <= savedLimit) { $('source').value = saved; notice('Recovered your draft from this browser.'); }
  }
} catch { notice('Shared source or local recovery unavailable. An example is loaded; existing saved drafts were kept.'); }
window.addEventListener('resize', sourceAids);
pane('source'); sourceAids();
