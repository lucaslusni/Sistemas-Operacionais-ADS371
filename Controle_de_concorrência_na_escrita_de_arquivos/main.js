const { Worker } = require("worker_threads");
const fs = require("fs");
const path = require("path");

const NUM_THREADS = 20;
const LINES_PER_THREAD = 500;

const unsafeFile = path.join(__dirname, "saida_sem_trava.txt");
const safeFile = path.join(__dirname, "saida_com_trava.txt");

function runWorkers(mode, outputFile, useLock = false) {
    return new Promise((resolve, reject) => {
        let finished = 0;
        const workers = [];

        const sharedBuffer = useLock ? new SharedArrayBuffer(4) : null;
        const lock = useLock ? new Int32Array(sharedBuffer) : null;

        if (lock) {
            lock[0] = 0;
        }

        for (let i = 0; i < NUM_THREADS; i++) {
            const worker = new Worker(path.join(__dirname, "worker.js"), {
                workerData: {
                    threadId: i + 1,
                    lines: LINES_PER_THREAD,
                    outputFile,
                    mode,
                    sharedBuffer,
                },
            });

            worker.on("message", () => {
                finished++;
                if (finished === NUM_THREADS) {
                    resolve();
                }
            });

            worker.on("error", (err) => reject(err));
            worker.on("exit", (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker finalizado com código ${code}`));
                }
            });

            workers.push(worker);
        }
    });
}

async function main() {
    try {
        if (fs.existsSync(unsafeFile)) fs.unlinkSync(unsafeFile);
        if (fs.existsSync(safeFile)) fs.unlinkSync(safeFile);

        console.log("Executando exemplo SEM trava...");
        await runWorkers("unsafe", unsafeFile, false);
        console.log(`Arquivo gerado: ${unsafeFile}`);

        console.log("Executando exemplo COM trava...");
        await runWorkers("safe", safeFile, true);
        console.log(`Arquivo gerado: ${safeFile}`);

        console.log("\nConcluído.");
        console.log("Verifique os arquivos:");
        console.log("- saida_sem_trava.txt");
        console.log("- saida_com_trava.txt");
    } catch (error) {
        console.error("Erro:", error);
    }
}

main();