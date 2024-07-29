

const express = require('express')
const { getAllcars, showDetailCar, create,
    createCar, getCarById, updateCars,
    deleteCars, showMaf, createMaf, create_maf, updateMaf, getMafById,
    deleteMaf, GetCarWithMafAndPrice, SearchCars, signup, login,
    header, getlogin, getsignup, logout, authenticateToken, authorizeRole, getAlluser, getUserById, updateUser } = require('../controllers/homeController')

const route = express.Router()

route.get('/', header);
route.get('/login', getlogin);
route.get('/singup', getsignup);
route.get('/logout', authenticateToken, logout);
route.get('/listCars', authenticateToken, authorizeRole(['admin', 'user']), getAllcars);
route.get('/show/:car_id', authenticateToken, authorizeRole(['admin', 'user']), showDetailCar);
route.get('/show', authenticateToken, authorizeRole(['admin', 'user']), showMaf);
route.get('/showCar/Maf_price', authenticateToken, authorizeRole(['admin', 'user']), GetCarWithMafAndPrice);
route.get('/search', authenticateToken, authorizeRole(['admin', 'user']), SearchCars);
route.get('/update/:car_id', authenticateToken, authorizeRole(['admin']), getCarById);
route.get('/updateMaf/:manufacturer_id', authenticateToken, authorizeRole(['admin']), getMafById);
route.get('/create', authenticateToken, authorizeRole(['admin']), create);
route.get('/createMaf', authenticateToken, authorizeRole(['admin']), createMaf);
route.get('/user', authenticateToken, getAlluser);
route.get('/updateUser/:id', authenticateToken, getUserById)


route.post('/signup', signup);
route.post('/login', login);

route.post('/createCars', authenticateToken, authorizeRole(['admin']), createCar);
route.post('/createMaf', authenticateToken, authorizeRole(['admin']), create_maf);

route.put('/update/:car_id', authenticateToken, authorizeRole(['admin']), updateCars);
route.put('/updateMaf/:manufacturer_id', authenticateToken, authorizeRole(['admin']), updateMaf);
route.patch('/updateUser/:id', authenticateToken, updateUser)

route.delete('/delete/:car_id', authenticateToken, authorizeRole(['admin']), deleteCars);
route.delete('/deleteMaf/:Maf_id', authenticateToken, authorizeRole(['admin']), deleteMaf);




module.exports = route

