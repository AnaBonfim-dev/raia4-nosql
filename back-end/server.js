
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Importar as rotas de treinos
const treinosRoutes = require("./routes/treinos");

// Rota inicial
app.get("/", (req, res) => {
    res.send("SwimTrack API funcionando!");
});

// Registrar as rotas
app.use("/api/treinos", treinosRoutes);

// Conectar ao MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB conectado com sucesso!");

        const PORT = 3000;

        app.listen(PORT, () => {
            console.log(`SwimTrack rodando na porta ${PORT}`);
        });
    })
    .catch((erro) => {
        console.error("Erro ao conectar ao MongoDB:", erro.message);
    });
