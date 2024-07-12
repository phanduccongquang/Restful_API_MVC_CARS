const express = require('express')
const { getAllcars, showDetailCar, create,
    createCar, getCarById, updateCars,
    deleteCars, showMaf, createMaf, create_maf, updateMaf, getMafById,
    deleteMaf, GetCarWithMafAndPrice, SearchCars, signup, login,
    header, getlogin, getsignup, logout, authenticateToken } = require('../controllers/homeController')

const route = express.Router()
route.get('/', header)
route.get('/login', getlogin)
route.get('/singup', getsignup)
route.get('/logout', authenticateToken, logout)
route.get('/listCars', authenticateToken, getAllcars)
route.get('/show/:car_id', authenticateToken, showDetailCar)
route.get('/show', authenticateToken, showMaf)
route.get('/showCar/Maf_price', authenticateToken, GetCarWithMafAndPrice)
route.get('/search', authenticateToken, SearchCars)
route.get('/update/:car_id', authenticateToken, getCarById)
route.get('/updateMaf/:manufacturer_id', authenticateToken, getMafById)
route.get('/create', authenticateToken, create)
route.get('/createMaf', authenticateToken, createMaf)

route.post('/signup', signup)
route.post('/login', login)

route.post('/createCars', authenticateToken, createCar)
route.post('/createMaf', authenticateToken, create_maf)

route.put('/update/:car_id', authenticateToken, updateCars)
route.put('/updateMaf/:manufacturer_id', authenticateToken, updateMaf)

route.delete('/delete/:car_id', authenticateToken, deleteCars)
route.delete('/deleteMaf/:Maf_id', authenticateToken, deleteMaf)




module.exports = route

