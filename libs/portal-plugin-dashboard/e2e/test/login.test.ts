import { LoginPage } from "@e2e/pages/LoginPage";
import { RegisterPage } from "@e2e/pages/RegisterPage";
import { generateDummyUser } from "@e2e/utils/dummyUser";
import { expect, test } from "@playwright/test";

test.describe("Login Page Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.isLoaded();
  });

  test("should display login page elements", async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    const user = generateDummyUser();

    // First register the user
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.isLoaded();
    await registerPage.registerUser(
      user.firstName,
      user.lastName,
      user.email,
      user.password,
    );
    await expect(
      await registerPage.waitForSuccessMessageVisible(),
    ).toBeTruthy();

    // Then login with same credentials
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    await expect(await loginPage.waitForSuccessMessageVisible()).toBeTruthy();
  });

  test("should fail login with invalid credentials", async ({ page }) => {
    const user = generateDummyUser();

    // First register the user
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.isLoaded();
    await registerPage.registerUser(
      user.firstName,
      user.lastName,
      user.email,
      user.password,
    );
    await expect(
      await registerPage.waitForSuccessMessageVisible(),
    ).toBeTruthy();

    // Then try to login with wrong password
    await loginPage.goto();
    await loginPage.login(user.email, "wrongpassword");

    await expect(await loginPage.isSuccessMessageVisible()).toBeFalsy();
  });

  test("should require email and password", async ({ page }) => {
    // Try to submit without filling any fields
    await loginPage.clickLogin();

    await expect(page).toHaveURL(/.*login/);
    expect(await loginPage.isSuccessMessageVisible()).toBeFalsy();
  });

  test.skip("should persist session when remember me is checked", async ({
    context,
  }) => {
    const user = generateDummyUser();

    // First register the user
    const registerPage = new RegisterPage(context.pages()[0]);
    await registerPage.goto();
    await registerPage.isLoaded();
    await registerPage.registerUser(
      user.firstName,
      user.lastName,
      user.email,
      user.password,
    );
    await expect(
      await registerPage.waitForSuccessMessageVisible(),
    ).toBeTruthy();

    // Then login with remember me checked
    await loginPage.goto();
    await loginPage.isLoaded();
    await loginPage.login(user.email, user.password, true);

    // Close and reopen browser to test session persistence
    await context.close();
    const newPage = await context.newPage();
    loginPage = new LoginPage(newPage);
    await loginPage.goto();

    // Check if we're still logged in (redirected away from login)
    await expect(newPage).not.toHaveURL(/.*login/);
  });
});
