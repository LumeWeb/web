/** Compares real account charges while SDK objects share or release slab references. */
import { PinnedObject, type Sdk } from '@siafoundation/sia-storage';
import { byteSource, readBytes } from '../../support/byte-streams.js';
import { withPinnedObjects } from './payload-checks.js';

export interface PackedReferencesResult {
  addedData: number; addedSize: number; bytes: number[];
  remainingData: number; remainingSize: number; unusedData: number; unusedSize: number;
}
export interface RepinResult {
  addedData: number; addedSize: number; bytes: number[]; repinData: number; repinSize: number;
}
export function accountingChecks(sdk: Sdk) {
  return {
    packedReferences(parts: readonly (readonly number[])[]): Promise<PackedReferencesResult> {
      return withPinnedObjects(sdk, async ({ own }) => {
        const before = await sdk.account();
        const packed = sdk.uploadPacked({ dataShards: 10, parityShards: 20 });
        let finalized = false;
        try {
          for (const part of parts) await packed.add(byteSource(part));
          // finalize consumes the packed handle even when its promise rejects.
          finalized = true;
          const objects = await packed.finalize();
          for (const object of objects) own(object);
          for (const object of objects) await sdk.pinObject(object);
          const [first, second] = objects;
          if (!first || !second || objects.length !== 2)
            throw new Error('Packed upload did not return two objects');
          const charged = await sdk.account();
          await sdk.deleteObject(first.id());
          await sdk.pruneSlabs(new Date(Date.now() + 60_000));
          const remaining = await sdk.account();
          const retrieved = own(await sdk.object(second.id()));
          const bytes = await readBytes(sdk, retrieved);
          await sdk.deleteObject(second.id());
          await sdk.pruneSlabs(new Date(Date.now() + 60_000));
          const unused = await sdk.account();
          return {
            addedData: charged.pinnedData - before.pinnedData,
            addedSize: charged.pinnedSize - before.pinnedSize,
            bytes,
            remainingData: remaining.pinnedData - before.pinnedData,
            remainingSize: remaining.pinnedSize - before.pinnedSize,
            unusedData: unused.pinnedData - before.pinnedData,
            unusedSize: unused.pinnedSize - before.pinnedSize,
          };
        } catch (error) {
          if (!finalized) {
            try { packed.free(); }
            catch { /* Keep the add error when releasing its failed upload also fails. */ }
          }
          throw error;
        }
      });
    },
    repin(bytes: readonly number[]): Promise<RepinResult> {
      return withPinnedObjects(sdk, async ({ own, upload }) => {
        const before = await sdk.account();
        const uploaded = await upload(own(new PinnedObject()), bytes, { dataShards: 10, parityShards: 20 });
        await sdk.pinObject(uploaded);
        const first = await sdk.account();
        await sdk.pinObject(uploaded);
        const repeated = await sdk.account();
        const retrieved = own(await sdk.object(uploaded.id()));
        return {
          addedData: first.pinnedData - before.pinnedData,
          addedSize: first.pinnedSize - before.pinnedSize,
          bytes: await readBytes(sdk, retrieved),
          repinData: repeated.pinnedData - first.pinnedData,
          repinSize: repeated.pinnedSize - first.pinnedSize,
        };
      });
    },
  };
}
