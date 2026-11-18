
const mongoose = require("mongoose");

const treinoSchema = new mongoose.Schema({
    distancia: {
        type: Number,
        required: true
    },

    tempo: {
        type: String,
        required: true
    },

    data: {
        type: Date,
        required: true
    },

    tipo: {
        type: String,
        required: true
    },

    observacoes: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

const Treino = mongoose.model("Treino", treinoSchema);

module.exports = Treino;
