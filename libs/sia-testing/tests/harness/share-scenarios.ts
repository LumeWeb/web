/** Shared scenarios exercise the same grant authority through each application adapter. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import type {
  ActorRef,
  ApplicationPort,
  MockRun,
  MockShareGrant,
  MockSia,
} from "../../src/mock.js";
export const shareApp = {
  description: "Shares",
  id: "a".repeat(64),
  name: "Shares",
  serviceUrl: "https://example.invalid",
};
export function shareScenarios(
  connect: (
    mock: MockSia,
    run: MockRun,
    actor: ActorRef,
    grants: readonly MockShareGrant[],
  ) => Promise<{
    close(): Promise<void>;
    sibling: ApplicationPort;
    writer: ApplicationPort;
  }>,
) {
  it("share edits require installed permissions and preserve sibling recipient access", async () => {
    const mock = createMockSia();
    try {
      await mock.run({ app: shareApp }, async (run) => {
        const actor = mock.actor("editor");
        const share = await run.shares.create({ objects: [] });
        const siblingShare = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "all",
          operations: ["add", "remove", "end"],
        });
        const limited = await run.shares.grant(share, {
          as: actor,
          label: "limited",
          operations: ["remove"],
        });
        const siblingGrant = await run.shares.grant(siblingShare, {
          as: actor,
          label: "sibling",
          operations: ["add"],
        });
        const connection = await connect(mock, run, actor, [
          grant,
          limited,
          siblingGrant,
        ]);
        try {
          const { sibling, writer } = connection;
          const [first, concurrent] = await Promise.all([
            writer.shares.targets(),
            writer.shares.targets(),
          ]);
          expect(first.map((t) => t.label)).toEqual([
            "all",
            "limited",
            "sibling",
          ]);
          expect(first[0]!.ref).toBe(concurrent[0]!.ref);
          const [all, narrow, other] = first;
          const siblingTargets = await sibling.shares.targets();
          expect(siblingTargets[0]!.ref).not.toBe(all!.ref);
          await expect(
            sibling.shares.inspect(all!.ref, null),
          ).rejects.toMatchObject({ code: "foreign-handle" });
          await expect(
            writer.shares.inspect({ ...all!.ref }, null),
          ).rejects.toMatchObject({ code: "foreign-handle" });
          const owner = mock.ownerShares({
            access: run.ownerAccess,
            as: actor,
          });
          const ownerRef = (await owner.list({ limit: 10, offset: 0 }))
            .items[0]!.ref;
          for (const forged of [share, grant, ownerRef, share.id]) {
            await expect(
              writer.shares.end(forged as never),
            ).rejects.toMatchObject({ code: "foreign-handle" });
          }
          await owner.close();
          const file = await bytesFixture({
            bytes: Uint8Array.of(4, 5),
            name: "note",
          });
          const object = await writer.upload({
            file,
            metadata: Uint8Array.of(7),
          });
          await expect(
            writer.shares.add(all!.ref, object),
          ).rejects.toMatchObject({ code: "denied" });
          await writer.pin(object);
          await expect(
            writer.shares.add(all!.ref, { id: object.id } as never),
          ).rejects.toMatchObject({ code: "foreign-handle" });
          await expect(
            writer.shares.add(narrow!.ref, object),
          ).rejects.toMatchObject({ code: "denied" });
          const hold = mock.mutationFaults.hold({
            operation: "share-add",
            share: grant,
            stage: "beforeCommit",
          });
          const adding = writer.shares.add(all!.ref, object);
          await hold.started();
          await writer.shares.add(other!.ref, object);
          expect(await writer.shares.inspect(all!.ref, object.id)).toEqual({
            contains: false,
            state: "active",
          });
          hold.release();
          await adding;
          expect(await writer.shares.inspect(all!.ref, object.id)).toEqual({
            contains: true,
            state: "active",
          });
          await writer.shares.remove(narrow!.ref, "f".repeat(64));
          await writer.shares.remove(narrow!.ref, object.id);
          expect(await writer.shares.inspect(all!.ref, object.id)).toEqual({
            contains: false,
            state: "active",
          });
          await writer.shares.add(all!.ref, object);
          const reader = mock.reader({
            access: share.access,
            as: mock.actor("recipient"),
          });
          const otherReader = mock.reader({
            access: siblingShare.access,
            as: mock.actor("other recipient"),
          });
          const stream = await reader.download(object);
          await writer.shares.end(all!.ref);
          expect(await new Response(stream).arrayBuffer()).toEqual(
            Uint8Array.of(4, 5).buffer,
          );
          await expect(reader.object(object.id)).rejects.toMatchObject({
            code: "denied",
          });
          expect(await otherReader.object(object.id)).toMatchObject({
            sizeBytes: 2,
          });
          expect(await writer.inspect(object)).toBe("pinned");
          expect(await writer.shares.inspect(all!.ref, object.id)).toEqual({
            contains: null,
            state: "ended",
          });
          await writer.shares.end(all!.ref);
          await expect(
            writer.shares.add(all!.ref, object),
          ).rejects.toMatchObject({ code: "denied" });
          await run.shares.revokeGrant(grant);
          expect((await writer.shares.targets()).map((t) => t.label)).toEqual([
            "limited",
            "sibling",
          ]);
          expect((await sibling.shares.targets()).map((t) => t.label)).toEqual([
            "limited",
            "sibling",
          ]);
          await expect(
            writer.shares.inspect(all!.ref, null),
          ).rejects.toMatchObject({ code: "denied" });
          expect(await writer.shares.inspect(narrow!.ref, null)).toEqual({
            contains: null,
            state: "ended",
          });
          expect(
            await writer.events({ cursor: null, limit: 10 }),
          ).toMatchObject({ events: [] });
          await Promise.all([reader.close(), otherReader.close()]);
        } finally {
          await Promise.all([
            connection.writer.close(),
            connection.sibling.close(),
          ]);
          await connection.close();
        }
      });
    } finally {
      await mock.close();
    }
  });
}
