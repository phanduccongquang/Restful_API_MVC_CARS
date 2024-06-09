const express = require('express')
// const app = express()
const { getAllcars, showDetailCar, create,
    createCar, getCarById, updateCars,
    deleteCars, showMaf, createMaf, create_maf, updateMaf, getMafById,
    deleteMaf, GetCarWithMafAndPrice, SearchCars } = require('../controllers/homeController')

const route = express.Router()
// route.get('/', getHomePage)
route.get('/listCars', getAllcars)
route.get('/show/:car_id', showDetailCar)
route.get('/show', showMaf)
route.get('/showCar/Maf_price', GetCarWithMafAndPrice)//http://localhost:3000/showCar/Maf_price?manufacturer=H&price=11111

route.get('/search', SearchCars)

route.get('/update/:car_id', getCarById)
route.get('/updateMaf/:manufacturer_id', getMafById)


// route.get('/show', showDetailCar)
route.get('/create', create)
route.get('/createMaf', createMaf)

route.post('/createCars', createCar)
route.post('/createMaf', create_maf)

route.put('/update/:car_id', updateCars)
route.put('/updateMaf/:manufacturer_id', updateMaf)

route.delete('/delete/:car_id', deleteCars)
route.delete('/deleteMaf/:Maf_id', deleteMaf)




module.exports = route

