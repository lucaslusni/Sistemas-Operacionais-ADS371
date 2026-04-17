const { workerData, parentPort } = require("worker_threads");
const fs = require("fs");

const { threadId, lines, outputFile, mode, sharedBuffer } = workerData;

const lock = sharedBuffer ? new Int32Array(sharedBuffer) : null;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mutex simples com Atomics
function acquireLock() {
    while (true) {
        const previous = Atomics.compareExchange(lock, 0, 0, 1);
        if (previous === 0) return;
        Atomics.wait(lock, 0, 1, 1);
    }
}

function releaseLock() {
    Atomics.store(lock, 0, 0);
    Atomics.notify(lock, 0, 1);
}

async function writeUnsafe() {
    for (let i = 1; i <= lines; i++) {
        const line = `[Thread ${threadId}] linha ${i}\n`;

        // Divide a escrita em 2 pedaços para aumentar a chance de bagunça
        const half = Math.floor(line.length / 2);
        const part1 = line.slice(0, half);
        const part2 = line.slice(half);

        fs.appendFileSync(outputFile, part1);
        await sleep(Math.floor(Math.random() * 3)); // atraso pequeno aleatório
        fs.appendFileSync(outputFile, part2);
    }
}

async function writeSafe() {
    for (let i = 1; i <= lines; i++) {
        const line = `[Thread ${threadId}] linha ${i}\n`;

        acquireLock();
        try {
            fs.appendFileSync(outputFile, line);
        } finally {
            releaseLock();
        }
    }
}

async function run() {
    if (mode === "unsafe") {
        await writeUnsafe();
    } else {
        await writeSafe();
    }

    parentPort.postMessage(`Thread ${threadId} finalizada`);
}

run();