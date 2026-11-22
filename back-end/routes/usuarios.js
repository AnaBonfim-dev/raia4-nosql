const express = require("express");
const router = express.Router();
const Usuario = require("../usuario");


router.post("/cadastro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const existe = await Usuario.findOne({ email });
        if (existe) {
            return res.status(400).json({ erro: "E-mail já cadastrado." });
        }
        const novoUsuario = await Usuario.create({ nome, email, senha });
        res.status(201).json({ _id: novoUsuario._id, nome: novoUsuario.nome, email: novoUsuario.email });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao cadastrar usuário." });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await Usuario.findOne({ email, senha });
        if (!usuario) {
            return res.status(401).json({ erro: "E-mail ou senha inválidos." });
        }
        res.json({ _id: usuario._id, nome: usuario.nome, email: usuario.email });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao realizar login." });
    }
});

module.exports = router;
