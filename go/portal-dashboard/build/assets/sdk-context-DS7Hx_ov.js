import { R as React, j as jsxRuntimeExports } from "./index-DVnsepjX.js";
const SdkContext = React.createContext({});
const SdkContextProvider = ({ sdk, children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SdkContext.Provider, { value: sdk, children });
};
function useSdk() {
  return React.useContext(SdkContext);
}
export {
  SdkContextProvider as S,
  useSdk as u
};
