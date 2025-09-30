import {
  createNamespacedId,
  Framework,
  FrameworkFeature,
  getPluginMeta,
  getApiBaseUrl,
  env,
  RefineConfigCapability,
} from "@lumeweb/portal-framework-core";
import HeliaService from "../../helia";

export interface HeliaServiceConfig {
  authToken?: string;
}

export class FileManagerFeature implements FrameworkFeature {
  readonly id = createNamespacedId("ipfs", "file-manager");
  status = "enabled" as const;
  version = "0.1.0";

  #heliaService: HeliaService | null = null;
  #config: HeliaServiceConfig = {};
  #apiUrl: string;

  async initialize(framework: Framework): Promise<void> {
    // Get the IPFS RefineConfigCapability to access its API URL
    const refineConfigCapability = await framework.getCapability<RefineConfigCapability>("ipfs:refine-config");
    
    if (!refineConfigCapability) {
      throw new Error("Failed to get IPFS RefineConfig capability");
    }

    // Use the capability's API URL getter
    this.#apiUrl = refineConfigCapability.getApiUrl();

    // Get the current auth token
    const authToken = refineConfigCapability.getAuthToken();

    // Listen for auth token changes
    const emitter = refineConfigCapability.getEmitter();
    emitter.on("authTokenChanged", (token: string) => {
      if (this.#heliaService) {
        // Update helia service config with new token
        this.#heliaService.updateConfig({ authToken: token });
      }
    });

    // Initialize the singleton helia service with the API URL and auth token
    const heliaConfig: HeliaServiceConfig = {
      ...this.#config,
      apiUrl: this.#apiUrl,
      authToken: authToken || undefined,
    };
    this.#heliaService = new HeliaService(heliaConfig);

    // Pre-initialize the helia instance
    await this.#heliaService.getHelia();
  }

  async destroy(framework: Framework): Promise<void> {
    if (this.#heliaService) {
      await this.#heliaService.destroy();
      this.#heliaService = null;
    }
  }

  getHeliaService(): HeliaService {
    if (!this.#heliaService) {
      throw new Error("Helia service not initialized");
    }
    return this.#heliaService;
  }

  getApiUrl(): string {
    return this.#apiUrl;
  }

  updateConfig(config: Partial<HeliaServiceConfig>): void {
    this.#config = { ...this.#config, ...config };
    // If service exists, update its config by recreating it with API URL
    if (this.#heliaService) {
      this.#heliaService.destroy();
      const heliaConfig: HeliaServiceConfig = {
        ...this.#config,
        apiUrl: this.#apiUrl,
      };
      this.#heliaService = new HeliaService(heliaConfig);
    }
  }
}
