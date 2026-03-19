const express = require("express");
const path = require("path");
const { Worker } = require("worker_threads");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const transacoes = [
    { nome: "Lucas", contaId: "ACC001", coin: "BTC", valor: 12000 },
    { nome: "Maria", contaId: "ACC002", coin: "ETH", valor: 3500 },
    { nome: "João", contaId: "ACC003", coin: "BTC", valor: 18000 },
    { nome: "Ana", contaId: "ACC004", coin: "DOGE", valor: 500 },
    { nome: "Carlos", contaId: "ACC005", coin: "BTC", valor: 9800 },
    { nome: "Fernanda", contaId: "ACC006", coin: "ETH", valor: 22000 },
    { nome: "Rafael", contaId: "ACC007", coin: "BTC", valor: 10100 },
    { nome: "Juliana", contaId: "ACC008", coin: "SOL", valor: 9000 },
    { nome: "Pedro", contaId: "ACC009", coin: "BTC", valor: 45000 },
    { nome: "Camila", contaId: "ACC010", coin: "ETH", valor: 10500 },
    { nome: "Bruno", contaId: "ACC011", coin: "DOGE", valor: 15000 },
    { nome: "Patricia", contaId: "ACC012", coin: "BTC", valor: 3000 },
    { nome: "Gustavo", contaId: "ACC013", coin: "SOL", valor: 25000 },
    { nome: "Beatriz", contaId: "ACC014", coin: "ETH", valor: 11000 },
    { nome: "Renato", contaId: "ACC015", coin: "BTC", valor: 7600 }
];

// para simular carga maior
function gerarMuitasTransacoes(base, repeticoes = 5000) {
    const resultado = [];
    for (let i = 0; i < repeticoes; i++) {
        for (const t of base) {
            resultado.push({
                ...t,
                contaId: `${t.contaId}-${i}`
            });
        }
    }
    return resultado;
}

const bancoGrande = gerarMuitasTransacoes(transacoes, 2000);

// regra de suspeita
function analisarSequencial(lista, coinFiltro) {
    const suspeitas = [];

    for (const t of lista) {
        const coinValida = !coinFiltro || coinFiltro === "TODAS" || t.coin === coinFiltro;
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

function dividirArray(array, partes) {
    const tamanho = Math.ceil(array.length / partes);
    const blocos = [];

    for (let i = 0; i < partes; i++) {
        const inicio = i * tamanho;
        const fim = inicio + tamanho;
        blocos.push(array.slice(inicio, fim));
    }

    return blocos;
}

function executarWorker(parte, coinFiltro) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, "worker.js"), {
            workerData: {
                transacoes: parte,
                coinFiltro
            }
        });

        worker.on("message", (resultado) => resolve(resultado));
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) {
                reject(new Error(`Worker finalizado com código ${code}`));
            }
        });
    });
}

app.get("/api/transacoes", (req, res) => {
    const coin = req.query.coin || "TODAS";
    const filtradas = bancoGrande.filter(
        (t) => coin === "TODAS" || t.coin === coin
    );

    res.json({
        total: filtradas.length,
        exemplo: filtradas.slice(0, 20)
    });
});

app.get("/api/analisar/sequencial", (req, res) => {
    const coin = req.query.coin || "TODAS";

    const inicio = Date.now();
    const suspeitas = analisarSequencial(bancoGrande, coin);
    const fim = Date.now();

    res.json({
        modo: "sequencial",
        coin,
        totalTransacoes: bancoGrande.length,
        totalSuspeitas: suspeitas.length,
        tempoMs: fim - inicio,
        suspeitas: suspeitas.slice(0, 50)
    });
});

app.get("/api/analisar/paralelo", async(req, res) => {
    const coin = req.query.coin || "TODAS";

    try {
        const inicio = Date.now();

        const blocos = dividirArray(bancoGrande, 3);

        const resultados = await Promise.all([
            executarWorker(blocos[0], coin),
            executarWorker(blocos[1], coin),
            executarWorker(blocos[2], coin)
        ]);

        const suspeitas = resultados.flat();
        const fim = Date.now();

        res.json({
            modo: "paralelo",
            coin,
            workers: 3,
            totalTransacoes: bancoGrande.length,
            totalSuspeitas: suspeitas.length,
            tempoMs: fim - inicio,
            suspeitas: suspeitas.slice(0, 50)
        });
    } catch (error) {
        res.status(500).json({
            erro: "Erro ao processar em paralelo",
            detalhes: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
app.get("/teste", (req, res) => {
    res.send("API funcionando");
});
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});