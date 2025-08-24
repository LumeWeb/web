import { type Locator, type Page } from "@playwright/test";

export class RegisterPage {
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly successMessage: Locator;
  readonly termsCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByRole("textbox", { name: "First Name" });
    this.lastNameInput = page.getByRole("textbox", { name: "Last Name" });
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", {
      exact: true,
      name: "Password",
    });
    this.confirmPasswordInput = page.getByRole("textbox", {
      name: "Confirm Password",
    });
    this.termsCheckbox = page.getByRole("checkbox", {
      name: /I agree to the\s*Terms of/i,
    });
    this.createAccountButton = page.getByRole("button", {
      name: "Create Account",
    });
    this.successMessage = page
      .getByText(/You have successfully registered/i)
      .first();
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async fillConfirmPassword(confirmPassword: string) {
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async goto() {
    await this.page.goto("/register");
  }

  async isLoaded() {
    await Promise.all([
      this.firstNameInput.waitFor({ state: "visible" }),
      this.lastNameInput.waitFor({ state: "visible" }),
      this.emailInput.waitFor({ state: "visible" }),
      this.passwordInput.waitFor({ state: "visible" }),
      this.confirmPasswordInput.waitFor({ state: "visible" }),
      this.termsCheckbox.waitFor({ state: "visible" }),
      this.createAccountButton.waitFor({ state: "visible" }),
    ]);
  }

  async isSuccessMessageVisible() {
    return await this.successMessage.isVisible();
  }

  async registerUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    acceptTerms = true,
  ) {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
    if (acceptTerms) {
      await this.acceptTerms();
    }
    await this.submit();
  }

  async submit() {
    await this.createAccountButton.click();
  }

  async takeScreenshot(path: string) {
    await this.page.screenshot({ path });
  }

  async waitForSuccessMessageVisible() {
    await this.successMessage.waitFor({ state: "visible" });
    return this.isSuccessMessageVisible();
  }
}
