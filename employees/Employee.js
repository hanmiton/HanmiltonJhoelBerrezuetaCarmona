const mongoose = require("mongoose");

mongoose.model("Employee", {
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: false
    }, 
    identification: {
        type: String,
        required: true
    }, 
    phone: {
        type: String,
        required: false
    }, 
    address: {
        type: String,
        required: false
    }, 
    email: {
        type: String,
        required: true
    }, 
    code: {
        type: String,
        required: true
    }
})