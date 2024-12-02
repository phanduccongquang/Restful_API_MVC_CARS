const connection = require('../models/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const { getDetailCars, getBrand,
    updateCarByID, updateBrandByID, deleteCarsByID,
    deleteBrandByID, addCar, addBrand, addUser, updateUserByID, getAllcar,
    getUser, getShopping, getCarByUserId, createCartForUser,
    addItemsToCart, updateCartItem, deleteItem } = require('../services/homeServices')
const redis = require('redis');


let client;
(async () => {
    client = redis.createClient({
        url: 'redis://default:vcFPM1p5KKj7zki4pLXhgsamkNx2dZeU@redis-15945.c12.us-east-1-4.ec2.redns.redis-cloud.com:15945'
    });

    client.on('error', (error) => console.log('Redis error: ' + error));

    try {
        await client.connect();
        console.log('Connected to Redis!');
    } catch (error) {
        console.log('Failed to connect to Redis:', error);
    }
})();

const cacheMiddleware = (duration) => {
    return async (req, res, next) => {
        const key = `${req.originalUrl}`;
        console.log('Checking cache for key:', key);

        try {
            const data = await client.get(key);
            console.log('check data', data);
            if (data != null) {
                console.log('Cache hit for key:', key);
                return res.json(JSON.parse(data));
            } else {
                console.log('Cache miss for key:', key);
                res.sendResponse = res.json;
                res.json = async (body) => {
                    try {
                        await client.set(key, JSON.stringify(body), {
                            EX: duration
                        });
                    } catch (err) {
                        console.error('Redis set error:', err);
                    }
                    res.sendResponse(body);
                };
                next();
            }
        } catch (err) {
            console.error('Redis get error:', err);
            next();
        }
    };
};


const signup = async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let phone = req.body.phone;
    let address = req.body.address;
    let repassword = req.body.repassword;

    if (password !== repassword) {
        return res.status(400).json({
            errorCode: 1,
            message: 'Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng nhập lại.'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role_id = 2;

        await addUser(email, name, phone, address, hashedPassword, role_id);
        res.status(201).json({
            errorCode: 0,
            message: 'Đăng ký thành công'
        });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({
            errorCode: 1,
            message: 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.'
        });
    }
};

const login = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    try {
        const [results] = await connection.query('SELECT * FROM user WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(401).json({
                errorCode: 1,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
            });
        }

        const user = results[0];
        console.log('check', user);

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                errorCode: 1,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
            });
        }

        const token = jwt.sign({ userId: user.id, role: user.role_id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false
        });

        res.status(200).json({
            errorCode: 0,
            message: 'Đăng nhập thành công',
            token: token

        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({
            errorCode: 1,
            message: 'Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.'
        });
    }
};
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['x-access-token'];
    if (!token) return res.status(403).json('No token provided.');

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.status(500).json('Failed to authenticate token.');
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    });
};
const getRoleDetails = async (id) => {
    try {
        const [results] = await connection.query('SELECT * FROM role WHERE id = ?', [id]);

        if (results.length === 0) {
            throw new Error('Role not found.');
        }
        return results[0];
    } catch (err) {
        console.error('Error fetching role details:', err);
        throw err;
    }
};
const authorizeRole = (roles) => {
    return async (req, res, next) => {
        try {
            const role = await getRoleDetails(req.userRole);

            if (!roles.includes(role.name)) {
                return res.status(403).json('Permission denied.');
            }

            next();
        } catch (err) {
            return res.status(500).json('Error fetching role details.');
        }
    };
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({
        errorCode: 0,
        message: 'Đăng xuất thành công'
    });
};


const showDetailCar = async (req, res) => {

    const carId = req.params.car_id;
    const { carDetails, reviews } = await getDetailCars(carId)
    res.status(200).json({
        errorCode: 0,
        listUser: carDetails,
        listReviews: reviews
    })
}
const showBrand = async (req, res) => {
    const data = await getBrand();
    res.status(200).json({
        errorCode: 0,
        data: data
    })

}

