# Concorrência em Node.js

Experimentos da disciplina de Sistemas Operacionais (ADS371), com **JavaScript, Node.js, Express e worker_threads**.

O repositório reúne dois estudos: processamento de transações com e sem paralelismo e sincronização de escrita em arquivos.

## 1. Análise de transações

A pasta [transacoesparalelas](transacoesparalelas/) contém uma interface web e uma API Express que processam dados simulados.

- Gera 30.000 transações a partir de uma base fictícia.
- Filtra por moeda e sinaliza valores acima de 10.000.
- Compara execução sequencial com execução em três workers.
- Retorna tempo em milissegundos, totais e uma amostra dos resultados.

A regra é didática: não constitui um sistema real de análise financeira ou detecção de fraude.

### Executar

Requisito: Node.js 22 ou superior com npm.

```sh
git clone https://github.com/lucaslusni/Sistemas-Operacionais-ADS371.git
cd Sistemas-Operacionais-ADS371/transacoesparalelas
npm install
npm start
```

Acesse http://localhost:3000.

| Endpoint | Resultado |
| --- | --- |
| `GET /api/transacoes` | Total e amostra das transações |
| `GET /api/analisar/sequencial` | Análise na thread principal |
| `GET /api/analisar/paralelo` | Análise distribuída entre três workers |

Os endpoints aceitam `?coin=BTC`, por exemplo. Sem filtro, utilizam `TODAS`.

### Interpretar os tempos

O modo paralelo cria workers a cada requisição e transfere os dados para eles. Esse custo pode superar o benefício do paralelismo em tarefas pequenas. Um resultado mais lento no modo paralelo também é um resultado válido do experimento.

Para comparar, use o mesmo filtro, repita as medições e confira se os totais de transações suspeitas coincidem. O tempo usa `Date.now()`, e a carga é simulada: não trate uma medição isolada como benchmark de produção.

## 2. Escrita concorrente

A pasta [Controle_de_concorrência_na_escrita_de_arquivos](Controle_de_concorrência_na_escrita_de_arquivos/) executa 20 workers, cada um realizando 500 escritas, com e sem sincronização.

```sh
cd Controle_de_concorrência_na_escrita_de_arquivos
node main.js
```

Execute a partir dessa pasta. Não há dependências externas para esse experimento.

O programa recria `saida_sem_trava.txt` e `saida_com_trava.txt` a cada execução. Os resultados podem variar conforme o ambiente; examine o conteúdo e a quantidade de registros, não apenas o tempo.

## Estrutura

- `transacoesparalelas/server.js`: API, dados simulados e distribuição do trabalho.
- `transacoesparalelas/worker.js`: processamento de cada bloco.
- `transacoesparalelas/public/`: interface web.
- `Controle_de_concorrência_na_escrita_de_arquivos/main.js`: coordenação dos workers.
- `Controle_de_concorrência_na_escrita_de_arquivos/worker.js`: escrita e sincronização.

## Limitações

A API de demonstração não implementa autenticação, banco de dados ou pool persistente de workers. Execute localmente para estudo. Dependências são instaladas com npm e não devem ser versionadas em `node_modules`.

