
const API_URL = "http://localhost:3000/api/treinos";

const formulario = document.getElementById("formTreino");
const historico = document.getElementById("historico");
const botaoSalvar = document.querySelector("#formTreino button");

let treinos = [];
let editandoId = null;

// CARREGAR TREINOS DO MONGODB
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

// CADASTRAR OU ATUALIZAR TREINO
formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    const treino = {
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

        await carregarTreinos();

        alert("Treino salvo com sucesso!");

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Não foi possível salvar o treino: " + erro.message);
    }
});

// MOSTRAR HISTÓRICO
function mostrarHistorico() {
    historico.innerHTML = "";

    if (treinos.length === 0) {
        historico.textContent = "Nenhum treino cadastrado ainda.";
        return;
    }

    treinos.forEach(function(treino) {
        const card = document.createElement("div");

        const titulo = document.createElement("h3");
        titulo.textContent = treino.distancia + " metros";

        const detalhes = document.createElement("p");
        detalhes.textContent = "Tempo: " + treino.tempo + " | Tipo: " + treino.tipo;

        const data = document.createElement("p");
        data.textContent = "Data: " + String(treino.data).slice(0, 10);

        const observacoes = document.createElement("p");
        observacoes.textContent = "Observações: " + (treino.observacoes || "");

        // BOTÃO EDITAR
        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar treino";

        editar.addEventListener("click", function() {
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
        excluir.textContent = "Excluir treino";

        excluir.addEventListener("click", async function() {
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

// CARREGAR AUTOMATICAMENTE AO ABRIR A PÁGINA
carregarTreinos();
