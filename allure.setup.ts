import * as fs from 'fs';
import * as path from 'path';

export default function globalSetup() {
  const dir = path.resolve(__dirname, 'allure-results');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(dir, 'environment.properties'),
    [
      'Browser=chromium',
      'Browser.Version=HeadlessShell',
      'Playwright.Version=1.62.0',
      'Allure.Version=2.32.0',
      `Node.Version=${process.version}`,
      `OS=${process.platform}`,
      'Project=HornetQATask',
      'CI=' + (!!process.env.CI).toString(),
      `Timestamp=${new Date().toISOString()}`,
    ].join('\n'),
  );
}
