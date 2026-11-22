
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const treinosRoutes = require("./routes/treinos");
const rankingRoutes = require("./routes/ranking");
const usuariosRoutes = require("./routes/usuarios");

app.use("/api/treinos", treinosRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/usuarios", usuariosRoutes);

app.get("/", (req, res) => {
    res.send("Raia 4 API funcionando!");
});

// conecta no mongodb
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB conectado com sucesso!");

        const PORT = 3000;

        app.listen(PORT, () => {
            console.log(`Raia 4 rodando na porta ${PORT}`);
        });
    })
    .catch((erro) => {
        console.error("Erro ao conectar ao MongoDB:", erro.message);
    });
