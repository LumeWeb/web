import {PROTOCOL_S5, Sdk} from "@lumeweb/portal-sdk";
import {useSdk} from "~/components/lib/sdk-context.js";
import {S5Client} from "@lumeweb/s5-js";

export interface PinningStatus {
    id: string;
    progress: number;
    status: 'processing' | 'completed';
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PinningProcess {
    private static instances: Map<string, PinningStatus> = new Map();

    private static sdk?: Sdk;

    static async pin(id: string): Promise<{ success: boolean; message: string }> {
        const s5 = PinningProcess.sdk?.protocols().get<S5Client>(PROTOCOL_S5)!.getSdk()!;
        if (PinningProcess.instances.has(id)) {
            return {success: false, message: "ID is already being processed"};
        }

        const pinningStatus: PinningStatus = {id, progress: 0, status: 'processing'};
        PinningProcess.instances.set(id, pinningStatus);

        await s5.pin(id);

        (async () => {
            const ret = await s5.pinStatus(id);
            pinningStatus.progress = ret.progress;
            if (ret.status === 'completed') {
                pinningStatus.status = 'completed';
            }
        })();

        return {success: true, message: "Pinning process started"};
    }

    static async unpin(id: string): Promise<{ success: boolean; message: string }> {
        if (!PinningProcess.instances.has(id)) {
            return {success: false, message: "ID not found or not being processed"};
        }

        await PinningProcess.sdk?.protocols().get<S5Client>(PROTOCOL_S5)!.getSdk().unpin(id);

        return {success: true, message: "Pinning process removed"}
    }

    static* pollAllProgress(): Generator<PinningStatus[], void, unknown> {
        let allStatuses = Array.from(PinningProcess.instances.values());
        let inProgress = allStatuses.some(status => status.status !== 'completed');

        while (inProgress) {
            yield allStatuses;
            allStatuses = Array.from(PinningProcess.instances.values());
            inProgress = allStatuses.some(status => status.status !== 'completed');
        }

        yield allStatuses ?? []; // Yield the final statuses
    }

    public static setupSdk(sdk: Sdk) {
        PinningProcess.sdk = sdk;
    }
}
