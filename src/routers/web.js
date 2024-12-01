

const express = require('express')
const { getAllcars, showDetailCar, create_car, createCar,
    getCarById, updateCars,
    deleteCars, showBrand, createBrands, create_brands, updateBrand, getBrandById,
    deleteBrand, GetCar_Brand_Price, SearchCars_name, signup, login,
    header, getlogin, getsignup, logout, authenticateToken, authorizeRole, getAlluser,
    getUserById, updateUser, SearchCars_Brand, getShopping_cart,
    addItemsTopShoppingCart, updateCartItemQuantity, getUpdateQuantityCars,
    deleteCarItems, createOrder, getUserOrders, getOrderById,
    updateOrderStatus, createPayment, deleteOrder, getAddReviews, addReviews, updateReviews, getUpdateReview
    , deleteReviews } = require('../controllers/homeController')

const route = express.Router()

route.get('/', header);
route.get('/login', getlogin);
route.get('/singup', getsignup);
route.get('/logout', authenticateToken, logout);
route.get('/cars', authenticateToken, authorizeRole(['admin', 'user']), getAllcars);
route.get('/show/:car_id', authenticateToken, authorizeRole(['admin', 'user']), showDetailCar);
route.get('/brands', authenticateToken, authorizeRole(['admin', 'user']), showBrand);
route.get('/showCar/Brand_price', authenticateToken, authorizeRole(['admin', 'user']), GetCar_Brand_Price);
route.get('/showCar/Name', authenticateToken, authorizeRole(['admin', 'user']), SearchCars_name);
route.get('/showCar/Brand', authenticateToken, authorizeRole(['admin', 'user']), SearchCars_Brand);
route.get('/cart', authenticateToken, authorizeRole(['admin', 'user']), getShopping_cart);


route.get('/updateCar/:car_id', authenticateToken, authorizeRole(['admin']), getCarById);
route.get('/updateBrand/:brand_id', authenticateToken, authorizeRole(['admin']), getBrandById);
route.get('/create_car', authenticateToken, authorizeRole(['admin']), create_car);
route.get('/create_brands', authenticateToken, authorizeRole(['admin']), create_brands);
route.get('/user', authenticateToken, getAlluser);
route.get('/updateUser/:id', authenticateToken, getUserById)
route.get('/updateShoppingCart/:car_id', authenticateToken, authorizeRole(['admin', 'user']), getUpdateQuantityCars);
route.get('/getOrders', authenticateToken, authorizeRole(['admin', 'user']), getUserOrders);
route.get('/orderDetails/:id', authenticateToken, authorizeRole(['admin', 'user']), getOrderById);
route.get('/addReviews/:car_id', authenticateToken, authorizeRole(['admin', 'user']), getAddReviews);
route.get('/updateReview/:review_id', authenticateToken, authorizeRole(['admin', 'user']), getUpdateReview);


route.post('/signup', signup);
route.post('/login', login);

route.post('/create_car', authenticateToken, authorizeRole(['admin']), createCar);
route.post('/create_brands', authenticateToken, authorizeRole(['admin']), createBrands);
route.post('/addShoppingCart', authenticateToken, authorizeRole(['admin', 'user']), addItemsTopShoppingCart);
route.post('/createOrder', authenticateToken, authorizeRole(['admin', 'user']), createOrder)
route.post('/payments/:id', authenticateToken, authorizeRole(['admin', 'user']), createPayment)
route.post('/addReviews/:car_id', authenticateToken, authorizeRole(['admin', 'user']), addReviews)



route.put('/updateCar/:car_id', authenticateToken, authorizeRole(['admin']), updateCars);
route.put('/updateBrand/:brand_id', authenticateToken, authorizeRole(['admin']), updateBrand);
route.put('/updateShoppingCart/:car_id', authenticateToken, authorizeRole(['admin', 'user']), updateCartItemQuantity);
route.put('/updateOrderStatus/:id', authenticateToken, authorizeRole(['admin', 'user']), updateOrderStatus);
route.put('/updateReview/:review_id', authenticateToken, authorizeRole(['admin', 'user']), updateReviews);

route.patch('/updateUser/:id', authenticateToken, updateUser)

route.delete('/deleteCar/:car_id', authenticateToken, authorizeRole(['admin']), deleteCars);
route.delete('/deleteBrand/:brand_id', authenticateToken, authorizeRole(['admin']), deleteBrand);
route.delete('/deleteShoppingCart/:car_id', authenticateToken, authorizeRole(['admin', 'user']), deleteCarItems);
route.delete('/deleteOrder/:id', authenticateToken, authorizeRole(['admin', 'user']), deleteOrder);
route.delete('/deleteReview/:review_id', authenticateToken, authorizeRole(['admin', 'user']), deleteReviews);






module.exports = route

