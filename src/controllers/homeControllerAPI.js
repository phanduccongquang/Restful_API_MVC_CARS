const connection = require('../models/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getDetailCars, getMaf,
    updateCarByID, updateMafByID, deleteCarsByID,
    deleteMafByID, addCar, addMaf, addUser, updateUserByID } = require('../services/homeServices')
const redis = require('redis');

let client;
(async () => {
    client = redis.createClient({
        host: '127.0.0.1',
        port: 6379,
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
    let email = req.body.email;
    let password = req.body.password;
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

        await addUser(email, hashedPassword, role_id);
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
    const data = await getDetailCars(carId)
    res.status(200).json({
        errorCode: 0,
        data: data
    })
}
const showMaf = async (req, res) => {
    const data = await getMaf();
    res.status(200).json({
        errorCode: 0,
        data: data
    })

}

const updateCars = async (req, res) => {
    let car_id = req.body.car_id;
    let model = req.body.model;
    let specifications = req.body.specifications;
    let price = req.body.price;
    let manufacturer_id = req.body.manufacturer_id;
    try {
        let results = await updateCarByID(model, specifications, price, manufacturer_id, car_id)
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
const updateMaf = async (req, res) => {

    let manufacturer_id = req.body.manufacturer_id;
    let name = req.body.name;
    try {
        let results = await updateMafByID(name, manufacturer_id);
        // Xóa cache liên quan đến nhà sản xuất
        await client.del('/v1/show'); // Hoặc key cụ thể nếu có
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
    let results = await updateUserByID(role_id, id)
    res.status(200).json({
        errorCode: 0,
        data: results
    })

}
const deleteCars = async (req, res) => {
    let car_id = req.params.car_id;
    try {
        await deleteCarsByID(car_id)
        const result = await client.del('/v1/listCars');

        if (result === 1) {
            console.log('Cache cleared successfully');
        } else {
            console.log('Cache key not found');
        }
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
const deleteMaf = async (req, res) => {
    let Maf_id = req.params.Maf_id;
    try {
        await deleteMafByID(Maf_id)
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
    let specifications = req.body.specifications;
    let price = req.body.price;
    let manufacturer_id = req.body.manufacturer_id;

    let results = await addCar(car_id, model, specifications, price, manufacturer_id)
    res.status(200).json({
        errorCode: 0,
        data: results
    })

}

const create_maf = async (req, res) => {
    let manufacturer_id = req.body.manufacturer_id;
    let name = req.body.name;

    let results = await addMaf(manufacturer_id, name)

    res.status(200).json({
        errorCode: 0,
        data: results
    })

}
const getAllcars = async (req, res) => {
    try {
        // Thực hiện truy vấn
        const [results] = await connection.query('SELECT * FROM cars');

        // Xử lý và trả kết quả
        console.log('check result', results);
        res.status(200).json({
            errorCode: 0,
            data: results // Dữ liệu đã được lấy từ bảng cars
        });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({
            errorCode: 1,
            message: 'An error occurred while retrieving data'
        });
    }
};

const getAllcar = async () => {
    let [results, fields] = await connection.query(`
    SELECT 
        cars.car_id,
        cars.model,
        cars.specifications,
        cars.price,
        manufacturers.manufacturer_id,
        manufacturers.name AS name
    FROM 
        cars
    JOIN 
        manufacturers
    ON 
        cars.manufacturer_id = manufacturers.manufacturer_id  `);
    return results;

}
const getAlluser = async (req, res) => {

    let [results, fields] = await connection.query(`
        SELECT 
            user.id AS user_id,
            user.email,
            user.password,
            user.role_id,
            role.id AS role_id,
            role.name AS role_name
        FROM 
            user
        JOIN 
            role
        ON 
            user.role_id = role.id  `);
    res.status(200).json({
        errorCode: 0,
        data: results
    })

}
const GetCarWithMafAndPrice = async (req, res) => {
    var { manufacturer, price } = req.query;
    try {
        var cars = await getAllcar();
        let filterCars = cars;
        if (manufacturer) {
            filterCars = filterCars.filter(car => car.manufacturer_id === (manufacturer));
        }
        if (price) {
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

module.exports = {
    getAllcars, showDetailCar, createCar, updateCars, deleteCars, showMaf
    , create_maf, updateMaf, deleteMaf, authenticateToken
    , GetCarWithMafAndPrice, getAllcar, SearchCars, login,
    signup, logout, authorizeRole, getAlluser, updateUser, cacheMiddleware, cacheMiddleware
}