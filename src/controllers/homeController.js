const connection = require('../models/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getDetailCars, getBrand, getCarID, getBrandID,
    updateCarByID, updateBrandByID, deleteCarsByID, deleteBrandByID,
    addCar, addBrand, addUser, getUserID, updateUserByID,
    getAllcar, getUser, getShopping, getCarByUserId,
    createCartForUser, addItemsToCart, updateCartItem, getUpdateQuantity,
    deleteItem } = require('../services/homeServices')


const showDetailCar = async (req, res) => {

    const carId = req.params.car_id;
    const { carDetails, reviews } = await getDetailCars(carId)
    res.render('show_car.ejs', { listUser: carDetails, listReviews: reviews });
}

const showBrand = async (req, res) => {
    const data = await getBrand();
    res.render('show_brands.ejs', { listUser: data });
}
const getCarById = async (req, res) => {
    const carId = req.params.car_id;
    const data = await getCarID(carId)
    res.render('update_car.ejs', { useEdit: data })
}
const getBrandById = async (req, res) => {
    const BrandId = req.params.brand_id;
    const data = await getBrandID(BrandId)
    res.render('update_brands.ejs', { useEdit: data });

}
const getUserById = async (req, res) => {
    const UserId = req.params.id;
    const data = await getUserID(UserId)
    res.render('updateUser.ejs', { useEdit: data });

}
const updateCars = async (req, res) => {
    let car_id = req.body.car_id;
    let model = req.body.model;
    let brand_id = req.body.brand_id;
    let price = req.body.price;
    let year = req.body.year;
    let conditions = req.body.conditions;
    let type = req.body.type;

    await updateCarByID(brand_id, model, year, price, conditions, type, car_id)
    res.redirect('/cars');
}
const updateBrand = async (req, res) => {

    let brand_id = req.body.brand_id;
    let name = req.body.name;
    await updateBrandByID(name, brand_id)
    res.redirect('/brands');
}
const updateUser = async (req, res) => {
    let id = req.params.id
    let role_id = req.body.role_id;
    await updateUserByID(role_id, id)
    res.redirect('/user')

}
const deleteCars = async (req, res) => {
    let car_id = req.params.car_id;
    await deleteCarsByID(car_id)
    res.redirect('/cars');
}
const deleteBrand = async (req, res) => {
    let brand_id = req.params.brand_id;
    await deleteBrandByID(brand_id)
    res.redirect('/brands');

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
        await addCar(car_id, brand_id, model, year, price, conditions, type)
        console.log("add thanh cong");
        res.redirect('/cars');
    } catch (error) {
        console.log("loi add", error.message);
    }
}
const header = (req, res) => {
    res.render('header.ejs')
}
const getsignup = (req, res) => {
    res.render('register', {
        messages: {}
    });
}
const signup = async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let address = req.body.address;
    let password = req.body.password;
    let repassword = req.body.repassword;

    if (password !== repassword) {
        return res.render('register', {
            messages: { danger: 'Mật khẩu và xác nhận mật khẩu không khớp. Vui lòng nhập lại.' }
        });
    }


    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role_id = 2;
        await addUser(email, name, phone, address, hashedPassword, role_id);
        res.redirect('/login');
    } catch (err) {
        console.error('Error adding user:', err);
        res.render('register', {
            messages: { danger: 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.' }
        });
    }

}
const getlogin = (req, res) => {
    res.render('login', {
        messages: {}
    });
}
const login = async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    try {
        const [results] = await connection.query('SELECT * FROM user WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.render('login', {
                messages: { danger: 'Tên đăng nhập hoặc mật khẩu không chính xác' }
            });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login', {
                messages: { danger: 'Tên đăng nhập hoặc mật khẩu không chính xác' }
            });
        }

        const token = jwt.sign({ userId: user.id, role: user.role_id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false
        });
        let [data] = await connection.query('select * from cars');
        res.render('home.ejs', { listUser: data });
    } catch (err) {
        res.render('login', {
            messages: { danger: 'Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.' }
        });
    }

};
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['x-access-token'];
    if (!token) return res.status(403).send('No token provided.');
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.');
        req.userId = decoded.userId;
        req.userRole = decoded.role;

        next();
    });
};
const getRoleDetails = async (roleId) => {
    try {
        const [results] = await connection.query('SELECT * FROM role WHERE id = ?', [roleId]);

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
                return res.status(403).send('Permission denied.');
            }

            next();
        } catch (err) {
            return res.status(500).send('Error fetching role details.');
        }
    };
};
const logout = (req, res) => {
    res.clearCookie('token')
    res.redirect('/login')
}

const create_car = (req, res) => {
    res.render('create_car.ejs')
}
const create_brands = (req, res) => {
    res.render('create_brands.ejs')
}
const createBrands = async (req, res) => {
    let brand_id = req.body.brand_id;
    let name = req.body.name;

    await addBrand(brand_id, name)

    res.redirect('/brands');

}
const getAllcars = async (req, res) => {
    let [results, fields] = await connection.query('select * from cars');

    res.render('home.ejs', { listUser: results });
}

const getAlluser = async (req, res) => {

    const results = await getUser();
    res.render('user.ejs', { listUser: results })

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
        res.render('Show_Brand_Price.ejs', { listUser: filterCars });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }
}

