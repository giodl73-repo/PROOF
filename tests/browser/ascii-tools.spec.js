import {test, expect} from '@playwright/test';
async function open(page, text) {
  await page.goto('/PROOF/'); await expect(page.locator('#status')).toContainText('Rust checked');
  await page.fill('#source', text); await page.click('#ascii-panel summary');
}
async function select(page, start, end = start) { await page.locator('#source').evaluate((e, v) => {e.focus(); e.setSelectionRange(...v);}, [start,end]); }
test('templates preserve surrounding Unicode and produce fenced literal ASCII', async ({page}) => {
  await open(page, '# 😀 Title\n\nAfter'); await select(page, 12, 12);
  await page.click('#insert-diagram');
  const value = await page.locator('#source').inputValue();
  expect(value).toContain('```text\n+--------------+'); expect(value).toContain('After');
  await expect(page.locator('#status')).toContainText('Rust checked');
  await expect(page.frameLocator('#preview').locator('pre')).toContainText('| Your label   |');
});
test('inserts inside tilde and long backtick fences without nesting', async ({page}) => {
  for (const fence of ['~~~', '````']) {
    const text = '# Top\n\n' + fence + 'text\n\n' + fence;
    await open(page, text); await select(page, text.indexOf('text\n') + 5);
    await page.selectOption('#diagram', 'branch'); await page.click('#insert-diagram');
    const value = await page.locator('#source').inputValue();
    expect(value.split('\n').filter(line => line === '```text')).toHaveLength(0); expect(value).toContain('| Ask |');
  }
});
test('Tab indentation excludes next line at selection boundary and is reversible', async ({page}) => {
  await open(page, '😀 one\n  two\nthree'); await select(page, 0, 13);
  await page.keyboard.press('Tab'); await expect(page.locator('#source')).toHaveValue('  😀 one\n    two\nthree');
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('#source')).toHaveValue('😀 one\n  two\nthree');
  await page.keyboard.press('Escape'); await page.keyboard.press('Tab'); await expect(page.locator('#source')).not.toBeFocused();
});
test('moves selected block both ways, preserving final newline and selection', async ({page}) => {
  await open(page, 'first\n😀 second\nthird\n'); await select(page, 6, 16);
  await page.keyboard.press('Alt+ArrowUp'); await expect(page.locator('#source')).toHaveValue('😀 second\nfirst\nthird\n');
  expect(await page.locator('#source').evaluate(e => e.value.slice(e.selectionStart,e.selectionEnd))).toBe('😀 second');
  await page.keyboard.press('Alt+ArrowDown'); await expect(page.locator('#source')).toHaveValue('first\n😀 second\nthird\n');
  await select(page, 0); await page.keyboard.press('Alt+ArrowUp'); await expect(page.locator('#source')).toHaveValue('first\n😀 second\nthird\n');
});
test('mobile tools remain accessible and editing works without Rust', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.route('**/worker.js', route => route.abort());
  await page.goto('/PROOF/'); await page.fill('#source', '+---+\n| x |\n+---+'); await page.click('#ascii-panel summary');
  await select(page, 0, 17); await page.click('#indent'); await expect(page.locator('#source')).toHaveValue('  +---+\n  | x |\n  +---+');
  await expect(page.locator('#markdown')).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('moving across an empty first line preserves the block', async ({page}) => {
  await open(page, '\nbox\ntail'); await select(page, 1, 4);
  await page.keyboard.press('Alt+ArrowUp'); await expect(page.locator('#source')).toHaveValue('box\n\ntail');
});

test('ASCII replacement has explicit undo and caret indentation keeps surrounding text', async ({page}) => {
  await open(page, 'hello world'); await select(page, 6, 11); await page.click('#insert-diagram');
  await page.click('#undo'); await expect(page.locator('#source')).toHaveValue('hello world');
  await select(page, 5); await page.keyboard.press('Tab');
  expect(await page.locator('#source').evaluate(e=>[e.selectionStart,e.selectionEnd])).toEqual([7,7]);
  await page.keyboard.type('!'); await expect(page.locator('#source')).toHaveValue('  hello! world');
  await page.keyboard.press('Shift+Tab'); await page.keyboard.type('?'); await expect(page.locator('#source')).toHaveValue('hello!? world');
});
test('fence boundary insertion and collapsed-tool keyboard exit are accurate', async ({page}) => {
  for (const [text, nested] of [['```text', false], ['```text\nx\n```', true]]) {
    await open(page, text); await select(page, text.length); await page.click('#insert-diagram');
    expect((await page.locator('#source').inputValue()).split('\n').filter(line=>line==='```text').length).toBe(nested ? 2 : 1);
  }
  await page.click('#ascii-panel summary'); await expect(page.locator('#ruler-note')).toContainText('Escape then Tab');
  await page.locator('#source').focus(); await page.keyboard.press('Escape'); await page.keyboard.press('Tab');
  await expect(page.locator('#source')).not.toBeFocused();
});

test('every supplied diagram is clean under the fixed Rust policy', async ({page}) => {
  for (const template of ['box','flow','branch']) {
    await open(page, '# Diagram\n\n'); await select(page, 11); await page.selectOption('#diagram', template); await page.click('#insert-diagram');
    await expect(page.locator('#status')).toContainText('Rust checked'); await expect(page.locator('#finding-count')).toHaveText('0 errors · 0 warnings');
  }
});

test('indented fences preserve relative box and connector alignment in HTML', async ({page}) => {
  let reference;
  for (const opener of ['~~~text', '  ~~~text', '  ```text']) {
    const close = opener.trim().replace('text',''); const text = '# Diagram\n\n' + opener + '\n\n' + close;
    await open(page,text); await select(page,text.indexOf('text\n')+5); await page.selectOption('#diagram','branch'); await page.click('#insert-diagram');
    await expect(page.locator('#status')).toContainText('Rust checked');
    const code = await page.frameLocator('#preview').locator('pre code').textContent();
    if (reference === undefined) reference = code; else expect(code).toBe(reference);
  }
});
