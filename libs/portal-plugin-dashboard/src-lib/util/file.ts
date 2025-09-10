import type { UppyFile } from "@uppy/core";

import { BundleMetadata } from "@lib/types";

export function isDirectoryFile(file: UppyFile): boolean {
  return file.data.webkitRelativePath || isFolderBundle(file);
}

export function isFolderBundle(file: UppyFile): boolean {
  const meta = file.meta as BundleMetadata;
  return !!(meta?.isVirtualBundle && meta?.displayAsFolder);
}
