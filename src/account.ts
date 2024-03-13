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
    let ret: AxiosResponse<LoginResponse> | LoginResponse | boolean = false;
    try {
      ret = await postApiAuthLogin(loginRequest, { baseURL: this.apiUrl });
    } catch (e) {
      return false;
    }
    ret = this.checkSuccessVal<LoginResponse>(ret);

    if (ret) {
      this.jwtToken = (ret as LoginResponse).token;
    }

    return ret as boolean;
  }

  public async logout(): Promise<boolean> {
    this.jwtToken = undefined;
    return true;
  }

  public async register(registerRequest: RegisterRequest): Promise<boolean> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthRegister(registerRequest, {
        baseURL: this.apiUrl,
      });
    } catch (e) {
      return false;
    }

    return this.checkSuccessBool(ret);
  }

  public async verifyEmail(
    verifyEmailRequest: VerifyEmailRequest,
  ): Promise<boolean> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthVerifyEmail(
        verifyEmailRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return false;
    }
    return this.checkSuccessBool(ret);
  }

  public async generateOtp(): Promise<boolean | OTPGenerateResponse> {
    let ret: AxiosResponse<OTPGenerateResponse>;
    try {
      ret = await getApiAuthOtpGenerate(this.buildOptions());
    } catch (e) {
      return false;
    }
    return this.checkSuccessVal<OTPGenerateResponse>(ret);
  }

  public async verifyOtp(otpVerifyRequest: OTPVerifyRequest): Promise<boolean> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthOtpVerify(otpVerifyRequest, this.buildOptions());
    } catch (e) {
      return false;
    }
    return this.checkSuccessBool(ret);
  }

  public async validateOtp(
    otpValidateRequest: OTPValidateRequest,
  ): Promise<boolean> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthOtpValidate(
        otpValidateRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return false;
    }
    return this.checkSuccessBool(ret);
  }

  public async disableOtp(
    otpDisableRequest: OTPDisableRequest,
  ): Promise<boolean> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthOtpDisable(otpDisableRequest, this.buildOptions());
    } catch (e) {
      return false;
    }
    return this.checkSuccessBool(ret);
  }

  public async requestPasswordReset(
    passwordResetRequest: PasswordResetRequest,
  ): Promise<boolean> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthPasswordResetRequest(
        passwordResetRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return false;
    }
    return this.checkSuccessBool(ret);
  }

  public async confirmPasswordReset(
    passwordResetVerifyRequest: PasswordResetVerifyRequest,
  ): Promise<boolean> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthPasswordResetConfirm(
        passwordResetVerifyRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return false;
    }
    return this.checkSuccessBool(ret);
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
