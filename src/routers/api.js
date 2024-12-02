const express = require('express')
const { getAllcars, showDetailCar,
    createCar, updateCars,
    deleteCars, showBrand, createBrands, updateBrand,
    deleteBrand, GetCar_Brand_Price, SearchCars, login,
    logout, signup, authenticateToken, authorizeRole,
    updateUser, cacheMiddleware, getAlluser, getShopping_cart,
    addItemsTopShoppingCart, updateCartItemQuantity, deleteCarItems, createOrder,
    deleteOrder, getUserOrders, getOrderById, updateOrderStatus, createPayment, addReviews, deleteReviews,
    updateReviews
} = require('../controllers/homeControllerAPI')

const routeAPI = express.Router()

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Tài khoản user
 *   - name: Cars
 *     description: API quản lý xe
 *   - name: Cars_brands
 *     description: API quản lý nhà sản xuất
 *   - name: Shopping
 *     description: API quản lý giỏ hàng
 */

routeAPI.post('/logout', authenticateToken, logout);
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Đăng xuất người dùng
 *     tags: 
 *       - Auth
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout thành công"
 *       500:
 *         description: Có lỗi xảy ra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Đăng xuất thất bại"
 */
routeAPI.get('/listUser', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), getAlluser)
/**
 * @swagger
 * /listUser:
 *   get:
 *     summary: Lấy danh sách tất User
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Danh sách User
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/user'
 * 
 */
routeAPI.get('/listCars', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), getAllcars);
/**
 * @swagger
 * /listCars:
 *   get:
 *     summary: Lấy danh sách tất cả các xe
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: Danh sách xe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/cars'
 * 
 */
routeAPI.get('/show/:car_id', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), showDetailCar);
/**
 * @swagger
 * /show/{car_id}:
 *   get:
 *     summary: Lấy thông tin xe theo ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: car_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của xe
 *     responses:
 *       200:
 *         description: Thông tin xe theo ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cars'
 *       404:
 *         description: Không tìm thấy xe
 * 
 */
routeAPI.get('/show', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), showBrand);
/**
 * @swagger
 * /show:
 *   get:
 *     summary: Lấy danh sách tất cả các nhà sản xuất
 *     tags: [Cars_brands]
 *     responses:
 *       200:
 *         description: Danh sách nhà sản xuất
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/car_brands' 
 */
routeAPI.get('/showCar/Brand_price', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), GetCar_Brand_Price);
/**
 * @swagger
 * /showCar/Brand_price:
 *   get:
 *     summary: Lấy thông tin xe theo ID nhà sản xuất và giá tiền
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nhà sản xuất
 *       - in: query
 *         name: price
 *         schema:
 *           type: string
 *         required: true
 *         description: giá tiền
 *     responses:
 *       200:
 *         description: Thông tin xe theo nhà sản xuất và giá tiền
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cars'
 *       404:
 *         description: Không tìm thấy nhà sản xuất 
 */
routeAPI.get('/search', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), SearchCars);
/**
 * @swagger
 * /search:
 *   get:
 *     summary: Lấy thông tin nhà sản xuất theo tên
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: Model của nhà sản xuất
 *     responses:
 *       200:
 *         description: Thông tin xe theo model
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cars'
 *       404:
 *         description: Không tìm thấy nhà sản xuất 
 */
routeAPI.get('/cart', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), getShopping_cart);
/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Lấy tất cả các mặt hàng trong giỏ hàng
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả các mặt hàng trong giỏ hàng
 *         content:
 *           application/json:
 *             schema:
 */
routeAPI.get('/getOrders', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), getUserOrders);
/**
 * @swagger
 * /getOrders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của bạn
 *     tags: [Shopping]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả  đơn hàng 
 *         content:
 *           application/json:
 *             schema:
 */
routeAPI.get('/orderDetails/:id', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), getOrderById);
/**
 * @swagger
 * /orderDetails/{id}:
 *   get:
 *     summary: Xem chi tiết đơn hàng theo id
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Thông tin chi tiết đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/orders'
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
routeAPI.post('/signup', signup);
/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Đăng kí account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *           example:
 *             name: "quangbabop"
 *             email: "anhemdeo@gmail.com"
 *             password: "123"
 *             repassword: "123"
 *             phone: "0393970862"
 *             address: "dak lăk"
 *     responses:
 *       200:
 *         description: Account đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       500:
 *         description: Lỗi server
 */

routeAPI.post('/login', login);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *           example:
 *             email: "anhemdeo@gmail.com"
 *             password: "123"
 *     responses:
 *       200:
 *         description: Đã đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       500:
 *         description: Lỗi server
 */