const updateCars = async (req, res) => {
    let car_id = req.body.car_id;
    let model = req.body.model;
    let brand_id = req.body.brand_id;
    let price = req.body.price;
    let year = req.body.year;
    let conditions = req.body.conditions;
    let type = req.body.type;
    try {
        let results = await updateCarByID(brand_id, model, year, price, conditions, type, car_id)
        await client.del('/v1/listCars');
        res.status(200).json({
            errorCode: 0,
            data: results
        });
    } catch (err) {
        res.status(500).json({
            errorCode: 1,
            message: "error when update"
        })
    }
}
const updateBrand = async (req, res) => {

    let brand_id = req.body.brand_id;
    let name = req.body.name;
    try {
        let results = await updateBrandByID(name, brand_id)

        await client.del('/v1/show');
        res.status(200).json({
            errorCode: 0,
            data: results
        });
    } catch (err) {
        console.error('Error updating manufacturer:', err);
        res.status(500).json({
            errorCode: 1,
            message: 'Có lỗi xảy ra khi cập nhật nhà sản xuất.'
        });
    }
}
const updateUser = async (req, res) => {
    let id = req.params.id
    let role_id = req.body.role_id;
    try {
        await updateUserByID(role_id, id)
        await client.del('/v1/listUser');
        res.status(200).json({
            errorCode: 0
        })
    } catch (error) {
        res.status(500).json({
            errorCode: 1,
            message: 'Có lỗi xảy ra khi cập nhật user.'
        });
    }

}
const deleteCars = async (req, res) => {
    let car_id = req.params.car_id;
    try {
        await deleteCarsByID(car_id)
        await client.del('/v1/listCars');
        res.status(200).json({
            errorCode: 0,
            message: 'delete successfully'
        })
    }
    catch (error) {
        res.status(500).json({
            errorCode: 1,
            message: "error when delete"
        })
    }
}
const deleteBrand = async (req, res) => {
    let brand_id = req.params.brand_id;
    try {
        await deleteBrandByID(brand_id)
        await client.del('/v1/show');
        res.status(200).json({
            errorCode: 0,
            message: 'delete successfully'
        })
    }
    catch (error) {
        res.status(500).json({
            errorCode: 1,
            message: "error when delete"
        })
    }

}

const createCar = async (req, res) => {
    let car_id = req.body.car_id;
    let model = req.body.model;
    let brand_id = req.body.brand_id;
    let price = req.body.price;
    let year = req.body.year;
    let conditions = req.body.conditions;
    let type = req.body.type;
    try {
        let results = await addCar(car_id, brand_id, model, year, price, conditions, type)

        await client.del('/v1/listCars');
        res.status(200).json({
            errorCode: 0,
            data: results
        })
    } catch (error) {
        console.error('Error create car:', error);
        res.status(500).json({
            errorCode: 1,
            message: "error when create"
        })

    }

}

const createBrands = async (req, res) => {
    let brand_id = req.body.brand_id;
    let name = req.body.name;
    try {
        let results = await addBrand(brand_id, name)
        await client.del('/v1/show');
        res.status(200).json({
            errorCode: 0,
            data: results
        })
    } catch (error) {
        console.error('Error create Maf:', error);
        res.status(500).json({
            errorCode: 1,
            message: "error when create"
        })
    }

}
const getAllcars = async (req, res) => {
    try {
        const [results] = await connection.query('SELECT * FROM cars');
        console.log('check result', results);
        res.status(200).json({
            errorCode: 0,
            data: results
        });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({
            errorCode: 1,
            message: 'An error occurred while retrieving data'
        });
    }
};


const getAlluser = async (req, res) => {

    const results = await getUser();
    // console.log("check user", results);
    res.status(200).json({
        errorCode: 0,
        data: results
    })
    console.log("check user", results);


}
const GetCar_Brand_Price = async (req, res) => {
    var { brands, price } = req.query;
    try {
        var cars = await getAllcar();
        let filterCars = cars;
        if (brands) {
            filterCars = filterCars.filter(car => car.brand_id === (brands));
        }
        if (price) {
            price = parseInt(price);
            filterCars = filterCars.filter(car => car.price <= (price));
        };
        res.status(200).json({
            errorCode: 0,
            data: filterCars
        })
    } catch (err) {
        res.status(500).json({ error: "get cars data is errorr" });
    }
}

