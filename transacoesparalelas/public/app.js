const coinSelect = document.getElementById("coin");
const btnListar = document.getElementById("btnListar");
const btnSequencial = document.getElementById("btnSequencial");
const btnParalelo = document.getElementById("btnParalelo");
const resumo = document.getElementById("resumo");
const resultado = document.getElementById("resultado");

function getCoin() {
    return coinSelect.value;
}

function renderResumo(data) {
    resumo.innerHTML = `
    <p><strong>Modo:</strong> ${data.modo || "listagem"}</p>
    <p><strong>Coin:</strong> ${data.coin || getCoin()}</p>
    <p><strong>Total de transações:</strong> ${data.totalTransacoes || data.total || 0}</p>
    ${data.totalSuspeitas !== undefined ? `<p><strong>Total suspeitas:</strong> ${data.totalSuspeitas}</p>` : ""}
    ${data.tempoMs !== undefined ? `<p><strong>Tempo:</strong> ${data.tempoMs} ms</p>` : ""}
    ${data.workers ? `<p><strong>Workers:</strong> ${data.workers}</p>` : ""}
  `;
}

function renderLista(lista, mostrarMotivo = false) {
  if (!lista.length) {
    resultado.innerHTML = "<p>Nenhum item encontrado.</p>";
    return;
  }

  resultado.innerHTML = lista.map(item => `
    <div class="item">
      <p><strong>Nome:</strong> ${item.nome}</p>
      <p><strong>Conta:</strong> ${item.contaId}</p>
      <p><strong>Coin:</strong> ${item.coin}</p>
      <p><strong>Valor:</strong> R$ ${item.valor}</p>
      ${mostrarMotivo ? `<span class="badge">${item.motivo}</span>` : ""}
    </div>
  `).join("");
}

btnListar.addEventListener("click", async () => {
  const coin = getCoin();
  const resposta = await fetch(`/api/transacoes?coin=${coin}`);
  const data = await resposta.json();

  renderResumo({
    coin,
    total: data.total
  });
  renderLista(data.exemplo, false);
});

btnSequencial.addEventListener("click", async () => {
  const coin = getCoin();
  const resposta = await fetch(`/api/analisar/sequencial?coin=${coin}`);
  const data = await resposta.json();

  renderResumo(data);
  renderLista(data.suspeitas, true);
});

btnParalelo.addEventListener("click", async () => {
  const coin = getCoin();
  const resposta = await fetch(`/api/analisar/paralelo?coin=${coin}`);
  const data = await resposta.json();

  renderResumo(data);
  renderLista(data.suspeitas, true);
});