routeAPI.post('/createCars', authenticateToken, authorizeRole(['admin']), createCar);
/**
 * @swagger
 * /createCars:
 *   post:
 *     summary: Tạo một xe mới
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/cars'
 *     responses:
 *       200:
 *         description: Xe đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cars'
 *       500:
 *         description: Lỗi server
 */
routeAPI.post('/addShoppingCart', authenticateToken, authorizeRole(['admin', 'user']), addItemsTopShoppingCart);
/**
 * @swagger
 * /addShoppingCart:
 *   post:
 *     summary: Thêm xe vào giỏ hàng
 *     tags: [Shopping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/cart_items'
 *           example:
 *             car_id: "h3"
 *             quantity: 1
 *     responses:
 *       200:
 *         description: Xe đã được thêm vào giỏ hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart_items'
 *       500:
 *         description: Lỗi server
 */
routeAPI.post('/createOrder', authenticateToken, authorizeRole(['admin', 'user']), createOrder)
/**
 * @swagger
 * /createOrder:
 *   post:
 *     summary: Tạo đơn hàng
 *     tags: [Shopping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/order_items'
 *           example:
 *             car_id: "h3"
 *             quantity: 1
 *     responses:
 *       200:
 *         description: Đơn hàng đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/order_items'
 *       500:
 *         description: Lỗi server
 */
routeAPI.post('/create_brands', authenticateToken, authorizeRole(['admin']), createBrands);
/**
 * @swagger
 * /create_brands:
 *   post:
 *     summary: Tạo một nhà sản xuất mới
 *     tags: [Cars_brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/car_brands'
 *     responses:
 *       200:
 *         description: Nhà sản xuất đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/car_brands'
 *       500:
 *         description: Lỗi server 
 */
routeAPI.post('/payments/:id', authenticateToken, authorizeRole(['admin', 'user']), createPayment)
/**
 * @swagger
 * /payments/{id}:
 *   post:
 *     summary: Tạo thanh toán
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của đơn hàng
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Số tiền thanh toán
 *                 example: 100.50
 *             example:
 *               amount: 100.50
 *     responses:
 *       200:
 *         description: Thanh toán đã tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/payments'
 *       500:
 *         description: Lỗi server 
 */
routeAPI.post('/addReviews/:car_id', authenticateToken, authorizeRole(['admin', 'user']), addReviews)
/**
 * @swagger
 * /addReviews/{car_id}:
 *   post:
 *     summary: Thêm đánh giá
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: car_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của xe để thêm đánh giá
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: Số sao đánh giá
 *                 example: 1,2,3,4,5
 *               comment:
 *                 type: text
 *                 description: đánh giá của mọi người
 *                 example: xe đó rất tuyệt
 *             example:
 *               rating: 2
 *               comment: xe đó rất tuyệt
 *     responses:
 *       200:
 *         description: Đánh giá đã được tạo  thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/reviews'
 *       500:
 *         description: Lỗi server 
 */
routeAPI.put('/updateCar/:car_id', authenticateToken, authorizeRole(['admin']), updateCars);
/**
 * @swagger
 * /updateCar/{car_id}:
 *   put:
 *     summary: Cập nhật thông tin xe theo ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: car_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của xe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/cars'
 *     responses:
 *       200:
 *         description: Xe đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cars'
 *       404:
 *         description: Không tìm thấy xe
 *       500:
 *         description: Lỗi server 
 */
routeAPI.put('/updateShoppingCart/:car_id', authenticateToken, authorizeRole(['admin', 'user']), updateCartItemQuantity);
/**
 * @swagger
 * /updateShoppingCart/{car_id}:
 *   put:
 *     summary: Cập nhật số lượng xe trong giỏ hàng
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: car_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của xe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/cart_items'
 *     responses:
 *       200:
 *         description: Số lượng xe đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cart_items'
 *       404:
 *         description: Không thể cập nhật số lượng xe trong giỏ hàng
 *       500:
 *         description: Lỗi server 
 */
routeAPI.put('/updateBrand/:brand_id', authenticateToken, authorizeRole(['admin']), updateBrand);
/**
 * @swagger
 * /updateBrand/{brand_id}:
 *   put:
 *     summary: Cập nhật thông tin nhà sản xuất theo ID
 *     tags: [Cars_brands]
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nhà sản xuất
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/car_brands'
 *     responses:
 *       200:
 *         description: Nhà sản xuất đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/car_brands'
 *       404:
 *         description: Không tìm thấy nhà sản xuất
 *       500:
 *         description: Lỗi server 
 */
