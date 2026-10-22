// Drives a real browser against the Kibana distribution + SG plugin: login form -> home -> SG apps.
// Usage: node browser_login.js <chromiumPath> <kibanaUrl> [appPath ...]
const puppeteer = require('puppeteer-core');
const [,, exe, base, ...paths] = process.argv;
const problems = [];
(async () => {
  const browser = await puppeteer.launch({ executablePath: exe, headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1400,1000'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`.slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console.error: ${m.text()}`.slice(0, 300)); });
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`.slice(0, 300)));
  page.on('response', (r) => { if (r.status() >= 500) problems.push(`http ${r.status()}: ${r.url()}`.slice(0, 300)); });

  const log = (...a) => console.log(...a);
  await page.goto(`${base}/app/home`, { waitUntil: 'networkidle2', timeout: 120000 });
  log('after goto /app/home ->', page.url());
  await page.waitForSelector('[data-test-subj="sg.username"]', { timeout: 60000 });
  log('login form rendered: yes');
  await page.screenshot({ path: process.env.SHOTS + '/01-login.png' });
  await page.type('[data-test-subj="sg.username"]', process.env.SG_USER || 'admin');
  await page.type('[data-test-subj="sg.password"]', process.env.SG_PASS || 'admin');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }),
    page.click('[data-test-subj="sg.login"]'),
  ]);
  log('after login ->', page.url());
  await page.waitForSelector('[data-test-subj="kibanaChrome"], [data-test-subj="homeApp"], header', { timeout: 120000 });
  await page.screenshot({ path: process.env.SHOTS + '/02-home.png' });
  const navSg = await page.evaluate(() => Array.from(document.querySelectorAll('[data-test-subj]'))
    .map((e) => e.getAttribute('data-test-subj')).filter((s) => /sg|searchguard|tenant/i.test(s)).slice(0, 15));
  log('SG test-subj on home:', JSON.stringify(navSg));
  let i = 3;
  for (const p of paths) {
    await page.goto(`${base}${p}`, { waitUntil: 'networkidle2', timeout: 120000 });
    await new Promise((r) => setTimeout(r, 3000));
    const title = await page.title();
    const subj = await page.evaluate(() => Array.from(document.querySelectorAll('[data-test-subj]'))
      .map((e) => e.getAttribute('data-test-subj')).filter((s) => /sg|searchguard|signals|tenant|watch/i.test(s)).slice(0, 10));
    log(`app ${p} -> url=${page.url()} title="${title}" subj=${JSON.stringify(subj)}`);
    await page.screenshot({ path: `${process.env.SHOTS}/0${i++}-${p.replace(/[^a-z0-9]+/gi, '_')}.png` });
  }
  await browser.close();
  // Kibana's own background noise on a cluster without x-pack security: resource 403/404s,
  // CSP reports, elastic_assistant/fleet/api-keys probes. Everything else is reported in full.
  const noise = /Failed to load resource|Content Security Policy|elastic_assistant|cloud_connect|fleet|API keys|security\/me|\/internal\/security/;
  const pageErrors = problems.filter((p) => p.startsWith('pageerror'));
  const sgProblems = problems.filter((p) => !p.startsWith('pageerror') && /searchguard|sg\b|multitenancy|signals|auth/i.test(p) && !noise.test(p));
  const other = problems.filter((p) => !pageErrors.includes(p) && !sgProblems.includes(p) && !noise.test(p));
  const noisy = problems.length - pageErrors.length - sgProblems.length - other.length;
  log(`PAGEERRORS (${pageErrors.length}, expect 0):`); for (const p of pageErrors) log('  ' + p);
  log(`SEARCH GUARD PROBLEMS (${sgProblems.length}, expect 0):`); for (const p of sgProblems) log('  ' + p);
  log(`OTHER (${other.length}, read them):`); for (const p of other) log('  ' + p);
  log(`known Kibana noise ignored: ${noisy}`);
  log('BROWSER_DONE');
})().catch((e) => { console.error('BROWSER_FAILED', e.message); process.exit(1); });
