const mongoose = require("mongoose");

mongoose.model("Reservation", {
    EmployeeID:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    VehicleID:{
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
    },
    finishDate: {
        type: Date,
        required: true,
    },
    plates: {
        type: String,
        required: true,
    }
})