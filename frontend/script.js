// 0. VERIFICAÇÃO DE LOGIN E DADOS DO USUÁRIO
const usuarioLogado = JSON.parse(localStorage.getItem("swimtrack_usuario"));

if (!usuarioLogado) {
    window.location.href = "login.html";
} else {
    const infoUsuario = document.getElementById("infoUsuario");
    if (infoUsuario) {
        infoUsuario.innerHTML = `Olá, <strong>${usuarioLogado.nome}</strong> | <button id="btnSair" type="button" style="width: auto; padding: 4px 12px; margin-left: 8px; cursor: pointer;">Sair</button>`;

        document.getElementById("btnSair").addEventListener("click", function () {
            localStorage.removeItem("swimtrack_usuario");
            window.location.href = "login.html";
        });
    }
}

const API_URL = "http://localhost:3000/api/treinos";
const RANKING_URL = "http://localhost:3000/api/ranking";

const formulario = document.getElementById("formTreino");
const historico = document.getElementById("historico");
const listaRanking = document.getElementById("listaRanking");
const botaoSalvar = document.querySelector("#formTreino button");

let treinos = [];
let editandoId = null;

// 1. CARREGAR TREINOS DO MONGODB
async function carregarTreinos() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os treinos.");
        }

        treinos = await resposta.json();
        mostrarHistorico();

    } catch (erro) {
        console.error("Erro:", erro);
        historico.textContent = "Erro ao carregar os treinos. Verifique o servidor.";
    }
}

// 2. CADASTRAR OU ATUALIZAR TREINO
formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const treino = {
        nadador: usuarioLogado ? usuarioLogado.nome : "Nadador",
        distancia: Number(document.getElementById("distancia").value),
        tempo: document.getElementById("tempo").value,
        data: document.getElementById("data").value,
        tipo: document.getElementById("tipo").value,
        observacoes: document.getElementById("observacoes").value
    };

    try {
        let resposta;

        if (editandoId === null) {
            // CADASTRAR
            resposta = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(treino)
            });
        } else {
            // ATUALIZAR
            resposta = await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(treino)
            });
        }

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || "Erro ao salvar treino.");
        }

        formulario.reset();
        editandoId = null;
        botaoSalvar.textContent = "Salvar treino";

        // Atualiza o histórico e o ranking na hora
        await carregarTreinos();
        await carregarRanking();

        alert("Treino salvo com sucesso!");

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Não foi possível salvar o treino: " + erro.message);
    }
});

// 3. MOSTRAR HISTÓRICO NA TELA
function mostrarHistorico() {
    historico.innerHTML = "";

    if (treinos.length === 0) {
        historico.textContent = "Nenhum treino cadastrado ainda.";
        return;
    }

    treinos.forEach(function (treino) {
        const card = document.createElement("div");
        card.className = "card-treino";

        const titulo = document.createElement("h3");
        titulo.textContent = treino.distancia + " metros";

        const detalhes = document.createElement("p");
        detalhes.textContent = "Tempo: " + treino.tempo + " | Tipo: " + treino.tipo;

        const data = document.createElement("p");
        data.textContent = "Data: " + String(treino.data).slice(0, 10);

        const observacoes = document.createElement("p");
        observacoes.textContent = "Observações: " + (treino.observacoes || "Nenhuma");

        // BOTÃO EDITAR
        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "btn-editar";
        editar.textContent = "Editar treino";

        editar.addEventListener("click", function () {
            document.getElementById("distancia").value = treino.distancia;
            document.getElementById("tempo").value = treino.tempo;
            document.getElementById("data").value = String(treino.data).slice(0, 10);
            document.getElementById("tipo").value = treino.tipo;
            document.getElementById("observacoes").value = treino.observacoes || "";

            editandoId = treino._id;
            botaoSalvar.textContent = "Atualizar treino";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        // BOTÃO EXCLUIR
        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "btn-excluir";
        excluir.textContent = "Excluir treino";

        excluir.addEventListener("click", async function () {
            const confirmar = confirm("Deseja realmente excluir este treino?");

            if (!confirmar) {
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/${treino._id}`, {
                    method: "DELETE"
                });

                if (!resposta.ok) {
                    const erro = await resposta.json();
                    throw new Error(erro.erro || "Erro ao excluir treino.");
                }

                if (editandoId === treino._id) {
                    editandoId = null;
                    formulario.reset();
                    botaoSalvar.textContent = "Salvar treino";
                }

                await carregarTreinos();
                alert("Treino excluído com sucesso!");

            } catch (erro) {
                console.error("Erro:", erro);
                alert("Não foi possível excluir o treino: " + erro.message);
            }
        });

        card.appendChild(titulo);
        card.appendChild(detalhes);
        card.appendChild(data);
        card.appendChild(observacoes);
        card.appendChild(editar);
        card.appendChild(excluir);

        historico.appendChild(card);
    });
}

// 4. CARREGAR RANKING DO REDIS
async function carregarRanking() {
    let dadosRanking = [];

    try {
        const resposta = await fetch(RANKING_URL);
        if (!resposta.ok) throw new Error("Rota ainda não criada");
        dadosRanking = await resposta.json();
    } catch (erro) {
        // Dados simulados caso o servidor/Redis ainda esteja desligado
        dadosRanking = [
            { nome: "Ana Bonfim", pontos: 1450 },
            { nome: "Alberto Cordeiro", pontos: 1200 },
            { nome: "Hilton Tauan", pontos: 980 },
            { nome: "Otavio Nascimento", pontos: 750 }
        ];
    }

    mostrarRanking(dadosRanking);
}

// 5. MOSTRAR RANKING NA TELA
function mostrarRanking(ranking) {
    listaRanking.innerHTML = "";

    if (ranking.length === 0) {
        listaRanking.textContent = "Nenhum nadador pontuou ainda.";
        return;
    }

    ranking.forEach(function (nadador, index) {
        const item = document.createElement("div");
        item.className = "item-ranking";
        item.textContent = `${index + 1}º lugar — ${nadador.nome}: ${nadador.pontos} pts`;
        listaRanking.appendChild(item);
    });
}

// INICIALIZA TUDO AO ABRIR A PÁGINA
carregarTreinos();
carregarRanking();
