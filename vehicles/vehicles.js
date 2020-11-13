require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json()

const mongoose = require("mongoose");

require("./Vehicle");
const Vehicle = mongoose.model("Vehicle");

mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.l1i04.mongodb.net/${process.env.NAME_DB}?retryWrites=true&w=majority`, () =>{
    console.log("conect succesfull mongodb");
})

app.post('/vehicle', jsonParser, function (req, res) {
    let newVehicle = {
        model: req.body.model,
        color: req.body.color,
        plates: req.body.plates,
        type: req.body.type,
        stayTime: req.body.stayTime,
        valuePerMin: req.body.valuePerMin
    }

    let vehicle = new Vehicle(newVehicle);

    vehicle.save().then( () => {
        console.log("New Vehicle Created");
    }).catch((err)=>{
        if(err){
            throw err;
        }
    })

    res.send("A new Vehicle created with success");
})

app.post('/updateVehiclebyPlate', jsonParser, function (req, res) {

    const filter = { plates: req.body.plates };
    const update = req.body;

    Vehicle.updateOne(filter,  
        update, function (err, docs) { 
        if (err){ 
            throw err;
        } 
        else{ 
            res.send("Vehicle updated with success");
        } 
    });
})

app.post('/updateVehiclebyPlate', jsonParser, function (req, res) {

    const filter = { plates: req.body.plates };
    const update = req.body;

    Vehicle.updateOne(filter,  
        update, function (err, docs) { 
        if (err){ 
            throw err;
        } 
        else{ 
            res.send("Vehicle updated with success");
        } 
    });
})


app.get('/calculateAmountToPay/:plates', jsonParser, function (req, res) {
    Vehicle.findOne({ plates: req.params.plates}).then((vehicle) => {
        if(vehicle){
            res.json(`El valor a pagar es : ${vehicle.stayTime * vehicle.valuePerMin}`);
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
    // res.send("Aqui se calcula el amount");
})

app.get('/vehicleByType/:type1/:type2', function(req, res) {
    Vehicle.find({ $or: [{'type': req.params.type1}, {type: req.params.type2}]})
    .then((vehicle) => {
        if(vehicle){
            res.json(vehicle);
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
});

app.get('/calculateTimeAndValueVehicle/:type1', function(req, res) {
    Vehicle.find({ $or: [{'type': req.params.type1}]})
    .then((vehicle) => {
        if(vehicle){
            res.json(vehicle);
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
});

app.get('/vehicles', (req,res) => {
    Vehicle.find().then((vehicles) => {
        res.json(vehicles   );
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})

app.get("/vehicle/:id", (req,res) => {
    Vehicle.findById(req.params.id).then((vehicle) => {
        if(vehicle){
            res.json(vehicle);
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})

app.get("/vehicleByPlates/:plates", (req,res) => {
    Vehicle.findOne({ plates: req.params.plates}).then((vehicle) => {
        if(vehicle){
            res.json(vehicle);
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})

app.delete("/vehicle/:id", (req, res) => {
    Vehicle.findOneAndRemove(req.params.id).then(() => {
        res.send("Vehicle removed with success!")
    }).catch((err)=> {
        if(err){
            throw(err);
        }
    })
})


app.listen(process.env.PORT_SERVER, () => {
    console.log("Up and Running - Reservations Services");
})