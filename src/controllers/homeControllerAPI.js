const connection = require('../models/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getDetailCars, getMaf,
    updateCarByID, updateMafByID, deleteCarsByID,
    deleteMafByID, addCar, addMaf, addUser } = require('../services/homeServices')


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
        await addUser(email, hashedPassword);
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

        const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });

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
    if (!token) return res.status(403).send('No token provided.');

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) return res.status(500).send('Failed to authenticate token.');
        req.userId = decoded.userId;
        next();
    });
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

    let results = await updateCarByID(model, specifications, price, manufacturer_id, car_id)
    res.status(200).json({
        errorCode: 0,
        data: results
    })
}
const updateMaf = async (req, res) => {

    let manufacturer_id = req.body.manufacturer_id;
    let name = req.body.name;
    let results = await updateMafByID(name, manufacturer_id)
    res.status(200).json({
        errorCode: 0,
        data: results
    })
}
const deleteCars = async (req, res) => {
    let car_id = req.params.car_id;
    await deleteCarsByID(car_id)
    res.status(200).json({
        errorCode: 0,
        message: 'delete successfully'
    })
}
const deleteMaf = async (req, res) => {
    let Maf_id = req.params.Maf_id;
    await deleteMafByID(Maf_id)
    res.status(200).json({
        errorCode: 0,
        message: 'delete successfully'
    })

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
    let results = await connection.query('select * from cars');
    res.status(200).json({
        errorCode: 0,
        data: results
    })
}
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
            filterCars = filterCars.filter(car => car.model === (name));
        };
        res.status(200).json({
            errorCode: 0,
            data: filterCars
        })
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }
}

module.exports = {
    getAllcars, showDetailCar, createCar, updateCars, deleteCars, showMaf
    , create_maf, updateMaf, deleteMaf, authenticateToken
    , GetCarWithMafAndPrice, getAllcar, SearchCars, login, signup, logout
}