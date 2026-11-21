
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const treinosRoutes = require("./routes/treinos");
const rankingRoutes = require("./routes/ranking");

app.use("/api/ranking", rankingRoutes);

app.get("/", (req, res) => {
    res.send("Raia 4 API funcionando!");
});


app.use("/api/treinos", treinosRoutes);

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
