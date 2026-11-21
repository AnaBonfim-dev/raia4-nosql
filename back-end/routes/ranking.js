const express = require("express");
const router = express.Router();
const redisClient = require("../redisClient");

// listar ranking
router.get("/", async (req, res) => {
    try {
        const lista = await redisClient.zRangeWithScores("ranking_nadadores", 0, 9, {
            REV: true
        });

        const rankingFormatado = lista.map((item) => ({
            nome: item.value,
            pontos: item.score
        }));

        res.json(rankingFormatado);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar ranking no Redis: " + erro.message });
    }
});

module.exports = router;
