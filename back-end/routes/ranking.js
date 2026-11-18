const express = require("express");
const router = express.Router();
const redisClient = require("../redisClient");

// LISTAR O RANKING (TOP 10)
router.get("/", async (req, res) => {
    try {
        // Busca no Sorted Set 'ranking_nadadores' em ordem decrescente
        const lista = await redisClient.zRangeWithScores("ranking_nadadores", 0, 9, {
            REV: true
        });

        // Transforma o formato do Redis para { nome, pontos } que o seu front-end espera
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

