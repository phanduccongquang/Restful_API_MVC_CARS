const connection = require('../models/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getDetailCars, getMaf, getCarID, getMafID,
    updateCarByID, updateMafByID, deleteCarsByID, deleteMafByID,
    addCar, addMaf, addUser, getUserID, updateUserByID } = require('../services/homeServices')


const showDetailCar = async (req, res) => {

    const carId = req.params.car_id;
    const data = await getDetailCars(carId)
    res.json({ data: data })
}
const showMaf = async (req, res) => {
    const data = await getMaf();
    res.render('showMaf.ejs', { listUser: data });
}
const getCarById = async (req, res) => {
    const carId = req.params.car_id;
    const data = await getCarID(carId)
    res.render('update.ejs', { useEdit: data })
}
const getMafById = async (req, res) => {
    const MafId = req.params.manufacturer_id;
    const data = await getMafID(MafId)
    res.render('updateMaf.ejs', { useEdit: data });

}
const getUserById = async (req, res) => {
    const UserId = req.params.id;
    const data = await getUserID(UserId)
    res.render('updateUser.ejs', { useEdit: data });

}
const updateCars = async (req, res) => {
    let car_id = req.body.car_id;
    let model = req.body.model;
    let specifications = req.body.specifications;
    let price = req.body.price;
    let manufacturer_id = req.body.manufacturer_id;

    await updateCarByID(model, specifications, price, manufacturer_id, car_id)
    res.redirect('/listCars');
}
const updateMaf = async (req, res) => {

    let manufacturer_id = req.body.manufacturer_id;
    let name = req.body.name;
    await updateMafByID(name, manufacturer_id)
    res.redirect('/show');
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
    res.redirect('/listCars');
}
const deleteMaf = async (req, res) => {
    let Maf_id = req.params.Maf_id;
    await deleteMafByID(Maf_id)
    res.redirect('/show');

}

const createCar = async (req, res) => {
    let car_id = req.body.car_id;
    let model = req.body.model;
    let specifications = req.body.specifications;
    let price = req.body.price;
    let manufacturer_id = req.body.manufacturer_id;

    await addCar(car_id, model, specifications, price, manufacturer_id)
    res.redirect('/listCars');

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
    let email = req.body.email;
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
        await addUser(email, hashedPassword, role_id);
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
        console.log('check', user);

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

        console.log("ddang nhap thanh cong");
        let [data] = await connection.query('select * from cars');

        res.render('home.ejs', { listUser: data });
    } catch (err) {
        console.error('Error logging in:', err);
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
            console.log('check', roles, role.name);

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

const create = (req, res) => {
    res.render('create.ejs')
}
const createMaf = (req, res) => {
    res.render('createMaf.ejs')
}
const create_maf = async (req, res) => {
    let manufacturer_id = req.body.manufacturer_id;
    let name = req.body.name;

    await addMaf(manufacturer_id, name)

    res.redirect('/show');

}
const getAllcars = async (req, res) => {
    let [results, fields] = await connection.query('select * from cars');

    res.render('home.ejs', { listUser: results });
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
    res.render('user.ejs', { listUser: results })

}

const GetCarWithMafAndPrice = async (req, res) => {
    var { manufacturer, price } = req.query;
    try {
        var cars = await getAllcar();
        console.log('check cars', cars);
        let filterCars = cars;
        if (manufacturer) {
            filterCars = filterCars.filter(car => car.manufacturer_id === (manufacturer));
        }
        if (price) {
            filterCars = filterCars.filter(car => car.price <= (price));
        };
        res.render('ShowMafAndPrice.ejs', { listUser: filterCars });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }
}

const SearchCars = async (req, res) => {
    var { name } = req.query;
    try {
        var cars = await getAllcar();
        console.log('check cars', cars);
        let filterCars = cars;
        if (name) {
            filterCars = filterCars.filter(car => car.model === (name));
        }
        res.render('ShowMafAndPrice.ejs', { listUser: filterCars });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }


}


module.exports = {
    getAllcars, showDetailCar, createCar, create,
    getCarById, updateCars, deleteCars, showMaf
    , createMaf, create_maf, getMafById, updateMaf, deleteMaf
    , GetCarWithMafAndPrice, getAllcar, SearchCars, signup,
    login, header, getlogin, getsignup, logout, authenticateToken,
    authorizeRole, getRoleDetails, getAlluser, getUserById, updateUser
}