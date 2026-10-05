import {test, expect} from '@playwright/test';
async function checked(page) { await expect(page.locator('#status')).toContainText('Rust checked'); }
async function markdownDownload(page) {
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#markdown')]);
  let content = ''; for await (const chunk of await download.createReadStream()) content += chunk.toString();
  return content;
}
test('recover edited shared source, clear saved draft without clearing editor', async ({page}) => {
  await page.goto('/PROOF/#source=' + encodeURIComponent('# Shared old source')); await checked(page);
  const draft = '# My draft\n\n界 🌱 unique sentence.';
  await page.fill('#source', draft); await expect(page.locator('#draft-status')).toContainText('saved');
  expect(new URL(page.url()).hash).toBe(''); await page.reload(); await checked(page);
  await expect(page.locator('#source')).toHaveValue(draft); await expect(page.locator('#draft-status')).toContainText('Recovered');
  await page.click('#clear-draft'); await expect(page.locator('#source')).toHaveValue(draft);
  expect(await page.evaluate(() => localStorage.getItem('proof-workbench-draft-v1'))).toBeNull();
  await page.reload(); await checked(page); await expect(page.locator('#source')).toHaveValue(/Field notes/);
});
test('explicit shared and example links override local draft without replacing stored draft', async ({page}) => {
  await page.goto('/PROOF/'); await page.fill('#source', '# Local draft');
  await page.goto('/PROOF/?example=math'); await checked(page); await expect(page.locator('#source')).toHaveValue(/Terminal math/);
  await page.goto('/PROOF/#source=' + encodeURIComponent('# Incoming')); await checked(page);
  await expect(page.locator('#source')).toHaveValue('# Incoming');
  expect(await page.evaluate(() => localStorage.getItem('proof-workbench-draft-v1'))).toBe('# Local draft');
});
test('example and local UTF8 file replacement can be undone', async ({page}) => {
  await page.goto('/PROOF/'); const original = '# Keep me\n\n原文 🌱'; await page.fill('#source', original);
  await page.selectOption('#example', 'broken'); await page.click('#load'); await checked(page);
  await expect(page.locator('#source')).toHaveValue(/First title/); await page.click('#undo');
  await expect(page.locator('#source')).toHaveValue(original);
  await page.locator('#file').setInputFiles({name:'notes.md',mimeType:'text/markdown',buffer:Buffer.from('# Local file\r\n\r\n界 🌱')});
  await expect(page.locator('#source')).toHaveValue('# Local file\n\n界 🌱'); await checked(page);
  await page.click('#undo'); await expect(page.locator('#source')).toHaveValue(original);
});
test('invalid local files preserve the draft', async ({page}) => {
  await page.goto('/PROOF/'); await page.fill('#source', '# Keep this');
  await page.locator('#file').setInputFiles({name:'bad.md',mimeType:'text/markdown',buffer:Buffer.from([0xff,0xfe,0xff])});
  await expect(page.locator('#action-status')).toContainText('Could not read UTF-8'); await expect(page.locator('#source')).toHaveValue('# Keep this');
  await page.locator('#file').setInputFiles({name:'huge.md',mimeType:'text/markdown',buffer:Buffer.alloc(1024*1024+1)});
  await expect(page.locator('#action-status')).toContainText('up to 1 MB'); await expect(page.locator('#source')).toHaveValue('# Keep this');
});
test('storage denial and worker failure still allow exact source download', async ({page}) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('denied'); }; });
  await page.route('**/*.wasm', route => route.abort()); await page.goto('/PROOF/');
  await expect(page.locator('#status')).toContainText('unavailable');
  const draft = '# Recover without Rust\n\n界 🌱'; await page.fill('#source', draft);
  await expect(page.locator('#draft-status')).toContainText('recovery unavailable');
  expect(await markdownDownload(page)).toBe(draft); await expect(page.locator('#html')).toBeDisabled();
  await expect(page.locator('#json')).toBeDisabled();
});
test('overlimit input can still be downloaded and recovered', async ({page}) => {
  await page.goto('/PROOF/'); await checked(page); const draft = '# Too large\n' + '界'.repeat(22000);
  await page.fill('#source', draft); await expect(page.locator('#status')).toContainText('64KB');
  expect(await markdownDownload(page)).toBe(draft); await expect(page.locator('#html')).toBeDisabled();
  await page.reload(); await expect(page.locator('#source')).toHaveValue(draft);
});
test('related ASCII findings group without hiding diagnostic evidence', async ({page}) => {
  await page.goto('/PROOF/?example=broken'); await checked(page);
  await expect(page.locator('.diagnostic')).toHaveCount(5); await expect(page.locator('.finding-group')).toHaveCount(4);
  await expect(page.locator('#finding-count')).toHaveText('3 errors · 2 warnings');
  await expect(page.locator('#diagnostics')).toContainText('Match this row to the box border');
  await expect(page.locator('#diagnostics')).toContainText('ascii_box_col');
});
test('Unicode diagnostic navigation selects the correct complete line and numbers follow edits', async ({page}) => {
  await page.goto('/PROOF/'); await checked(page);
  const source = '# 界 🌱\n\n## Same\n\n## Same\n'; await page.fill('#source', source); await checked(page);
  await page.locator('.diagnostic').filter({hasText:'md_duplicate_heading'}).click();
  expect(await page.locator('#source').evaluate(e => e.value.slice(e.selectionStart,e.selectionEnd))).toBe('## Same');
  await expect(page.locator('#line-numbers')).toHaveText('1\n2\n3\n4\n5\n6');
});
test('mobile tabs work by keyboard and a finding returns to source', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/PROOF/?example=broken'); await checked(page);
  await expect(page.locator('#pane-source')).toBeVisible(); await expect(page.locator('#pane-checks')).toBeHidden();
  await page.locator('#tab-source').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-checks')).toBeFocused(); await expect(page.locator('#pane-checks')).toBeVisible();
  await page.locator('.diagnostic').first().click(); await expect(page.locator('#pane-source')).toBeVisible();
  await expect(page.locator('#source')).toBeFocused(); await page.click('#tab-preview');
  await expect(page.locator('#preview')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('wide ASCII terminal output stays literal and scrolls instead of wrapping', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/PROOF/'); await checked(page);
  const diagram = '+' + '-'.repeat(150) + '+'; await page.fill('#source', '# Wide\n\n```text\n' + diagram + '\n```'); await checked(page);
  await page.click('#tab-preview'); await page.selectOption('#view', 'terminal');
  await expect(page.locator('#terminal')).toContainText(diagram);
  expect(await page.locator('#terminal').evaluate(e => getComputedStyle(e).whiteSpace)).toBe('pre');
  expect(await page.locator('#terminal').evaluate(e => e.scrollWidth > e.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('line gutter and ruler follow the exact editor offsets at its scroll limits', async ({page}) => {
  await page.goto('/PROOF/');
  const text = Array.from({length: 150}, (_, i) => `Line ${i}: ${'-'.repeat(250)}`).join('\n');
  await page.fill('#source', text);
  for (const width of [1440, 390]) {
    await page.setViewportSize({width, height:844});
    const offsets = await page.locator('#source').evaluate(e => {
      e.scrollTop = e.scrollHeight; e.scrollLeft = e.scrollWidth; e.dispatchEvent(new Event('scroll'));
      return {x:e.scrollLeft,y:e.scrollTop};
    });
    expect(offsets.x).toBeGreaterThan(0); expect(offsets.y).toBeGreaterThan(0);
    expect(await page.locator('#line-number-text').evaluate(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m42)).toBe(-offsets.y);
    expect(await page.locator('#ruler-text').evaluate(e => new DOMMatrixReadOnly(getComputedStyle(e).transform).m41)).toBe(-offsets.x);
    expect(await page.locator('#ruler-text').evaluate(e => { const marks=e.getBoundingClientRect(); const clip=document.getElementById('ruler').getBoundingClientRect(); return marks.left <= clip.left && marks.right >= clip.right; })).toBe(true);
  }
});

test('URL update rejection cannot retain stale results or block draft saving', async ({page}) => {
  await page.goto('/PROOF/'); await checked(page);
  await page.evaluate(() => { history.replaceState = () => { throw new DOMException('denied', 'SecurityError'); }; });
  const source = '# New title\n# Another title'; await page.fill('#source', source);
  await expect(page.locator('#html')).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('proof-workbench-draft-v1'))).toBe(source);
  await checked(page); await expect(page.locator('#diagnostics')).toContainText('md_h1_count');
  await expect(page.locator('#action-status')).toContainText('Could not update');
  await page.click('#share'); await expect(page.locator('#action-status')).toContainText('Could not create');
});
test('replacement and undo acknowledgements do not hide storage or recovery-limit warnings', async ({page}) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('denied'); }; });
  await page.goto('/PROOF/'); await page.fill('#source', '# Draft'); await page.click('#load');
  await expect(page.locator('#draft-status')).toContainText('recovery unavailable');
  await expect(page.locator('#action-status')).toContainText('Example loaded');
  await page.click('#undo'); await expect(page.locator('#draft-status')).toContainText('recovery unavailable');
  const huge = 'x'.repeat(1024*1024+1); await page.fill('#source', huge); await page.click('#load'); await page.click('#undo');
  await expect(page.locator('#source')).toHaveValue(huge);
  await expect(page.locator('#draft-status')).toContainText('exceeds the 1 MB recovery limit');
  await expect(page.locator('#action-status')).toContainText('Previous source restored');
});
