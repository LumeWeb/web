export interface PinningStatus {
    id: string;
    progress: number;
    status: 'inprogress' | 'completed' | 'stale';
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class PinningProcess {
    private static instances: Map<string, PinningStatus> = new Map();

    static async pin(id: string): Promise<{ success: boolean; message: string }> {
        if (PinningProcess.instances.has(id)) {
            return { success: false, message: "ID is already being processed" };
        }

        const pinningStatus: PinningStatus = { id, progress: 0, status: 'inprogress' };
        PinningProcess.instances.set(id, pinningStatus);

        // Simulate async progress
        (async () => {
            for (let progress = 1; progress <= 100; progress++) {
                await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (500 - 100 + 1)) + 100)); // Simulate time passing with random duration between 100 and 500
                pinningStatus.progress = progress;
                if (progress === 100) {
                    pinningStatus.status = 'completed';
                }
            }
        })();

        return { success: true, message: "Pinning process started" };
    }

    static async unpin(id: string): Promise<{ success: boolean; message: string }> {
        if (!PinningProcess.instances.has(id)) {
            return { success: false, message: "ID not found or not being processed" };
        }

        PinningProcess.instances.delete(id);
        return { success: true, message: "Pinning process removed" }
    }

    static *pollAllProgress(): Generator<PinningStatus[], void, unknown> {
        let allStatuses = Array.from(PinningProcess.instances.values());
        let inProgress = allStatuses.some(status => status.status !== 'completed');

        while (inProgress) {
            yield allStatuses;
            allStatuses = Array.from(PinningProcess.instances.values());
            inProgress = allStatuses.some(status => status.status !== 'completed');
        }

        yield allStatuses ?? []; // Yield the final statuses
    }
}

// Example usage:
// (async () => {
//     const { success, message } = await PinningProcess.pin("123");
//     console.log(message);
//     if (success) {
//         const progressGenerator = PinningProcess.pollProgress("123");
//         let result = progressGenerator.next();
//         while (!result.done) {
//             console.log(result.value); // Log the progress
//             result = progressGenerator.next();
//         }
//     }
// })();
