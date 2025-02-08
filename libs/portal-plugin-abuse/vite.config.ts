import { Config } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

import * as sharedModules from "../../shared-modules";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default Config({
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    "./AbuseLayout": "./src/ui/routes/layout",
    "./Dashboard": "./src/ui/routes/dashboard",
    "./CaseLayout": "./src/ui/routes/case/layout",
    "./CaseList": "./src/ui/routes/case/list",
    "./CaseView": "./src/ui/routes/case/view",
    "./BlockListLayout": "./src/ui/routes/blocklist/layout",
    "./BlockListList": "./src/ui/routes/blocklist/list",
    "./ReporterLayout": "./src/ui/routes/reporter/layout",
    "./ReporterList": "./src/ui/routes/reporter/list",
    "./ReporterView": "./src/ui/routes/reporter/view",
    "./SubjectLayout": "./src/ui/routes/subject/layout",
    "./SubjectList": "./src/ui/routes/subject/list",
    "./SubjectView": "./src/ui/routes/subject/view",
  },
  name: "core:abuse",
  sharedModules: sharedModules.getSharedModules(),
});
