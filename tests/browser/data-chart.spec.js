import {test,expect} from '@playwright/test';
async function open(page) { await page.goto('/PROOF/?example=guide'); await expect(page.locator('#attach-data')).toBeEnabled(); await page.click('#data-panel summary'); }
async function attach(page, name='scores.md', content='| Team | Score |\n|---|---|\n| Alpha | 10 |\n| Beta | 5 |\n') {
 await page.setInputFiles('#data-file',{name,mimeType:'text/plain',buffer:Buffer.from(content)}); await expect(page.locator('#generate-chart')).toBeEnabled();
}
async function generate(page) { await page.click('#generate-chart'); await expect(page.locator('#insert-chart')).toBeEnabled(); }
async function download(page, button) {const [d]=await Promise.all([page.waitForEvent('download'),page.click(button)]); let s='';for await(const chunk of await d.createReadStream())s+=chunk.toString();return s;}
test('file fields bind through Rust, materialized insertion and undo preserve original source',async({page})=>{
 await open(page);const original=await page.locator('#source').inputValue();await attach(page);await generate(page);
 await expect(page.locator('#data-preview')).toContainText('Alpha');await expect(page.locator('#source')).toHaveValue(original);
 const binding=JSON.parse(await download(page,'#download-binding'));expect(binding).toMatchObject({source:'scores.md',label:'Team',value:'Score',kind:'bar'});
 const chart=await download(page,'#download-chart');expect(chart).toContain('```text');expect(await download(page,'#download-data')).toContain('| Beta | 5 |');
 await page.click('#insert-chart');await expect(page.locator('#source')).toHaveValue(original+'\n'+chart);
 await expect(page.locator('#status')).toContainText('Rust checked');await expect(page.frameLocator('#preview').locator('pre').last()).toContainText('Alpha');
 await page.click('#undo');await expect(page.locator('#source')).toHaveValue(original);
});
test('JSON binding supports line/area and invalidates old output on field or size changes',async({page})=>{
 await open(page);await attach(page,'scores.json','[{"team":"A","score":1,"other":8},{"team":"B","score":4,"other":2}]');
 await page.selectOption('#data-label','team');await page.selectOption('#data-value','score');await page.selectOption('#data-kind','line');await generate(page);
 await page.selectOption('#data-kind','area');await expect(page.locator('#insert-chart')).toBeDisabled();await expect(page.locator('#data-preview')).toBeHidden();await generate(page);
 await page.fill('#data-width','10');await generateInvalid(page);await expect(page.locator('#data-status')).toContainText('20–120');
 await page.fill('#data-width','60.5');await generateInvalid(page);await expect(page.locator('#data-status')).toContainText('whole number');
});
async function generateInvalid(page){await page.click('#generate-chart');await expect(page.locator('#generate-chart')).toBeEnabled();await expect(page.locator('#insert-chart')).toBeDisabled();}
test('bad data and nonfinite values never replace source or keep stale chart exports',async({page})=>{
 await open(page);const original=await page.locator('#source').inputValue();await attach(page);await generate(page);
 await attach(page,'bad.json','[{"Team":"A","Score":"NaN"}]');await generateInvalid(page);await expect(page.locator('#data-status')).toContainText('finite');await expect(page.locator('#download-binding')).toBeDisabled();
 await page.setInputFiles('#data-file',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from([0xff])});await expect(page.locator('#data-status')).toContainText('UTF-8');await expect(page.locator('#generate-chart')).toBeDisabled();
 await page.setInputFiles('#data-file',{name:'large.md',mimeType:'text/plain',buffer:Buffer.alloc(65537,65)});await expect(page.locator('#data-status')).toContainText('64 KB');await expect(page.locator('#source')).toHaveValue(original);
});
test('stale generated responses cannot revive a cleared attachment',async({page})=>{
 await page.addInitScript(()=>{const send=Worker.prototype.postMessage;Worker.prototype.postMessage=function(data,...args){if(data.type==='data-chart')setTimeout(()=>send.call(this,data,...args),300);else send.call(this,data,...args);};});
 await open(page);await page.click('#sample-data');await expect(page.locator('#generate-chart')).toBeEnabled();await page.click('#generate-chart');await page.click('#clear-data');
 await page.waitForTimeout(500);await expect(page.locator('#insert-chart')).toBeDisabled();await expect(page.locator('#data-preview')).toBeHidden();await expect(page.locator('#data-status')).toContainText('No data attached');
});
test('open source fence blocks insertion, and attachments are session-only',async({page})=>{
 await open(page);await page.click('#sample-data');await generate(page);await page.fill('#source','# Keep\n\n```text\nunfinished');await page.click('#insert-chart');
 await expect(page.locator('#action-status')).toContainText('Close the source block');await expect(page.locator('#source')).toHaveValue('# Keep\n\n```text\nunfinished');
 await page.reload();await expect(page.locator('#attach-data')).toBeEnabled();await expect(page.locator('#generate-chart')).toBeDisabled();await expect(page.locator('#source')).toHaveValue('# Keep\n\n```text\nunfinished');
});
test('mobile file binding remains usable with long field names and worker failure',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);const field='name'.repeat(18);await attach(page,'data.json',JSON.stringify([{[field]:'A',value:2}]));await page.selectOption('#data-label',field);await page.selectOption('#data-value','value');await generate(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.route('**/worker.js',r=>r.abort());await page.reload();await expect(page.locator('#status')).toContainText('unavailable');await expect(page.locator('#attach-data')).toBeDisabled();await expect(page.locator('#markdown')).toBeEnabled();
});

test('empty unused boundary cells do not shift selected fields',async({page})=>{
 await open(page);await attach(page,'empty.md','|unused|year|value|other|\n|---|---|---|---|\n||2024|5|10|');await page.selectOption('#data-label','year');await page.selectOption('#data-value','value');await generate(page);
 const row=(await page.locator('#data-preview').textContent()).split('\n').find(line=>line.includes('2024'));expect(row.trim().endsWith('5')).toBe(true);
});
test('Rust insertion handles list fences and rejects responses after source edits',async({page})=>{
 await page.addInitScript(()=>{const send=Worker.prototype.postMessage;Worker.prototype.postMessage=function(data,...args){if(data.type==='data-append')setTimeout(()=>send.call(this,data,...args),300);else send.call(this,data,...args);};});
 await open(page);await page.click('#sample-data');await generate(page);await page.fill('#source','- ```text\n  content\n  ```');await page.click('#insert-chart');await expect(page.locator('#source')).toHaveValue(/Alpha/);
 await page.click('#insert-chart');await page.fill('#source','# New source');await expect(page.locator('#action-status')).toContainText('Source changed during insertion');await expect(page.locator('#source')).toHaveValue('# New source');
});
