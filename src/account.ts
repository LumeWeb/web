import {
  AccountInfoResponse,
  getApiAccount,
  LoginRequest,
  LoginResponse,
  OTPDisableRequest,
  OTPGenerateResponse,
  OTPValidateRequest,
  OTPVerifyRequest,
  PasswordResetVerifyRequest,
  PingResponse,
  postApiAuthPasswordResetRequest,
  postApiAuthPing,
  RegisterRequest,
  UploadLimitResponse,
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
  postApiAuthLogout,
  getApiUploadLimit,
} from "./account/generated/index.js";
import { AxiosResponse } from "axios";

export class AccountApi {
  private apiUrl: string;
  private _jwtToken?: string;

  constructor(apiUrl: string) {
    let apiUrlParsed = new URL(apiUrl);

    apiUrlParsed.hostname = `account.${apiUrlParsed.hostname}`;
    this.apiUrl = apiUrlParsed.toString();
  }

  set jwtToken(value: string) {
    this._jwtToken = value;
  }
  get jwtToken(): string {
    return <string>this._jwtToken;
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
      this._jwtToken = (ret as LoginResponse).token;
      return true;
    }

    return false;
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
    let ret: AxiosResponse<PingResponse>;
    try {
      ret = await postApiAuthPing(this.buildOptions());
    } catch (e) {
      return false;
    }

    return this.checkSuccessVal(ret) && ret.data.ping == "pong";
  }

  public async info(): Promise<boolean | AccountInfoResponse> {
    let ret: AxiosResponse<AccountInfoResponse>;
    try {
      ret = await getApiAccount(this.buildOptions());
    } catch (e) {
      return false;
    }

    return this.checkSuccessVal(ret);
  }

  public async logout(): Promise<boolean> {
    try {
      await postApiAuthLogout(this.buildOptions());
    } catch (e) {
      return false;
    }

    this._jwtToken = undefined;

    return true;
  }

  public async uploadLimit(): Promise<number> {
    let ret: AxiosResponse<UploadLimitResponse>;
    try {
      ret = await getApiUploadLimit(this.buildOptions());
    } catch (e) {
      return 0;
    }

    return this.checkSuccessVal<UploadLimitResponse>(ret) ? ret.data.limit : 0;
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
