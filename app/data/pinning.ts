interface PinningStatus {
    id: string;
    progress: number;
    status: 'inprogress' | 'completed' | 'stale';
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
class PinningProcess {
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

    static *pollProgress(id: string): Generator<PinningStatus | null, void, unknown> {
        let status = PinningProcess.instances.get(id);
        while (status && status.status !== 'completed') {
            yield status;
            status = PinningProcess.instances.get(id);
        }
        yield status ?? null; // Yield the final status, could be null if ID doesn't exist
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