const SearchCars = async (req, res) => {
    var { name } = req.query;
    try {
        var cars = await getAllcar();
        let filterCars = cars;
        if (name) {
            name = name.trim().toLowerCase();
            filterCars = filterCars.filter(car => car.model.trim().toLowerCase() === name);
        };
        res.status(200).json({
            errorCode: 0,
            data: filterCars
        });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }
}
const getShopping_cart = async (req, res) => {
    try {
        const userId = req.userId;
        const data = await getShopping(userId);
        res.status(200).json({
            errorCode: 0,
            cartItems: data[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Không thể lấy danh sách xe trong giỏ hàng' });
    }
}



const addItemsTopShoppingCart = async (req, res) => {
    const { car_id, quantity } = req.body;
    const user_id = req.userId
    try {
        let cart = await getCarByUserId(user_id)
        if (!cart) {
            cart = await createCartForUser(user_id)
        }
        await addItemsToCart(cart.cart_id, car_id, quantity)
        console.log("check result:", results);
        await client.del('/v1/cart');

        res.status(200).json({
            errorCode: 0,
        })
    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'không thể thêm sản phẩm vào giỏ hàng' })
        throw error.messages;

    }

}
const updateCartItemQuantity = async (req, res) => {
    const { car_id } = req.params
    const { quantity } = req.body
    const userId = req.userId

    try {
        await updateCartItem(quantity, car_id, userId);
        await client.del('/v1/cart');
        res.status(200).json({
            errorCode: 0,
        })

    } catch (error) {
        console.log("error updateCartItemQuantity", error);
        res.status(500).json({ error: 'Không thể cập nhật số lượng xe trong giỏ hàng' })
    }

}

const deleteCarItems = async (req, res) => {
    const { car_id } = req.params;
    const userId = req.userId;
    try {

        await deleteItem(car_id, userId);
        await client.del('/v1/cart');
        res.status(200).json({
            errorCode: 0,

            message: 'delete successfully'
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Không thể xóa xe khỏi giỏ hàng' });
    }
}
const createOrder = async (req, res) => {
    try {
        const [cartItems] = await connection.query(`SELECT car_id,quantity FROM cart_items 
            WHERE cart_id = (SELECT cart_id FROM shopping_cart WHERE user_id=?)`,
            [req.userId])

        if (!cartItems.length) {
            return res.status(400).json({ error: 'Giỏ hàng của bạn trống' });
        }
        const [orderResult] = await connection.query(`INSERT INTO orders (user_id,status)
                VALUES(?,'Đang chờ xử lý')`, [req.userId])

        const order_id = orderResult.insertId
        for (const items of cartItems) {
            await connection.query(`INSERT INTO order_items (order_id,car_id,quantity) VALUES
                (?,?,?)`, [order_id, items.car_id, items.quantity])
        }
        await connection.query(`DELETE FROM cart_items WHERE cart_id =(SELECT cart_id 
            FROM shopping_cart WHERE user_id=?)`, [req.userId])

        res.json({ message: 'Đơn hàng đã được tạo thành công', order_id })




    } catch (error) {
        console.log('check lỗi order', error);
        res.status(500).json({ error: 'Không thể tạo đơn hàng' })

    }
}
const deleteOrder = async (req, res) => {
    const order_id = req.params.id;

    try {
        await connection.query('DELETE FROM order_items WHERE order_id = ?', [order_id]);
        await connection.query('DELETE FROM orders WHERE order_id = ?', [order_id]);
        await client.del('/v1/getOrders');
        res.status(200).json({
            errorCode: 0,
            message: 'delete successfully'
        })
    } catch (error) {
        res.status(500).send('Lỗi khi xóa đơn hàng.');
    }
};
const getUserOrders = async (req, res) => {
    try {
        const [order] = await connection.query(`SELECT * FROM orders WHERE 
            user_id=?`, [req.userId])
        res.status(200).json({
            errorCode: 0,
            data: order
        })

    } catch (error) {
        res.status(500).json({ error: 'Không thể lấy danh sách đơn hàng.' });

    }
}
const getOrderById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const [orderDetail] = await connection.query(`
            SELECT * FROM orders 
            WHERE order_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (!orderDetail.length) {
            return res.status(400).json({ error: 'Không tìm thấy đơn hàng' });
        }

        const [orderItems] = await connection.query(`
            SELECT cars.type, cars.model, cars.conditions, cars.price, order_items.quantity 
            FROM order_items 
            JOIN cars ON order_items.car_id = cars.car_id
            WHERE order_items.order_id = ?`,
            [id]
        );

        if (!orderItems.length) {
            return res.status(400).json({ error: 'Không tìm thấy mặt hàng trong đơn hàng' });
        }

        res.status(200).json({
            errorCode: 0,
            order: orderDetail[0],
            orderItems: orderItems
        })


    } catch (error) {
        res.status(500).json({ error: 'Không thể lấy thông tin đơn hàng' });
    }
}
const updateOrderStatus = async (req, res) => {
    const { id } = req.params
    const { status } = req.body
    const userId = req.userId;
    try {
        await connection.query(`UPDATE orders SET status =? WHERE order_id =?AND user_id=?`
            , [status, id, userId])
        res.status(200).json({
            errorCode: 0,
            message: ' đã cập nhật trạng thái xử lý thành công'
        });
    } catch (error) {
        res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng' })
    }
}
const createPayment = async (req, res) => {
    const order_id = req.params.id


    try {
        const [orderStatus] = await connection.query(`
            SELECT status FROM orders WHERE order_id = ?`,
            [order_id]
        );

        if (orderStatus[0].status === 'Đã thanh toán') {
            return res.status(400).json({ error: "Đơn hàng đã được thanh toán trước đó" });
        }
        const [orderItems] = await connection.query(`
            SELECT cars.type, cars.model, cars.conditions, cars.price, order_items.quantity 
            FROM order_items 
            JOIN cars ON order_items.car_id = cars.car_id
            WHERE order_items.order_id = ?`,
            [order_id]
        );
        let amount = 0;
        orderItems.forEach(item => {
            amount += item.price * item.quantity;
        });
        await connection.query(`
            
            INSERT INTO payments(order_id,amount,payment_date) VALUES(?,?,NOW())`,
            [order_id, amount]);
        await connection.query(`UPDATE orders SET status = 'Đã thanh toán' WHERE 
            order_id = ?`, [order_id]);
        res.json({ message: ' Thannh toán thành công' })

    } catch (error) {

        console.error(error.message);

        console.error(error);
        res.status(500).json({ error: "Không thể  xử lý thanh toán" })
    }

}

const addReviews = async (req, res) => {
    const { car_id } = req.params;
    const { rating, comment } = req.body;
    try {
        await connection.query(`INSERT INTO reviews (car_id,user_id,rating,comment,created_at) VALUES
            (?,?,?,?,NOW())`, [car_id, req.userId, rating, comment]);
        res.json({ message: 'đánh giá của bạn đã được thêm' });

    } catch (eror) {
        res.status(500).json({ error: 'Không thể thêm đánh giá' });
    }
}

const updateReviews = async (req, res) => {
    const { review_id } = req.params;
    const { rating, comment } = req.body;
    try {
        const [updateResult] = await connection.query('UPDATE reviews SET  rating =?,comment=? WHERE  review_id=?',
            [rating, comment, review_id]


        );
        res.status(200).json({
            errorCode: 0,
            message: 'cập nhật đánh giá thành công'
        })


    }
    catch (error) {
        res.status(500).json({ error: 'Không thể sữa đánh giá' });
    }

}
const deleteReviews = async (req, res) => {
    const { review_id } = req.params;
    try {
        await connection.query(`DELETE  FROM reviews WHERE review_id =?`, review_id);
        res.json({ message: " đánh giá đã được xóa thành công" });
    } catch (eror) {
        res.status(500).json({ error: 'không thể xóa đánh giá' });
    }
}

module.exports = {
    getAllcars, showDetailCar, createCar, updateCars, deleteCars, showBrand
    , createBrands, updateBrand, deleteBrand, authenticateToken
    , GetCar_Brand_Price, getAllcar, SearchCars, login,
    signup, logout, authorizeRole, getAlluser, updateUser,
    cacheMiddleware, getShopping_cart, addItemsTopShoppingCart, updateCartItemQuantity,
    deleteCarItems, createOrder, deleteOrder, getUserOrders,
    getOrderById, updateOrderStatus, createPayment, addReviews,
    updateReviews, deleteReviews,
}