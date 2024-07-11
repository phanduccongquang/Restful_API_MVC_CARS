const express = require('express')
const { getAllcars, showDetailCar,
    createCar, updateCars,
    deleteCars, showMaf, create_maf, updateMaf,
    deleteMaf, GetCarWithMafAndPrice, SearchCars, login, logout, signup } = require('../controllers/homeControllerAPI')

const routeAPI = express.Router()
routeAPI.get('/logout', logout)
routeAPI.get('/listCars', getAllcars)
routeAPI.get('/show/:car_id', showDetailCar)
routeAPI.get('/show', showMaf)
routeAPI.get('/showCar/Maf_price', GetCarWithMafAndPrice)
routeAPI.get('/search', SearchCars)

routeAPI.post('/signup', signup)
routeAPI.post('/login', login)

routeAPI.post('/createCars', createCar)
routeAPI.post('/createMaf', create_maf)

routeAPI.put('/update/:car_id', updateCars)
routeAPI.put('/updateMaf/:manufacturer_id', updateMaf)

routeAPI.delete('/delete/:car_id', deleteCars)
routeAPI.delete('/deleteMaf/:Maf_id', deleteMaf)




module.exports = routeAPI

