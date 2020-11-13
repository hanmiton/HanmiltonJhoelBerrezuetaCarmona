require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios"); 


const jsonParser = bodyParser.json()

const mongoose = require("mongoose");

require("./Employee");
const Employee = mongoose.model("Employee");


mongoose.connect(`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.l1i04.mongodb.net/${process.env.NAME_DB}?retryWrites=true&w=majority`, () =>{
    console.log("conect succesfull mongodb");
})

app.post('/employee', jsonParser, function (req, res) {
    let newEmployee = {
        name: req.body.name,
        age: req.body.age,
        identification: req.body.identification,
        phone: req.body.phone,
        address: req.body.address,
        email: req.body.email,
        code: req.body.code
    }

    let employee = new Employee(newEmployee);

    employee.save().then( () => {
        console.log("New Employee Created");
    }).catch((err)=>{
        if(err){
            throw err;
        }
    })

    res.send("A new Employee created with success");
})

app.post('/checkInVehicle', jsonParser, function (req, res) {
    axios.get(`${process.env.VEHICLES_URL}vehicleByPlates/${req.body.plates}`).then((response) => {
        axios.post(`${process.env.RESERVATIONS_URL}reservation`, {
            //SESSION EMPLOYEE ID
            EmployeeID: '5fadb073847b555d69989ef0',
            VehicleID: response.data._id,
            startDate: new Date(),
            finishDate: new Date(),
            plates: response.data.plates,
          })
          .then(function (response) {
            res.json(response.data);
          })
          .catch(function (error) {
            if(err){
                throw err;
            }
        });
    })

})

app.post('/checkOutVehicle', jsonParser, function (req, res) {
    axios.get(`${process.env.RESERVATIONS_URL}reservationByPlates/${req.body.plates}`).then((response) => {
        axios.get(`${process.env.VEHICLES_URL}vehicleByPlates/${response.data.plates}`).then((responseVehicle) => {
            //TODO SEPARTE IN METHOD
            let today = new Date();
            let initialStartDate = new Date(response.data.startDate);
            let diffMs = (today - initialStartDate); 
            let diffDays = Math.floor(diffMs / 86400000); 
            let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
            let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                // minutes
            let calculateMin = diffDays * 1440 + diffHrs * 60 + diffMins;
            responseVehicle.data.stayTime += calculateMin;

            let updatedVehicle = {
                model: responseVehicle.data.model,
                color: responseVehicle.data.color,
                plates: responseVehicle.data.plates,
                type: responseVehicle.data.type,
                stayTime: responseVehicle.data.stayTime
            }
            
            if(responseVehicle.data.type === "oficial"){
                axios.post(`${process.env.VEHICLES_URL}updateVehiclebyPlate`, updatedVehicle)
                  .then(function (response) {
                    //TODO DELETE RESEVATION
                    res.json(response.data);
                  })
                  .catch(function (err) {
                    if(err){
                        throw err;
                    }
                });
                
            } else if(responseVehicle.data.type === "resident"){
                axios.post(`${process.env.VEHICLES_URL}updateVehiclebyPlate`, updatedVehicle)
                  .then(function (response) {
                    //TODO DELETE RESEVATION
                    res.json(response.data);
                  })
                  .catch(function (err) {
                    if(err){
                        throw err;
                    }
                });
            } else {
                axios.post(`${process.env.VEHICLES_URL}updateVehiclebyPlate`, updatedVehicle)
                  .then(function (response) {
                    //TODO DELETE RESEVATION
                    axios.get(`${process.env.VEHICLES_URL}calculateAmountToPay/PDN-1000`)
                    .then((response) => {
                        res.json(response.data);
                    }).catch((err)=>{
                        if(err){
                            throw err;
                        }
                    })
                    // res.json(response.data);
                  })
                  .catch(function (err) {
                    if(err){
                        throw err;
                    }
                });
            }
        })
    })
})

app.post('/registerOficialVehicle', jsonParser, function (req, res) {
    let newOficialVehicle = {
        model: req.body.model,
        color: req.body.color,
        plates: req.body.plates,
        type: 'oficial',
        stayTime: req.body.stayTime,
        valuePerMin: req.body.valuePerMin
    }
    
    axios.post(`${process.env.VEHICLES_URL}vehicle`, newOficialVehicle)
      .then(function (response) {
        res.json(response.data);
      })
      .catch(function (error) {
        if(err){
            throw err;
        }
    });
})


app.post('/registerResidentVehicle', jsonParser, function (req, res) {
    let newOficialVehicle = {
        model: req.body.model,
        color: req.body.color,
        plates: req.body.plates,
        type: 'resident',
        stayTime: req.body.stayTime,
        valuePerMin: req.body.valuePerMin
    }
    
    axios.post(`${process.env.VEHICLES_URL}vehicle`, newOficialVehicle)
      .then(function (response) {
        res.json(response.data);
      })
      .catch(function (error) {
        if(err){
            throw err;
        }
    });
})

app.post('/startMonth', jsonParser, function (req, res) {    
    axios.get(`${process.env.VEHICLES_URL}vehicleByType/oficial/resident`)
    .then((response) => {
        response.data.forEach(element => {
            if(element.type === "oficial"){
                let updatedVehicle = {
                    plates: element.plates,
                    stayTime: 0
                }
                axios.post(`${process.env.VEHICLES_URL}updateVehiclebyPlate`, updatedVehicle)
                  .then(function (response) {
                    res.json(response.data);
                  })
                  .catch(function (err) {
                    if(err){
                        throw err;
                    }
                });
            } else if(element.type === "resident"){
                axios.delete(`${process.env.RESERVATIONS_URL}reservation/${element.plates}`)
                .then(function (response) {
                    res.json(response.data);
                  })
                  .catch(function (err) {
                    if(err){
                        throw err;
                    }
                })
                
            }
        });
    }).catch((err)=>{
        if(err){
            throw err;
        }
    })
})


app.post('/generatePaymentsResidents', jsonParser, function (req, res) {   
    axios.get(`${process.env.VEHICLES_URL}calculateTimeAndValueVehicle/resident`)
    .then((response) => {
        reportPayments= [];
        response.data.forEach(element => {
            let amauntToPay = element.stayTime * element.valuePerMin;
            let rowReport = {
                numPlaca : element.plates,
                stayTime: element.stayTime,
                amountToPay: amauntToPay
            }
            reportPayments.push(rowReport);
        });
        res.json(reportPayments);
    }).catch((err)=>{
        if(err){
            throw err;
        }
    })
})






app.get('/employees', (req,res) => {
    Employee.find().then((employees) => {
        res.json(employees);
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})

app.get("/employee/:id", (req,res) => {
    Employee.findById(req.params.id).then((employee) => {
        if(employee){
            res.json(employee);
        } else{
            res.sendStatus(404);
        }
    }).catch((err) => {
        if(err){
            throw err;
        }
    })
})


app.delete("/employee/:id", (req, res) => {
    Employee.findOneAndRemove(req.params.id).then(() => {
        res.send("Employee removed with success!")
    }).catch((err)=> {
        if(err){
            throw(err);
        }
    })
})

app.listen(process.env.PORT_SERVER, () => {
    console.log("Up and Running - Reservations Services");
})