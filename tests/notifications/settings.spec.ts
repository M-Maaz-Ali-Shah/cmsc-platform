import { test, expect } from "@playwright/test";
import { queryD1 } from "../helpers/d1";

test("disabling a notification type logs 'skipped' instead of attempting to send", async ({ page, context }) => {
  await page.goto("/admin/dashboard/notifications");
  const contactToggle = page.locator("label", { hasText: "New contact message received" }).getByRole("checkbox");
  await contactToggle.uncheck();
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.getByText("Notification settings saved.")).toBeVisible();

  // Trigger it from a second, unauthenticated context (the public contact form).
  const publicPage = await context.browser()!.newContext().then((c) => c.newPage());
  const email = `pw-notif-skip-${Date.now()}@example.test`;
  const subject = `Notification skip test ${Date.now()}`; // unique per run — avoids matching a row from an earlier run
  await publicPage.goto("/contact");
  await publicPage.getByLabel("Full Name").fill("Notification Test");
  await publicPage.getByRole("textbox", { name: "Email" }).fill(email);
  await publicPage.getByLabel("Subject").fill(subject);
  await publicPage.getByLabel("Message").fill("Testing that this notification is skipped, not sent.");
  await publicPage.getByRole("button", { name: "Send Message" }).click();
  await expect(publicPage.getByText("Message sent")).toBeVisible();
  await publicPage.close();

  const rows = await queryD1(
    `SELECT status FROM notification_log WHERE type = 'contact_new' AND related_entity = '${subject}'`
  );
  expect(rows).toHaveLength(1);
  expect(rows[0].status).toBe("skipped");

  // Re-enable it so the toggle doesn't stay off for any other test/manual use.
  await page.goto("/admin/dashboard/notifications");
  await page.locator("label", { hasText: "New contact message received" }).getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.getByText("Notification settings saved.")).toBeVisible();
});

test("an enabled notification is attempted and logged (sent or failed, never silently dropped)", async ({
  page,
}) => {
  // This test needs an actual recipient configured (Settings → Support
  // email) so sendNotification() takes the send-attempt path rather than
  // its own "no recipient configured" skip path (see the corresponding
  // comment in src/app/actions/notifications.ts) — on a genuinely fresh
  // D1 (e.g. a first CI run, or a fresh production deploy before any
  // admin has visited Settings) that field starts blank. Set it only if
  // it's currently blank, and restore it to blank afterward — never
  // overwrite an already-configured real value.
  await page.goto("/admin/dashboard/settings");
  const supportEmailInput = page.getByLabel("Support email");
  const wasBlank = (await supportEmailInput.inputValue()) === "";
  if (wasBlank) {
    await supportEmailInput.fill("pw-notification-tests@example.test");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();
  }

  const email = `pw-notif-attempt-${Date.now()}@example.test`;
  const subject = `Notification attempt test ${Date.now()}`;
  await page.goto("/contact");
  await page.getByLabel("Full Name").fill("Notification Attempt Test");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Subject").fill(subject);
  await page.getByLabel("Message").fill("Testing that this notification is actually attempted.");
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByText("Message sent")).toBeVisible();

  const rows = await queryD1(
    `SELECT status FROM notification_log WHERE type = 'contact_new' AND related_entity = '${subject}'`
  );
  expect(rows).toHaveLength(1);
  // "sent" if RESEND_API_KEY is configured in this environment, "failed"
  // (with a reason, never silently nothing) if not — either is a real
  // attempt, unlike the "skipped" case above.
  expect(["sent", "failed"]).toContain(rows[0].status);

  // Restore the support email to blank if this test was the one that set
  // it, so it doesn't leave a fake address behind for real admin use.
  if (wasBlank) {
    await page.goto("/admin/dashboard/settings");
    await page.getByLabel("Support email").fill("");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();
  }
});
