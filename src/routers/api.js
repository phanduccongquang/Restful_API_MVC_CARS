const express = require('express')
const { getAllcars, showDetailCar,
    createCar, updateCars,
    deleteCars, showMaf, create_maf, updateMaf,
    deleteMaf, GetCarWithMafAndPrice, SearchCars, login,
    logout, signup, authenticateToken, authorizeRole, updateUser } = require('../controllers/homeControllerAPI')

const routeAPI = express.Router()


routeAPI.get('/logout', authenticateToken, logout);
routeAPI.get('/listCars', authenticateToken, authorizeRole(['admin', 'user']), getAllcars);
routeAPI.get('/show/:car_id', authenticateToken, authorizeRole(['admin', 'user']), showDetailCar);
routeAPI.get('/show', authenticateToken, authorizeRole(['admin', 'user']), showMaf);
routeAPI.get('/showCar/Maf_price', authenticateToken, authorizeRole(['admin', 'user']), GetCarWithMafAndPrice);
routeAPI.get('/search', authenticateToken, authorizeRole(['admin', 'user']), SearchCars);

routeAPI.post('/signup', signup);
routeAPI.post('/login', login);

routeAPI.post('/createCars', authenticateToken, authorizeRole(['admin']), createCar);
routeAPI.post('/createMaf', authenticateToken, authorizeRole(['admin']), create_maf);

routeAPI.put('/update/:car_id', authenticateToken, authorizeRole(['admin']), updateCars);
routeAPI.put('/updateMaf/:manufacturer_id', authenticateToken, authorizeRole(['admin']), updateMaf);
routeAPI.patch('/updateUser/:id', authenticateToken, updateUser)

routeAPI.delete('/delete/:car_id', authenticateToken, authorizeRole(['admin']), deleteCars);
routeAPI.delete('/deleteMaf/:Maf_id', authenticateToken, authorizeRole(['admin']), deleteMaf);




module.exports = routeAPI

