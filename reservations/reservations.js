require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios"); 
const jsonParser = bodyParser.json()

const mongoose = require("mongoose");
require("./Reservation");
const Reservation = mongoose.model("Reservation");

mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.l1i04.mongodb.net/${process.env.NAME_DB}?retryWrites=true&w=majority`, () =>{
    console.log("conect succesfull mongodb");
})

app.post('/reservation', jsonParser, function (req, res) {
    let newReservation = {
        EmployeeID: mongoose.Types.ObjectId(req.body.EmployeeID),
        VehicleID: mongoose.Types.ObjectId(req.body.VehicleID),
        startDate: req.body.startDate,
        finishDate: req.body.finishDate,
        plates: req.body.plates,
    }

    let reservation = new Reservation(newReservation);

    reservation.save().then( () => {
        res.send("Reservation Created with success")
        console.log("New Reservation Created");
    }).catch((err)=>{
        if(err){
            throw err;
        }
    })

    res.send("A new Reservation created with success");
})

app.get('/reservations', (req,res) => {
    Reservation.find().then((reservations) => {
        res.json(reservations);
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})

app.get("/reservation/:id", (req,res) => {
    Reservation.findById(req.params.id).then((reservation) => {
        if(reservation){
            console.log(reservation.EmployeeID);
            axios.get(`${process.env.EMPLOYEES_URL}employee/${reservation.EmployeeID}`).then((response) => {
                let reservationObject = {
                    employeeName: response.data.name, 
                    vehicleplates: ''
                }
                axios.get(`${process.env.VEHICLES_URL}vehicle/${reservation.VehicleID}`).then((response) => {
                    reservationObject.vehicleplates = response.data.plates;
                    res.json(reservationObject);
                })
            })
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})



app.get("/reservationByPlates/:plates", (req,res) => {
    Reservation.findOne({ plates: req.params.plates}).then((reservation) => {
        if(reservation){
            res.json(reservation);
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})


app.delete("/reservation/:plates", (req, res) => {
    
    Reservation.findOne({ plates: req.params.plates}).then((reservation) => {
        if(reservation){
            Reservation.findOneAndRemove(reservation._id).then(() => {
                res.send("Vehicle removed with success!")
            }).catch((err)=> {
                if(err){
                    throw(err);
                }
            })
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })

    
    
})




app.listen(process.env.PORT_SERVER, () => {
    console.log("Up and Running - Reservations Services");
})