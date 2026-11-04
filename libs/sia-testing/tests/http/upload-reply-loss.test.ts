/** Upload token checks run through the real loopback listener. */
import { startMockServer } from "../../src/testing/http.js";
import { uploadWireScenarios } from "../harness/upload-wire-scenarios.js";
uploadWireScenarios(startMockServer);
