const { parentPort, workerData } = require("worker_threads");

const { transacoes, coinFiltro } = workerData;

function analisarTransacoes(lista, coin) {
    const suspeitas = [];

    for (const t of lista) {
        const coinValida = !coin || coin === "TODAS" || t.coin === coin;
        if (!coinValida) continue;

        if (t.valor > 10000) {
            suspeitas.push({
                ...t,
                motivo: "Valor acima de 10000"
            });
        }
    }

    return suspeitas;
}

const resultado = analisarTransacoes(transacoes, coinFiltro);

parentPort.postMessage(resultado);