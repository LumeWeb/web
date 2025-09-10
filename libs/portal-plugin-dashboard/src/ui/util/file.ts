import type { BundleMetadata } from "@lib/types";
import type { UppyFile } from "@uppy/core";

import { isFolderBundle } from "@lib/util/file";

export function getDisplayName(file: UppyFile): string {
  // Always use webkitRelativePath as the source of truth for folder structures
  if ((file.data as any).webkitRelativePath) {
    return (file.data as any).webkitRelativePath;
  }

  if (isFolderBundle(file)) {
    const meta = file.meta as BundleMetadata;
    return meta.bundleName;
  }

  return file.name;
}

export function getDisplaySize(file: UppyFile): number {
  // UppyFile already has the correct size including bundles
  return file.size;
}
