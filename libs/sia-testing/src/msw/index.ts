import { http, type HttpHandler } from "msw";
import {
  createIndexdDispatcher,
  type DispatcherOptions,
} from "../dispatcher.js";
import {
  createIndexdModel,
  type IndexdModel,
  type IndexdModelOptions,
} from "../model/index.js";

export interface IndexdHandlersOptions extends DispatcherOptions {
  model?: IndexdModel;
  modelOptions?: IndexdModelOptions;
}

export function createIndexdHandlers(options: IndexdHandlersOptions = {}): {
  dispatch: ReturnType<typeof createIndexdDispatcher>;
  handlers: HttpHandler[];
  model: IndexdModel;
} {
  const model = options.model ?? createIndexdModel(options.modelOptions);
  const dispatch = createIndexdDispatcher(model, options);
  const pattern = options.baseUrl
    ? `${new URL(options.baseUrl).origin}/*`
    : "*";
  const handler = http.all(pattern, ({ request }) => dispatch(request));
  return { dispatch, handlers: [handler], model };
}

export { createIndexdDispatcher } from "../dispatcher.js";
export type { IndexdModel } from "../model/index.js";
