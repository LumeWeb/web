import { type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly emailInput: Locator;
  readonly loginButton: Locator;
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole("textbox", { name: "Email*" });
    this.passwordInput = page.getByRole("textbox", { name: "Password*" });
    this.rememberMeCheckbox = page.getByRole("checkbox", {
      name: "Remember Me",
    });
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.successMessage = page
      .getByText(/you have successfully logged in/i)
      .first();
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async clickRememberMe() {
    await this.rememberMeCheckbox.check();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async goto() {
    await this.page.goto("/login");
  }

  async isLoaded() {
    await Promise.all([
      this.emailInput.waitFor({ state: "visible" }),
      this.passwordInput.waitFor({ state: "visible" }),
      this.rememberMeCheckbox.waitFor({ state: "visible" }),
      this.loginButton.waitFor({ state: "visible" }),
    ]);
  }

  async isSuccessMessageVisible() {
    return await this.successMessage.isVisible();
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.clickRememberMe();
    }
    await this.clickLogin();
  }

  async waitForSuccessMessageVisible() {
    await this.successMessage.waitFor({ state: "visible" });
    return this.isSuccessMessageVisible();
  }
}
