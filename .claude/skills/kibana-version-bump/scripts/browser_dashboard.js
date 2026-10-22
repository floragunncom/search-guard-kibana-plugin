// End-to-end: add the Search Guard "Watch status" panel to a new dashboard, save, reload.
const puppeteer = require('puppeteer-core');
const [,, exe, base, watchId] = process.argv;
const problems = [];
let browserRef;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clickText = async (page, selector, text) => page.evaluate((sel, t) => {
  const el = Array.from(document.querySelectorAll(sel)).find((e) => e.textContent.includes(t));
  if (!el) return false; el.click(); return true;
}, selector, text);
(async () => {
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--window-size=1500,1100'] });
  browserRef = browser;
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 1100 });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`.slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Content Security Policy|Failed to load resource/.test(m.text())) problems.push(`console.error: ${m.text()}`.slice(0, 300)); });
  page.on('response', (r) => { const u = r.url(); if (r.status() >= 400 && /dashboards|searchguard-signals|saved_objects|content_management/.test(u)) problems.push(`http ${r.status()} ${r.request().method()} ${u.replace(base, '')}`.slice(0, 300)); });
  const log = (...a) => console.log(...a);

  // login
  await page.goto(`${base}/app/dashboards#/create`, { waitUntil: 'networkidle2', timeout: 120000 });
  await page.waitForSelector('[data-test-subj="sg.username"]', { timeout: 60000 });
  await page.type('[data-test-subj="sg.username"]', process.env.SG_USER || 'admin'); await page.type('[data-test-subj="sg.password"]', process.env.SG_PASS || 'admin');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }), page.click('[data-test-subj="sg.login"]')]);
  log('after login ->', page.url());
  if (!page.url().includes('/app/dashboards')) await page.goto(`${base}/app/dashboards#/create`, { waitUntil: 'networkidle2', timeout: 120000 });

  // open "Add panel" flyout
  await page.waitForSelector('[data-test-subj="dashboardAddTopNavButton"]', { timeout: 120000 });
  await page.click('[data-test-subj="dashboardAddTopNavButton"]');
  await page.waitForSelector('[data-test-subj="dashboardPanelSelectionFlyout"]', { timeout: 60000 });
  await sleep(1500);
  const groups = await page.evaluate(() => Array.from(document.querySelectorAll('[data-test-subj^="dashboardEditorMenu-"]')).map((e) => e.getAttribute('data-test-subj')));
  log('panel groups:', JSON.stringify(groups));
  const sgItem = await page.$('[data-test-subj="create-action-Add Signals watch"]');
  log('"Add Signals watch" item present:', !!sgItem);
  await page.screenshot({ path: process.env.SHOTS + '/10-add-panel-flyout.png' });
  if (!sgItem) throw new Error('Add Signals watch action not in flyout');
  await sgItem.click();

  // our watch selector flyout -> pick the watch
  await sleep(3000);
  await page.screenshot({ path: process.env.SHOTS + '/11-watch-selector.png' });
  let clicked = false;
  for (let i = 0; i < 20 && !clicked; i++) { clicked = await clickText(page, 'td, .euiTableCellContent, .euiTableRow', watchId); if (!clicked) await sleep(1000); }
  log('clicked watch row:', clicked);
  if (!clicked) throw new Error('watch row not found in selector');

  // panel appears
  await page.waitForFunction((w) => Array.from(document.querySelectorAll('[data-test-subj="embeddablePanel"] h3, .embPanel h3, h3')).some((h) => h.textContent.trim() === w), { timeout: 60000 }, watchId);
  const panelErr = await page.evaluate(() => !!document.querySelector('[data-test-subj="embeddableError"], [data-test-subj="embeddableStackError"]'));
  log('panel rendered with watch id: yes; panel error element present:', panelErr);
  await sleep(2000);
  await page.screenshot({ path: process.env.SHOTS + '/12-panel-added.png' });

  // close our watch selector flyout, then save the dashboard
  await clickText(page, 'button', 'Done'); await sleep(1500);
  const modalVisible = async (ms) => { try { await page.waitForSelector('[data-test-subj="savedObjectTitle"]', { timeout: ms }); return true; } catch { return false; } };
  let opened = false;
  for (const sel of ['[data-test-subj="dashboardInteractiveSaveMenuItem"]', '[data-test-subj="dashboardQuickSaveMenuItem"]', '[data-test-subj="dashboardSaveMenuItem"]']) {
    const el = await page.$(sel); if (!el) continue; await el.click(); if (await modalVisible(8000)) { opened = sel; break; }
  }
  if (!opened) {
    const sawOptions = await page.evaluate(() => { const b = document.querySelector('button[aria-label="Save options"]'); if (b) { b.click(); return true; } return false; });
    await sleep(1000);
    if (sawOptions) { const el = await page.$('[data-test-subj="dashboardInteractiveSaveMenuItem"]'); if (el) { await el.click(); if (await modalVisible(8000)) opened = 'save options menu'; } }
  }
  log('save modal opened via:', opened);
  if (!opened) { await page.screenshot({ path: process.env.SHOTS + '/12b-no-save-modal.png' }); throw new Error('save modal did not open'); }
  await page.type('[data-test-subj="savedObjectTitle"]', 'SG compat watch status');
  await page.click('[data-test-subj="confirmSaveSavedObjectButton"]');
  await page.waitForFunction(() => /#\/view\//.test(window.location.hash), { timeout: 60000 });
  const dashUrl = page.url(); log('saved ->', dashUrl);
  const dashId = dashUrl.match(/#\/view\/([^?]+)/)?.[1]; log('dashboard id:', dashId);

  // reload and verify the persisted panel renders again
  await page.goto(dashUrl, { waitUntil: 'networkidle2', timeout: 120000 });
  await page.waitForFunction((w) => Array.from(document.querySelectorAll('h3')).some((h) => h.textContent.trim() === w), { timeout: 60000 }, watchId);
  log('after reload: panel renders with watch id: yes');
  await sleep(2000);
  await page.screenshot({ path: process.env.SHOTS + '/13-dashboard-reloaded.png' });
  await browser.close();
  log('DASHBOARD_ID=' + dashId);
  log('PROBLEMS (' + problems.length + '):'); for (const p of problems) log('  ' + p);
  log('DASHBOARD_DONE');
})().catch(async (e) => { console.error('DASHBOARD_FAILED', e.message);
  try { const pages = await browserRef?.pages(); const pg = pages && pages[pages.length - 1]; if (pg) { console.log('url at failure:', pg.url()); await pg.screenshot({ path: process.env.SHOTS + '/99-dashboard-failure.png' }); } } catch {} console.log('PROBLEMS:'); for (const p of problems) console.log('  ' + p); process.exit(1); });
