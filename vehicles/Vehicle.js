const mongoose = require("mongoose");

mongoose.model("Vehicle", {
    model: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: false
    }, 
    plates: {
        type: String,
        required: true
    }, 
    type: {
        type: String,
        required: true
    }, 
    stayTime: {
        type: Number,
        required: false
    }, 
    valuePerMin: {
        type: Number,
        required: true
    }
})