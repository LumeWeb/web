import { NamespacedId } from "./types/plugin";

class BaseError extends Error {
  cause?: Error;
  originalId?: string;
  constructor(message: string, options?: { cause?: Error; originalId?: string }) {
    super(message);
    this.name = this.constructor.name;
    if (options?.cause) {
      this.cause = options.cause;
    }
    if (options?.originalId) {
      this.originalId = options.originalId;
    }
  }
}

export class CapabilityLoadError extends BaseError {
  constructor(id: NamespacedId, cause?: Error) {
    super(`Failed to load capability: ${id}`, { cause, originalId: id });
    this.name = "CapabilityLoadError";
  }
}

export class FeatureLoadError extends BaseError {
  constructor(id: NamespacedId, cause?: Error) {
    super(`Failed to load feature: ${id}`, { cause, originalId: id });
    this.name = "FeatureLoadError";
  }
}

export class PluginInitError extends BaseError {
  constructor(id: NamespacedId, cause?: Error) {
    super(`Failed to initialize plugin: ${id}`, { cause, originalId: id });
    this.name = "PluginInitError";
  }
}

export class PluginLoadError extends BaseError {
  constructor(id: NamespacedId, cause?: Error) {
    super(`Failed to load plugin: ${id}`, { cause, originalId: id });
    this.name = "PluginLoadError";
  }
}
