const connection = require('../models/database')


const getDetailCars = async (carId) => {
    if (!carId) {
        return res.status(400).json({ error: 'Missing car_id in request parameters' });
    }

    try {
        const [carDetails] = await connection.query(`
            SELECT 
                cars.car_id,
                cars.brand_id,
                cars.model,
                cars.year,
                cars.price,
                cars.conditions,
                cars.type,
                car_brands.brand_id,
                car_brands.name AS brand_name
            FROM 
                cars
            JOIN 
                car_brands
            ON 
                cars.brand_id = car_brands.brand_id  
            WHERE 
                cars.car_id = ?
        `, [carId]);

        if (carDetails.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const [reviews] = await connection.query(`
            SELECT *FROM reviews WHERE car_id=?`, [carId]);

        return { carDetails, reviews };
    } catch (error) {
        console.error('Error fetching car details or reviews:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getBrand = async () => {
    let [results, fields] = await connection.query(`
    SELECT * FROM car_brands;
             `
    );
    return results
}
const getCarID = async (carId) => {
    let [results, fields] = await connection.query('select * from cars where car_id = ?', [carId]);

    let user = results && results.length > 0 ? results[0] : {};
    return user
}
const getUserID = async (id) => {
    let [results] = await connection.query('select * from user where id = ?', [id])
    let user = results && results.length > 0 ? results[0] : {};
    return user
}
const getBrandID = async (MafId) => {
    let [results, fields] = await connection.query('select * from car_brands where brand_id = ?', [MafId]);

    let user = results && results.length > 0 ? results[0] : {};
    return user
}
const updateCarByID = async (brand_id, model, year, price, conditions, type, car_id) => {

    let [results] = await connection.query(`UPDATE cars SET 
     brand_id = ?,model=?,
    year=?,price=?,conditions=?,type=? WHERE car_id = ?`,
        [brand_id, model, year, price, conditions, type, car_id]
    );
}
const updateBrandByID = async (name, brand_id) => {
    let [results] = await connection.query(`UPDATE car_brands SET 
    name=? WHERE brand_id = ?`,
        [name, brand_id]
    );
}
const updateUserByID = async (role_id, id) => {
    await connection.query(`UPDATE user SET 
        role_id=? WHERE id = ?`,
        [role_id, id]
    );

}

const deleteCarsByID = async (car_id) => {
    await connection.query(`DELETE FROM cars WHERE car_id=?`,
        [car_id]
    );
}
const deleteBrandByID = async (brand_id) => {
    let [results] = await connection.query(`DELETE FROM car_brands WHERE brand_id=?`,
        [brand_id]
    );
}
const addCar = async (car_id, brand_id, model, year, price, conditions, type) => {
    const [results] = await connection.query(
        `INSERT INTO cars (car_id, brand_id, model,year, price ,conditions, type)VALUES (?,?,? ,?, ?,?,?)`
        , [car_id, brand_id, model, year, price, conditions, type]
    );
}
const addUser = async (email, name, phone, address, password, role_id) => {
    const [results] = await connection.query(
        `INSERT INTO user (name, email, password, phone, address, role_id)VALUES ( ?,?,?,?,?,?)`
        , [name, email, password, phone, address, role_id]
    );

}
const addBrand = async (brand_id, name) => {
    const [results] = await connection.query(
        `INSERT INTO car_brands (brand_id,name)VALUES (?, ?)`
        , [brand_id, name]
    );
}
const getAllcar = async () => {
    let [results, fields] = await connection.query(`
    SELECT 
        cars.car_id,
        cars.brand_id,
        cars.model,
        cars.year,
        cars.price,
        cars.conditions,
        cars.type,
        car_brands.brand_id,
        car_brands.name AS name
    FROM 
        cars
    JOIN 
        car_brands
    ON 
        cars.brand_id = car_brands.brand_id  `);
    return results;
}
const getUser = async () => {
    let [results] = await connection.query(`
        SELECT 
            user.id AS user_id,
            user.name,
            user.email,
            user.password,
            user.phone,
            user.address,
            role.id AS role_id,
            role.name AS role_name
        FROM 
            user
        JOIN 
            role
        ON 
            user.role_id = role.id  `);
    return results;

}
const getShopping = async (userId) => {
    const [data] = await connection.query(`SELECT cars.car_id, cars.type, cars.price,
        cars.model, cars.conditions, cart_items.quantity 
        FROM cart_items 
        JOIN cars ON cart_items.car_id = cars.car_id 
        WHERE cart_items.cart_id = ?`,
        [userId]);

    return data;
}
const getCarByUserId = async (user_id) => {
    try {
        const [cart] = await connection.query('SELECT * FROM shopping_cart WHERE user_id =?', [user_id])
        return cart.length > 0 ? cart[0] : null;

    } catch (error) {
        throw error;
    }
}
const createCartForUser = async (user_id) => {
    try {
        const [result] = await connection.query('INSERT INTO shopping_cart (user_id) VALUES (?)', [user_id]);
        const [newCart] = await connection.query('SELECT * FROM shopping_cart WHERE cart_id =?', [result.insertId])
        return newCart[0];
    } catch (error) {
        throw error

    }
}
const addItemsToCart = async (cart_id, car_id, quantity) => {
    try {
        const [car_item] = await connection.query('INSERT INTO cart_items (cart_id,car_id,quantity) VALUES (?,?,?) ', [cart_id, car_id, quantity])
    } catch (error) {
        console.error(error);

        throw error.messages;
    }
}
const updateCartItem = async (quantity, car_id, userId) => {

    await connection.query(`UPDATE cart_items SET quantity =? WHERE car_id =? AND 
        cart_id =(SELECT cart_id FROM shopping_cart WHERE user_id =?)`,
        [quantity, car_id, userId])
}
const getUpdateQuantity = async (car_id, user_id) => {
    const [item] = await connection.query(
        `SELECT cars.car_id, cars.type, cars.price, cars.model, cars.conditions, cart_items.quantity 
         FROM cart_items 
         JOIN cars ON cart_items.car_id = cars.car_id 
         WHERE cart_items.car_id = ? AND cart_items.cart_id = (SELECT cart_id FROM shopping_cart WHERE user_id = ?)`,
        [car_id, user_id]
    );
    return item;
}
const deleteItem = async (car_id, userId) => {
    await connection.query(`
        DELETE FROM cart_items 
        WHERE car_id = ? AND cart_id = (SELECT cart_id FROM shopping_cart WHERE user_id = ?)`,
        [car_id, userId]);
}
module.exports = {
    getDetailCars, getBrand, getCarID, getBrandID,
    updateCarByID, updateBrandByID, deleteCarsByID,
    deleteBrandByID, addCar, addBrand, addUser, getUserID,
    updateUserByID, getAllcar, getUser, getShopping, getCarByUserId,
    createCartForUser, addItemsToCart, updateCartItem, getUpdateQuantity,
    deleteItem
}