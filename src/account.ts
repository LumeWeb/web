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
  postApiAccountPasswordResetRequest,
  postApiAuthPing,
  RegisterRequest,
  UploadLimitResponse,
  VerifyEmailRequest,
} from "./account/generated/index.js";

import {
  postApiAuthLogin,
  postApiAuthRegister,
  postApiAccountVerifyEmail,
  getApiAuthOtpGenerate,
  postApiAccountOtpVerify,
  postApiAccountOtpValidate,
  postApiAuthOtpDisable,
  PasswordResetRequest,
  postApiAccountPasswordResetConfirm,
  postApiAuthLogout,
  getApiUploadLimit,
  postApiAccountUpdateEmail,
  postApiAccountUpdatePassword,
} from "./account/generated/index.js";
import { AxiosError, AxiosResponse } from "axios";

export class AccountError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AccountError";
    this.statusCode = statusCode;
  }
}

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

  public async login(
    loginRequest: LoginRequest,
  ): Promise<boolean | AccountError> {
    let ret: AxiosResponse<LoginResponse> | LoginResponse | boolean = false;
    try {
      ret = await postApiAuthLogin(loginRequest, { baseURL: this.apiUrl });
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }
    ret = this.checkSuccessVal<LoginResponse>(ret);

    if (ret) {
      this._jwtToken = (ret as LoginResponse).token;
      return true;
    }

    return false;
  }

  public async register(
    registerRequest: RegisterRequest,
  ): Promise<boolean | Error> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthRegister(registerRequest, {
        baseURL: this.apiUrl,
      });
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }

    return this.checkSuccessBool(ret);
  }

  public async verifyEmail(
    verifyEmailRequest: VerifyEmailRequest,
  ): Promise<boolean | Error> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAccountVerifyEmail(
        verifyEmailRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }
    return this.checkSuccessBool(ret);
  }

  public async generateOtp(): Promise<
    boolean | OTPGenerateResponse | AccountError
  > {
    let ret: AxiosResponse<OTPGenerateResponse>;
    try {
      ret = await getApiAuthOtpGenerate(this.buildOptions());
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }
    return this.checkSuccessVal<OTPGenerateResponse>(ret);
  }

  public async verifyOtp(
    otpVerifyRequest: OTPVerifyRequest,
  ): Promise<boolean | Error> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAccountOtpVerify(
        otpVerifyRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }
    return this.checkSuccessBool(ret);
  }

  public async validateOtp(
    otpValidateRequest: OTPValidateRequest,
  ): Promise<boolean | AccountError> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAccountOtpValidate(
        otpValidateRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }
    return this.checkSuccessBool(ret);
  }

  public async disableOtp(
    otpDisableRequest: OTPDisableRequest,
  ): Promise<boolean | AccountError> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAuthOtpDisable(otpDisableRequest, this.buildOptions());
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }
    return this.checkSuccessBool(ret);
  }

  public async requestPasswordReset(
    passwordResetRequest: PasswordResetRequest,
  ): Promise<boolean | AccountError> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAccountPasswordResetRequest(
        passwordResetRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }
    return this.checkSuccessBool(ret);
  }

  public async confirmPasswordReset(
    passwordResetVerifyRequest: PasswordResetVerifyRequest,
  ): Promise<boolean | AccountError> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAccountPasswordResetConfirm(
        passwordResetVerifyRequest,
        this.buildOptions(),
      );
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
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

    const success = this.checkSuccessVal(ret) && ret.data.ping == "pong";

    if (success) {
      this._jwtToken = ret.data.token;
    }

    return success;
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

  public async updateEmail(
    email: string,
    password: string,
  ): Promise<boolean | AccountError> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAccountUpdateEmail(
        { email, password },
        this.buildOptions(),
      );
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }

    return this.checkSuccessBool(ret);
  }

  public async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean | AccountError> {
    let ret: AxiosResponse<void>;
    try {
      ret = await postApiAccountUpdatePassword(
        { current_password: currentPassword, new_password: newPassword },
        this.buildOptions(),
      );
    } catch (e) {
      return new AccountError(
        (e as AxiosError).response?.data as string,
        (e as AxiosError).response?.status as number,
      );
    }

    return this.checkSuccessBool(ret);
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
