import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import memize from "memize";

const axiosCreate = memize(Axios.create);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  const source = Axios.CancelToken.source();

  const instance = axiosCreate({ baseURL: options?.baseURL });
  const promise = instance({
    ...config,
    ...options,
    cancelToken: source.token,
  });

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
