import { RegisterPage } from "@e2e/pages/RegisterPage";
import { generateDummyUser } from "@e2e/utils/dummyUser";
import { expect, test } from "@playwright/test";

test.describe("Register Page Tests", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.isLoaded();
  });

  test("should display register page elements", async () => {
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.termsCheckbox).toBeVisible();
    await expect(registerPage.createAccountButton).toBeVisible();
  });

  test("should register a new user successfully", async ({ page }) => {
    const user = generateDummyUser();

    await registerPage.registerUser(
      user.firstName,
      user.lastName,
      user.email,
      user.password,
    );

    // Wait for success message to appear with a longer timeout
    expect(await registerPage.waitForSuccessMessageVisible()).toBeTruthy();
  });

  test("should require all fields to be filled", async ({ page }) => {
    // Try to submit without filling any fields
    await registerPage.submit();

    // Should not navigate away or show success message
    await expect(page).toHaveURL(/.*register/);
    expect(await registerPage.isSuccessMessageVisible()).toBeFalsy();
  });

  test("should require terms agreement", async () => {
    const user = generateDummyUser();

    // Fill all fields but don't accept terms
    await registerPage.registerUser(
      user.firstName,
      user.lastName,
      user.email,
      user.password,
      false,
    );

    // Should not show success message
    expect(await registerPage.isSuccessMessageVisible()).toBeFalsy();
  });

  test("should require password confirmation to match", async () => {
    const user = generateDummyUser();
    const wrongConfirmPassword = "DifferentPassword123!";

    // Fill all fields with mismatched passwords
    await registerPage.fillFirstName(user.firstName);
    await registerPage.fillLastName(user.lastName);
    await registerPage.fillEmail(user.email);
    await registerPage.fillPassword(user.password);
    await registerPage.fillConfirmPassword(wrongConfirmPassword);
    await registerPage.acceptTerms();
    await registerPage.submit();

    // Should not show success message
    expect(await registerPage.isSuccessMessageVisible()).toBeFalsy();
  });
});
