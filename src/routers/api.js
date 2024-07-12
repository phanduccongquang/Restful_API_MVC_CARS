const express = require('express')
const { getAllcars, showDetailCar,
    createCar, updateCars,
    deleteCars, showMaf, create_maf, updateMaf,
    deleteMaf, GetCarWithMafAndPrice, SearchCars, login,
    logout, signup, authenticateToken } = require('../controllers/homeControllerAPI')

const routeAPI = express.Router()
routeAPI.get('/logout', authenticateToken, logout)
routeAPI.get('/listCars', authenticateToken, getAllcars)
routeAPI.get('/show/:car_id', authenticateToken, showDetailCar)
routeAPI.get('/show', authenticateToken, showMaf)
routeAPI.get('/showCar/Maf_price', authenticateToken, GetCarWithMafAndPrice)
routeAPI.get('/search', authenticateToken, SearchCars)

routeAPI.post('/signup', signup)
routeAPI.post('/login', login)

routeAPI.post('/createCars', authenticateToken, createCar)
routeAPI.post('/createMaf', authenticateToken, create_maf)

routeAPI.put('/update/:car_id', authenticateToken, updateCars)
routeAPI.put('/updateMaf/:manufacturer_id', authenticateToken, updateMaf)

routeAPI.delete('/delete/:car_id', authenticateToken, deleteCars)
routeAPI.delete('/deleteMaf/:Maf_id', authenticateToken, deleteMaf)




module.exports = routeAPI

