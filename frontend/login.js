const API_AUTH_URL = "http://localhost:3000/api/usuarios";

const formLogin = document.getElementById("formLogin");
const tituloAcesso = document.getElementById("tituloAcesso");
const campoNomeGrupo = document.getElementById("campoNomeGrupo");
const btnAcesso = document.getElementById("btnAcesso");
const alternarModo = document.getElementById("alternarModo");

let modoCadastro = false;

// aqui alterna entre a tela de login e a tela de cadastro
alternarModo.addEventListener("click", function(e) {
    e.preventDefault();
    modoCadastro = !modoCadastro;

    if (modoCadastro) {
        if (tituloAcesso) tituloAcesso.textContent = "Criar Conta";
        campoNomeGrupo.style.display = "block";
        document.getElementById("nome").required = true;
        btnAcesso.textContent = "Cadastrar";
        alternarModo.textContent = "Já tem conta? Faça login";
    } else {
        if (tituloAcesso) tituloAcesso.textContent = "Entrar no Raia 4";
        campoNomeGrupo.style.display = "none";
        document.getElementById("nome").required = false;
        btnAcesso.textContent = "Entrar";
        alternarModo.textContent = "Não tem conta? Cadastre-se aqui";
    }
});


formLogin.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const nome = document.getElementById("nome").value;

    const rota = modoCadastro ? `${API_AUTH_URL}/cadastro` : `${API_AUTH_URL}/login`;
    const dados = modoCadastro ? { nome, email, senha } : { email, senha };

    try {
        const resposta = await fetch(rota, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || "Credenciais inválidas.");
        }

        const usuario = await resposta.json();

        localStorage.setItem("raia4_usuario", JSON.stringify(usuario));
        window.location.href = "index.html";

    } catch (erro) {
        // se a rota de usuários ainda não existir no back-end, entra mesmo assim (aqui é pra teste)
        if (erro.message.includes("Failed to fetch")) {
            const usuarioSimulado = {
                nome: nome || email.split("@")[0],
                email: email
            };
            localStorage.setItem("raia4_usuario", JSON.stringify(usuarioSimulado));
            window.location.href = "index.html";
            return;
        }
        alert("Erro: " + erro.message);
    }
});
