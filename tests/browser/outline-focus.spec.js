import {test, expect} from '@playwright/test';
async function checked(page) { await expect(page.locator('#status')).toContainText('Rust checked'); }
const source = '# 界 *Title* `x`\n\nSetext heading\n--------------\n\n```text\n# Literal code\n```\n\n## Repeat\n\n## Repeat\n';
test('Rust outline handles Setext, formatting, Unicode and duplicate names, excluding fenced code', async ({page}) => {
  await page.goto('/PROOF/'); await checked(page); await page.fill('#source', source); await checked(page);
  await expect(page.locator('#outline-summary')).toHaveText('Outline · 4 headings'); await page.click('#outline-summary');
  await expect(page.locator('.outline-source')).toHaveCount(4);
  await expect(page.locator('.outline-source').first()).toContainText('H1 · 界 Title x · line 1');
  await expect(page.locator('.outline-source').nth(1)).toContainText('H2 · Setext heading · line 3');
  await page.locator('.outline-source').nth(3).click();
  expect(await page.locator('#source').evaluate(e => e.value.slice(e.selectionStart,e.selectionEnd))).toBe('## Repeat');
  expect(await page.locator('#source').evaluate(e => e.value.slice(0,e.selectionStart).split('\n').length)).toBe(12);
  await expect(page.locator('#source')).toHaveValue(source);
});
test('outline jumps within isolated HTML and duplicate heading anchors stay distinct', async ({page}) => {
  await page.goto('/PROOF/'); await checked(page);
  const text = '# Top\n\n' + 'Filler paragraph.\n\n'.repeat(70) + '## Repeat\n\n' + 'More filler.\n\n'.repeat(70) + '## Repeat\n';
  await page.fill('#source', text); await checked(page); await page.click('#outline-summary');
  await page.locator('.outline-preview').nth(2).click();
  await expect(page.locator('#preview')).toHaveAttribute('src', /#proof-heading-3$/);
  const frame = page.frameLocator('#preview');
  await expect(frame.locator('#proof-heading-3')).toHaveText('Repeat');
  await expect(frame.locator('#proof-heading-3')).toBeInViewport();
  await expect(frame.locator('#proof-heading-2')).not.toBeInViewport();
  await expect(frame.locator('h1')).toHaveText('Top');
  await expect(page.locator('#source')).toHaveValue(text);
});
test('focus view expands author space, keeps findings reachable and does not change source/results', async ({page}) => {
  await page.setViewportSize({width:1440,height:900}); await page.goto('/PROOF/?example=broken'); await checked(page);
  const text = await page.locator('#source').inputValue(); const before = await page.locator('#pane-source').boundingBox();
  await page.click('#focus'); await expect(page.locator('#focus')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#pane-checks')).toBeHidden();
  expect((await page.locator('#pane-source').boundingBox()).width).toBeGreaterThan(before.width);
  await expect(page.locator('#pane-preview')).toBeVisible(); await expect(page.locator('#html')).toBeEnabled();
  await page.click('#show-findings'); await expect(page.locator('#pane-checks')).toBeVisible();
  await page.locator('.diagnostic').first().click(); await expect(page.locator('#source')).toBeFocused();
  await expect(page.locator('#pane-checks')).toBeHidden(); await expect(page.locator('#source')).toHaveValue(text);
  await page.click('#focus'); await expect(page.locator('#pane-checks')).toBeVisible();
  await expect(page.locator('#focus')).toHaveAttribute('aria-pressed', 'false');
});
test('mobile keyboard outline navigation and focus preserve pane access', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/PROOF/'); await checked(page);
  await page.fill('#source', source); await checked(page); await page.click('#focus'); await page.click('#outline-summary');
  await page.locator('.outline-source').nth(1).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#source')).toBeFocused();
  expect(await page.locator('#source').evaluate(e => e.value.slice(e.selectionStart,e.selectionEnd))).toBe('Setext heading');
  await page.locator('.outline-preview').nth(2).click(); await expect(page.locator('#pane-preview')).toBeVisible();
  await expect(page.frameLocator('#preview').locator('#proof-heading-3')).toHaveText('Repeat');
  await page.click('#show-findings'); await expect(page.locator('#pane-checks')).toBeVisible();
  await page.click('#tab-source'); await expect(page.locator('#pane-source')).toBeVisible();
  await expect(page.locator('#source')).toHaveValue(source);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('outline invalidates with edits, errors show no stale headings, report includes current anchors', async ({page}) => {
  await page.goto('/PROOF/'); await checked(page); await page.click('#outline-summary');
  await expect(page.locator('.outline-source')).toHaveCount(2);
  await page.fill('#source', 'x'.repeat(65537)); await expect(page.locator('#status')).toContainText('64KB');
  await expect(page.locator('.outline-source')).toHaveCount(0);
  await page.fill('#source', 'Plain text without headings'); await checked(page);
  await expect(page.locator('#outline-summary')).toHaveText('Outline · 0 headings');
  await expect(page.locator('#outline')).toContainText('No Markdown headings');
  await page.fill('#source', '# Current\n'); await checked(page);
  // Exercise keyboard export without a focused editor's caret scroll racing a mouse click.
  await page.locator('#json').focus();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#json').press('Enter')]);
  let json = ''; for await (const chunk of await download.createReadStream()) json += chunk.toString();
  const result = JSON.parse(json); expect(result.outline).toEqual([{level:1,line:1,title:'Current',anchor:'proof-heading-1'}]);
  expect(result.html).toContain('id="proof-heading-1"'); expect(result.source).toBe('# Current\n');
});

test('mobile keyboard preview jump transfers focus to a visible destination control', async ({page}) => {
  await page.setViewportSize({width:390,height:844}); await page.goto('/PROOF/'); await checked(page);
  await page.click('#outline-summary'); await page.locator('.outline-preview').nth(1).focus();
  await page.keyboard.press('Enter'); await expect(page.locator('#pane-preview')).toBeVisible();
  await expect(page.locator('#view')).toBeVisible(); await expect(page.locator('#view')).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('#tab-preview')).toBeFocused();
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('#tab-checks')).toBeFocused();
  await expect(page.locator('#pane-checks')).toBeVisible();
});
