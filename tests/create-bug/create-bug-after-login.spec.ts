import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '../fixtures/pages';

type User = {
  username: string;
  password: string;
};

test('user can log in and create a bug', async ({ loginPage, boardPage, createBugModal }) => {
  const usersPath = join(process.cwd(), 'users.json');
  const users = JSON.parse(readFileSync(usersPath, 'utf-8')) as User[];
  const user = users[0];

  if (!user) {
    throw new Error('users.json must contain at least one user');
  }

  const title = `Playwright-created bug ${Date.now()}`;

  await loginPage.goto();
  await loginPage.login(user.username, user.password);
  await boardPage.clickNewBugButton();

  await expect(createBugModal.dialog).toBeVisible();
  await createBugModal.fillBugForm({
    title,
    severity: 'high',
    owner: user.username,
    description: 'Created by the login and create-bug Playwright test.',
  });
  await createBugModal.submit();

  const createdBug = await boardPage.getBugRowByTitle(title);
  await expect(createdBug).toBeVisible();
  await expect(createdBug).toContainText('HIGH');
  await expect(createdBug).toContainText(user.username);
});
