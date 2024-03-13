import {
  LoginRequest,
  LoginResponse,
  OTPDisableRequest,
  OTPGenerateResponse,
  OTPValidateRequest,
  OTPVerifyRequest,
  PasswordResetVerifyRequest,
  postApiAuthPasswordResetRequest,
  postApiAuthPing,
  RegisterRequest,
  VerifyEmailRequest,
} from "./account/generated/index.js";
import {
  postApiAuthLogin,
  postApiAuthRegister,
  postApiAuthVerifyEmail,
  getApiAuthOtpGenerate,
  postApiAuthOtpVerify,
  postApiAuthOtpValidate,
  postApiAuthOtpDisable,
  PasswordResetRequest,
  postApiAuthPasswordResetConfirm,
} from "./account/generated/index.js";
import { AxiosResponse } from "axios";

export default class AccountApi {
  private apiUrl: string;
  private jwtToken?: string;

  constructor(apiUrl: string) {
    let apiUrlParsed = new URL(apiUrl);

    apiUrlParsed.hostname = `account.${apiUrlParsed.hostname}`;
    this.apiUrl = apiUrlParsed.toString();
  }

  public static create(apiUrl: string): AccountApi {
    return new AccountApi(apiUrl);
  }

  public async login(loginRequest: LoginRequest): Promise<boolean> {
    let ret = this.checkSuccessVal<LoginResponse>(
      await postApiAuthLogin(loginRequest, { baseURL: this.apiUrl }),
    );
    if (ret) {
      this.jwtToken = (ret as LoginResponse).token;
    }

    return false;
  }

  public async register(registerRequest: RegisterRequest): Promise<boolean> {
    return this.checkSuccessBool(
      await postApiAuthRegister(registerRequest, this.buildOptions()),
    );
  }

  public async verifyEmail(
    verifyEmailRequest: VerifyEmailRequest,
  ): Promise<boolean> {
    return this.checkSuccessBool(
      await postApiAuthVerifyEmail(verifyEmailRequest, this.buildOptions()),
    );
  }

  public async generateOtp(): Promise<boolean | OTPGenerateResponse> {
    return this.checkSuccessVal<OTPGenerateResponse>(
      await getApiAuthOtpGenerate(this.buildOptions()),
    );
  }

  public async verifyOtp(otpVerifyRequest: OTPVerifyRequest): Promise<boolean> {
    return this.checkSuccessBool(
      await postApiAuthOtpVerify(otpVerifyRequest, this.buildOptions()),
    );
  }

  public async validateOtp(
    otpValidateRequest: OTPValidateRequest,
  ): Promise<boolean> {
    return this.checkSuccessBool(
      await postApiAuthOtpValidate(otpValidateRequest, this.buildOptions()),
    );
  }

  public async disableOtp(
    otpDisableRequest: OTPDisableRequest,
  ): Promise<boolean> {
    return this.checkSuccessBool(
      await postApiAuthOtpDisable(otpDisableRequest, this.buildOptions()),
    );
  }

  public async requestPasswordReset(
    passwordResetRequest: PasswordResetRequest,
  ): Promise<boolean> {
    return this.checkSuccessBool(
      await postApiAuthPasswordResetRequest(
        passwordResetRequest,
        this.buildOptions(),
      ),
    );
  }

  public async confirmPasswordReset(
    passwordResetVerifyRequest: PasswordResetVerifyRequest,
  ): Promise<boolean> {
    return this.checkSuccessBool(
      await postApiAuthPasswordResetConfirm(
        passwordResetVerifyRequest,
        this.buildOptions(),
      ),
    );
  }

  public async ping(): Promise<boolean> {
    return this.checkSuccessBool(await postApiAuthPing(this.buildOptions()));
  }

  private checkSuccessBool(ret: AxiosResponse<void>): boolean {
    return ret.status === 200;
  }

  private checkSuccessVal<T>(ret: AxiosResponse<T>): T | boolean {
    if (ret.status === 200) {
      return ret.data as T;
    }

    return false;
  }

  private buildOptions(): any {
    const headers: any = {};
    if (this.jwtToken) {
      headers.Authorization = `Bearer ${this.jwtToken}`;
    }

    return {
      baseURL: this.apiUrl,
      headers: headers,
    };
  }
}
