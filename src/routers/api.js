const express = require('express')
const { getAllcars, showDetailCar,
    createCar, updateCars,
    deleteCars, showMaf, create_maf, updateMaf,
    deleteMaf, GetCarWithMafAndPrice, SearchCars, login,
    logout, signup, authenticateToken, authorizeRole, updateUser, cacheMiddleware } = require('../controllers/homeControllerAPI')

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
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - model
 *         - specifications
 *         - price
 *         - manufacturer_id
 *       properties:
 *         car_id:
 *           type: string
 *           description: ID tự động sinh của xe
 *         model:
 *           type: string
 *           description: Mẫu xe
 *         specifications:
 *           type: string
 *           description: Thông số kỹ thuật của xe
 *         price:
 *           type: number
 *           description: Giá của xe
 *         manufacturer_id:
 *           type: string
 *           description: ID của nhà sản xuất
 *       example:
 *         car_id: 1
 *         model: Toyota Camry
 *         specifications: Full option
 *         price: 30000
 *         manufacturer_id: 1
 * 
 *     Maf:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         manufacturer_id:
 *           type: string
 *           description: ID tự động sinh của nhà sản xuất
 *         name:
 *           type: string
 *           description: Tên nhà sản xuất
 *       example:
 *         manufacturer_id: 1
 *         name: Toyota
 * 
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role_id
 *       properties:
 *         id:
 *           type: number
 *           description: ID tự động sinh của user
 *         email:
 *           type: string
 *           description: email người dùng
 *         password:
 *           type: string
 *           description: mật khẩu đăng nhập
 *         role_id:
 *           type: number
 *           description: quyền user
 *       example:
 *         email: lanh@gmail.com
 *         password: "123"
 *         repassword: "123"
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Tài khoản user
 *   - name: Cars
 *     description: API quản lý xe
 *   - name: Mafs
 *     description: API quản lý nhà sản xuất
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
 *                 $ref: '#/components/schemas/Car'
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
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Không tìm thấy xe
 * 
 */
routeAPI.get('/show', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), showMaf);
/**
 * @swagger
 * /show:
 *   get:
 *     summary: Lấy danh sách tất cả các nhà sản xuất
 *     tags: [Mafs]
 *     responses:
 *       200:
 *         description: Danh sách nhà sản xuất
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Maf' 
 */
routeAPI.get('/showCar/Maf_price', authenticateToken, authorizeRole(['admin', 'user']), cacheMiddleware(3600), GetCarWithMafAndPrice);
/**
 * @swagger
 * /showCar/Maf_price:
 *   get:
 *     summary: Lấy thông tin nhà sản xuất theo ID
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: manufacturer
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
 *               $ref: '#/components/schemas/Car'
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
 *         name: name
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
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Không tìm thấy nhà sản xuất 
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Account đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Đã đăng nhập
 *         content:
 *           application/json:
 *             schema:
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
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Xe đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       500:
 *         description: Lỗi server
 */
routeAPI.post('/createMaf', authenticateToken, authorizeRole(['admin']), create_maf);
/**
 * @swagger
 * /createMaf:
 *   post:
 *     summary: Tạo một nhà sản xuất mới
 *     tags: [Mafs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Maf'
 *     responses:
 *       200:
 *         description: Nhà sản xuất đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maf'
 *       500:
 *         description: Lỗi server 
 */
routeAPI.put('/update/:car_id', authenticateToken, authorizeRole(['admin']), updateCars);
/**
 * @swagger
 * /update/{car_id}:
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
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Xe đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Car'
 *       404:
 *         description: Không tìm thấy xe
 *       500:
 *         description: Lỗi server 
 */
routeAPI.put('/updateMaf/:manufacturer_id', authenticateToken, authorizeRole(['admin']), updateMaf);
/**
 * @swagger
 * /updateMaf/{manufacturer_id}:
 *   put:
 *     summary: Cập nhật thông tin nhà sản xuất theo ID
 *     tags: [Mafs]
 *     parameters:
 *       - in: path
 *         name: manufacturer_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nhà sản xuất
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Maf'
 *     responses:
 *       200:
 *         description: Nhà sản xuất đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maf'
 *       404:
 *         description: Không tìm thấy nhà sản xuất
 *       500:
 *         description: Lỗi server 
 */
routeAPI.patch('/updateUser/:id', authenticateToken, updateUser)
/**
 * @swagger
 * /updateUser/{id}:
 *   patch:
 *     summary: Cập nhật role User
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Không tìm thấy User
 *       500:
 *         description: Lỗi server 
 */

routeAPI.delete('/delete/:car_id', authenticateToken, authorizeRole(['admin']), deleteCars);
/**
 * @swagger
 * /delete/{car_id}:
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
routeAPI.delete('/deleteMaf/:Maf_id', authenticateToken, authorizeRole(['admin']), deleteMaf);
/**
 * @swagger
 * /deleteMaf/{Maf_id}:
 *   delete:
 *     summary: Xóa nhà sản xuất theo ID
 *     tags: [Mafs]
 *     parameters:
 *       - in: path
 *         name: manufacturer_id
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




module.exports = routeAPI

