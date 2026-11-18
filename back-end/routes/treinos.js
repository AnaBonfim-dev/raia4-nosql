
const express = require("express");
const router = express.Router();

const Treino = require("../treino");

// CADASTRAR TREINO
router.post("/", async (req, res) => {
    try {
        const novoTreino = new Treino(req.body);

        const treinoSalvo = await novoTreino.save();

        res.status(201).json(treinoSalvo);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

// LISTAR TODOS OS TREINOS
router.get("/", async (req, res) => {
    try {
        const treinos = await Treino.find();

        res.json(treinos);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// BUSCAR TREINO POR ID
router.get("/:id", async (req, res) => {
    try {
        const treino = await Treino.findById(req.params.id);

        if (!treino) {
            return res.status(404).json({ erro: "Treino não encontrado" });
        }

        res.json(treino);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

// EDITAR TREINO
router.put("/:id", async (req, res) => {
    try {
        const treino = await Treino.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!treino) {
            return res.status(404).json({ erro: "Treino não encontrado" });
        }

        res.json(treino);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

// EXCLUIR TREINO
router.delete("/:id", async (req, res) => {
    try {
        const treino = await Treino.findByIdAndDelete(req.params.id);

        if (!treino) {
            return res.status(404).json({ erro: "Treino não encontrado" });
        }

        res.json({ mensagem: "Treino excluído com sucesso!" });
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

module.exports = router;
