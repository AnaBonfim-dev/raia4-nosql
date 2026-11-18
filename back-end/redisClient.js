const { createClient } = require("redis");

// Conecta no Redis local (ou usa a URL do seu arquivo .env)
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (err) => console.error("Erro no Redis:", err));

// Inicia a conexão automaticamente
(async () => {
    await redisClient.connect();
    console.log("Conectado ao Redis com sucesso!");
})();

module.exports = redisClient;