const SearchCars_name = async (req, res) => {
    var { name } = req.query;
    try {
        var cars = await getAllcar();
        let filterCars = cars;
        if (name) {
            filterCars = filterCars.filter(car => car.type === (name));
        }
        res.render('Show_Brand_Price.ejs', { listUser: filterCars });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }


}
const SearchCars_Brand = async (req, res) => {
    var { brands } = req.query;
    try {
        var cars = await getAllcar();
        let filterCars = cars;
        if (brands) {
            filterCars = filterCars.filter(car => car.brand_id === (brands));
        }
        console.log("check brand", filterCars);
        res.render('Show_Brand_Price.ejs', { listUser: filterCars });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }


}
const getShopping_cart = async (req, res) => {
    try {
        const userId = req.userId;
        const data = await getShopping(userId);

        res.render('shopping_cart.ejs', { cartItems: data });
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
        console.log('check cart', cart);
        if (!cart) {
            cart = await createCartForUser(user_id)
        }
        await addItemsToCart(cart.cart_id, car_id, quantity)
        res.redirect('/cart')
    } catch (error) {
        console.error(error);

        res.status(500).json({ error: 'không thể thêm sản phẩm vào giỏ hàng' })

    }

}
const updateCartItemQuantity = async (req, res) => {
    const { car_id } = req.params
    const { quantity } = req.body
    const userId = req.userId

    try {
        await updateCartItem(quantity, car_id, userId);
        res.redirect('/cart')

    } catch (error) {
        console.log("error updateCartItemQuantity", error);
        res.status(500).json({ error: 'Không thể cập nhật số lượng xe trong giỏ hàng' })
    }

}
const getUpdateQuantityCars = async (req, res) => {
    const { car_id } = req.params;
    const user_id = req.userId;

    try {
        const item = await getUpdateQuantity(car_id, user_id);

        if (!item || item.length === 0) {
            return res.status(404).send('Không tìm thấy xe trong giỏ hàng');
        }

        res.render('update_shopping_car.ejs', {
            car_id: item[0].car_id,
            quantity: item[0].quantity
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi lấy thông tin xe từ giỏ hàng' });
    }
}
const deleteCarItems = async (req, res) => {
    const { car_id } = req.params;
    const userId = req.userId;
    try {

        await deleteItem(car_id, userId);
        res.redirect('/cart');
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
        res.redirect('/getOrders');
    } catch (error) {
        console.error('Lỗi khi xóa đơn hàng:', error);
        res.status(500).send('Lỗi khi xóa đơn hàng.');
    }
};
const getUserOrders = async (req, res) => {
    try {
        const [order] = await connection.query(`SELECT * FROM orders WHERE 
            user_id=?`, [req.userId])
        res.render('order.ejs', { orders: order })

    } catch (error) {
        console.error(error);
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

        console.log('check orderItems', orderItems);
        if (!orderItems.length) {
            return res.status(400).json({ error: 'Không tìm thấy mặt hàng trong đơn hàng' });
        }

        res.render('orderDetail.ejs', {
            order: orderDetail[0],
            orderItems: orderItems
        });

    } catch (error) {
        console.log(error);
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
        res.redirect(`/orderDetails/${id}`);
    } catch (error) {
        console.log('check update status', error);
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

        console.log("check status", orderStatus[0]);
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
        console.log(`Order ID: ${order_id}`);
        console.log(`Calculated Amount: ${amount}`);
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
const getAddReviews = async (req, res) => {
    const { car_id } = req.params;

    const reviews = [];

    res.render('reviews', { car_id: car_id, reviews: reviews });
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
const getUpdateReview = async (req, res) => {
    const { review_id } = req.params;
    try {
        const [reviewDetails] = await connection.query('SELECT * FROM reviews WHERE review_id = ?', [review_id]);

        if (reviewDetails.length === 0) {
            return res.status(404).json({ error: 'Review không tồn tại' });
        }

        const review = reviewDetails[0];
        res.render('updateReviews', {
            review_id: review.review_id,
            rating: review.rating,
            comment: review.comment
        });
    } catch (error) {
        console.error('Lỗi khi truy vấn chi tiết đánh giá:', error);
        res.status(500).json({ error: 'Lỗi hệ thống' });
    }
};
const updateReviews = async (req, res) => {
    const { review_id } = req.params;
    const { rating, comment } = req.body;
    try {
        const [updateResult] = await connection.query('UPDATE reviews SET  rating =?,comment=? WHERE  review_id=?',
            [rating, comment, review_id]

        );
        if (updateResult.affectedRows > 0) {
            const [carResult] = await connection.query(
                'SELECT car_id FROM reviews WHERE review_id = ?',
                [review_id]
            );

            if (carResult.length > 0) {
                const car_id = carResult[0].car_id;
                res.redirect(`/show/${car_id}`);
            }
        }

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
    getAllcars, showDetailCar, createCar, create_car,
    getCarById, updateCars, deleteCars, showBrand
    , createBrands, create_brands, getBrandById, updateBrand, deleteBrand
    , GetCar_Brand_Price, getAllcar, SearchCars_name, signup,
    login, header, getlogin, getsignup, logout, authenticateToken,
    authorizeRole, getRoleDetails, getAlluser, getUserById, updateUser,
    SearchCars_Brand, getShopping_cart, getCarByUserId, createCartForUser,
    addItemsTopShoppingCart, updateCartItemQuantity, getUpdateQuantityCars,
    deleteCarItems, createOrder, getUserOrders,
    getOrderById, updateOrderStatus, createPayment,
    deleteOrder, getAddReviews, addReviews, updateReviews, getUpdateReview, deleteReviews
}