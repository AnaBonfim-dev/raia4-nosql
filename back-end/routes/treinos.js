const redisClient = require("../redisClient");
const express = require("express");
const router = express.Router();

const Treino = require("../treino");

// cadastra treino
router.post("/", async (req, res) => {
    try {
        const novoTreino = new Treino(req.body);
        const treinoSalvo = await novoTreino.save();
        const pontosGanhos = Math.floor(treinoSalvo.distancia / 10);
        const nomeNadador = req.body.nadador || "Ana Bonfim";

        await redisClient.zIncrBy("ranking_nadadores", pontosGanhos, nomeNadador);

        res.status(201).json(treinoSalvo);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

// aqui lista os treinos
router.get("/", async (req, res) => {
    try {
        const treinos = await Treino.find();

        res.json(treinos);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// aqui busca o treino por id
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

// aq atualiza treino 
router.put("/:id", async (req, res) => {
    try {
        const treinoAntigo = await Treino.findById(req.params.id);
        if (!treinoAntigo) {
            return res.status(404).json({ erro: "Treino não encontrado" });
        }

        const treinoAtualizado = await Treino.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        const pontosAntigos = Math.floor(treinoAntigo.distancia / 10);
        const pontosNovos = Math.floor(treinoAtualizado.distancia / 10);
        const diferenca = pontosNovos - pontosAntigos;
        const nomeNadador = treinoAtualizado.nadador || req.body.nadador || "Ana Bonfim";

        if (diferenca !== 0) {
            await redisClient.zIncrBy("ranking_nadadores", diferenca, nomeNadador);
        }

        res.json(treinoAtualizado);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

// aq exclui treino
router.delete("/:id", async (req, res) => {
    try {
        const treino = await Treino.findByIdAndDelete(req.params.id);

        if (!treino) {
            return res.status(404).json({ erro: "Treino não encontrado" });
        }

        const pontosPerdidos = Math.floor(treino.distancia / 10);
        const nomeNadador = treino.nadador || "Ana Bonfim";

        await redisClient.zIncrBy("ranking_nadadores", -pontosPerdidos, nomeNadador);

        res.json({ mensagem: "Treino excluído com sucesso!" });
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});

module.exports = router;