routeAPI.put('/updateOrderStatus/:id', authenticateToken, authorizeRole(['admin', 'user']), updateOrderStatus);
/**
 * @swagger
 * /updateOrderStatus/{id}:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         schema:
 *           type: interger
 *         required: true
 *         description: ID của đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/orders'
 *     responses:
 *       200:
 *         description: Trạng thái đơn hàng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/orders'
 *       404:
 *         description: Không thể cập nhật trạng thái đơn hàng
 *       500:
 *         description: Lỗi server 
 */
routeAPI.put('/updateReview/:review_id', authenticateToken, authorizeRole(['admin', 'user']), updateReviews);
/**
 * @swagger
 * /updateReview/{review_id}:
 *   put:
 *     summary: Cập nhật đánh giá
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: review_id
 *         schema:
 *           type: interger
 *         required: true
 *         description: ID của đánh giá
  *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: Số sao đánh giá
 *                 example: 1,2,3,4,5
 *               comment:
 *                 type: text
 *                 description: đánh giá của mọi người
 *                 example: xe đó rất tuyệt
 *             example:
 *               rating: 2
 *               comment: xe đó rất tuyệt
 *     responses:
 *       200:
 *         description: đánh giá đã được chỉnh sữa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/reviews'
 *       404:
 *         description: Không thể chỉnh sữa đánh giá
 *       500:
 *         description: Lỗi server 
 */
routeAPI.patch('/updateUser/:id', authenticateToken, updateUser)
/**
 * @swagger
 * /updateUser/{id}:
 *   patch:
 *     summary: Cập nhật role User (role_id = "admin"/"user")
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: ID của user
 *     requestBody:  
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *     responses:
 *       200:
 *         description: User đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/user'
 *       404:
 *         description: Không tìm thấy User
 *       500:
 *         description: Lỗi server 
 */

routeAPI.delete('/deleteCar/:car_id', authenticateToken, authorizeRole(['admin']), deleteCars);
/**
 * @swagger
 * /deleteCar/{car_id}:
 *   delete:
 *     summary: Xóa xe theo ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: car_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của xe
 *     responses:
 *       200:
 *         description: Xe đã được xóa
 *       404:
 *         description: Không tìm thấy xe 
 */
routeAPI.delete('/deleteShoppingCart/:car_id', authenticateToken, authorizeRole(['admin', 'user']), deleteCarItems);
/**
 * @swagger
 * /deleteShoppingCart/{car_id}:
 *   delete:
 *     summary: Xóa xe khỏi giỏ hàng theo id
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: car_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của xe cần xóa khỏi giỏ hàng
 *     responses:
 *       200:
 *         description: Xe đã được xóa khỏi giỏ hàng
 *       404:
 *         description: Không thể xóa xe khỏi giỏ hàng
 */
routeAPI.delete('/deleteBrand/:brand_id', authenticateToken, authorizeRole(['admin']), deleteBrand);
/**
 * @swagger
 * /deleteBrand/{brand_id}:
 *   delete:
 *     summary: Xóa nhà sản xuất theo ID
 *     tags: [Cars_brands]
 *     parameters:
 *       - in: path
 *         name: brand_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nhà sản xuất
 *     responses:
 *       200:
 *         description: Nhà sản xuất đã được xóa
 *       404:
 *         description: Không tìm thấy nhà sản xuất 
 */
routeAPI.delete('/deleteOrder/:id', authenticateToken, authorizeRole(['admin', 'user']), deleteOrder);

/**
 * @swagger
 * /deleteOrder/{id}:
 *   delete:
 *     summary: Xóa xe khỏi danh sách đơn  hàng
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: order_id 
 *         schema:
 *           type: interger
 *         required: true
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Xe đã xóa khỏi danh sách đơn  hàng
 *       404:
 *         description: Không thể xóa xe khỏi danh sách đơn hàng
 */
routeAPI.delete('/deleteReview/:review_id', authenticateToken, authorizeRole(['admin', 'user']), deleteReviews);
/**
 * @swagger
 * /deleteReview/{id}:
 *   delete:
 *     summary: Xóa đánh giá
 *     tags: [Shopping]
 *     parameters:
 *       - in: path
 *         name: id 
 *         schema:
 *           type: interger
 *         required: true
 *         description: ID đánh giá
 *     responses:
 *       200:
 *         description: đánh giá đã xóa
 *       404:
 *         description: Không thể xóa đánh giá
 */
module.exports = routeAPI

