import Axios, { AxiosError, AxiosRequestConfig } from "axios";
import { S5Error } from "./client.js";

export interface CancelablePromise<T> extends Promise<T> {
  cancel: () => void;
}

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): CancelablePromise<T> => {
  const abort = new AbortController();

  /*
      Hack to ensure that the data is passed to the request as an option.
       */
  if (options?.data) {
    config = config || {};
    config.data = options.data;
    delete config.data;
  }

  const instance = Axios.create({ baseURL: options?.baseURL });
  const promise = instance({
      signal: abort.signal,
    ...config,
    ...options,
  })
    .then(({ data }) => data)
    .catch((error) => {
      if (Axios.isCancel(error)) {
        return;
      }
      throw new S5Error(
        (error as AxiosError).message,
        (error as AxiosError).response?.status as number,
      );
    });

  // @ts-ignore
  promise.cancel = () => {
      abort.abort("Query was cancelled");
  };

  return promise as CancelablePromise<T>;
};
