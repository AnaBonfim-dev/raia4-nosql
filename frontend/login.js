const API_AUTH_URL = "http://localhost:3000/api/usuarios";

const formLogin = document.getElementById("formLogin");
const tituloAcesso = document.getElementById("tituloAcesso");
const campoNomeGrupo = document.getElementById("campoNomeGrupo");
const btnAcesso = document.getElementById("btnAcesso");
const alternarModo = document.getElementById("alternarModo");

let modoCadastro = false;

function mostrarAviso(mensagem, ehErro = false) {
    const toast = document.getElementById("toastAviso");
    if (!toast) return;

    toast.textContent = mensagem;
    toast.classList.toggle("erro", ehErro);
    toast.hidden = false;

    setTimeout(() => {
        toast.hidden = true;
    }, 3500);
}

// aqui alterna entre a tela de login e a tela de cadastro
alternarModo.addEventListener("click", function (e) {
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
        mostrarAviso(erro.message, true);
    }
});
