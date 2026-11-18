const API_AUTH_URL = "http://localhost:3000/api/usuarios";

const formLogin = document.getElementById("formLogin");
const tituloAcesso = document.getElementById("tituloAcesso");
const campoNomeGrupo = document.getElementById("campoNomeGrupo");
const btnAcesso = document.getElementById("btnAcesso");
const alternarModo = document.getElementById("alternarModo");

let modoCadastro = false;

// Alterna entre tela de Login e tela de Cadastro
alternarModo.addEventListener("click", function(e) {
    e.preventDefault();
    modoCadastro = !modoCadastro;

    if (modoCadastro) {
        tituloAcesso.textContent = "Criar Conta";
        campoNomeGrupo.style.display = "block";
        document.getElementById("nome").required = true;
        btnAcesso.textContent = "Cadastrar";
        alternarModo.textContent = "Já tem conta? Faça login";
    } else {
        tituloAcesso.textContent = "Entrar no SwimTrack";
        campoNomeGrupo.style.display = "none";
        document.getElementById("nome").required = false;
        btnAcesso.textContent = "Entrar";
        alternarModo.textContent = "Não tem conta? Cadastre-se aqui";
    }
});

// Envia Login ou Cadastro
formLogin.addEventListener("submit", async function(e) {
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

        // Salva o usuário logado no navegador
        localStorage.setItem("swimtrack_usuario", JSON.stringify(usuario));
        window.location.href = "index.html";

    } catch (erro) {
        // Fallback (Modo Teste): se a rota de usuários ainda não existir no back-end, entra mesmo assim
        if (erro.message.includes("Failed to fetch")) {
            const usuarioSimulado = {
                nome: nome || email.split("@")[0],
                email: email
            };
            localStorage.setItem("swimtrack_usuario", JSON.stringify(usuarioSimulado));
            window.location.href = "index.html";
            return;
        }
        alert("Erro: " + erro.message);
    }
});
