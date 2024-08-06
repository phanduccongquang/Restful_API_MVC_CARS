const connection = require('../models/database')


const getDetailCars = async (carId) => {
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
                cars.manufacturer_id = manufacturers.manufacturer_id  WHERE 
                cars.car_id = ?`, [carId]
    );
    return results;
}
const getMaf = async () => {
    let [results, fields] = await connection.query(`
    SELECT * FROM manufacturers;
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
const getMafID = async (MafId) => {
    let [results, fields] = await connection.query('select * from manufacturers where manufacturer_id = ?', [MafId]);

    let user = results && results.length > 0 ? results[0] : {};
    return user
}
const updateCarByID = async (model, specifications, price, manufacturer_id, car_id) => {


    let [results] = await connection.query(`UPDATE cars SET 
     model = ?,specifications=?,
    price=?,manufacturer_id=? WHERE car_id = ?`,
        [model, specifications, price, manufacturer_id, car_id]
    );
}
const updateMafByID = async (name, manufacturer_id) => {
    let [results] = await connection.query(`UPDATE manufacturers SET 
    name=? WHERE manufacturer_id = ?`,
        [name, manufacturer_id]
    );
}
const updateUserByID = async (role_id, id) => {
    let [results] = await connection.query(`UPDATE user SET 
        role_id=? WHERE id = ?`,
        [role_id, id]
    );

}

const deleteCarsByID = async (car_id) => {
    let [results] = await connection.query(`DELETE FROM cars WHERE car_id=?`,
        [car_id]
    );
}
const deleteMafByID = async (Maf_id) => {
    let [results] = await connection.query(`DELETE FROM manufacturers WHERE manufacturer_id=?`,
        [Maf_id]
    );
}
const addCar = async (car_id, model, specifications, price, manufacturer_id) => {
    const [results] = await connection.query(
        `INSERT INTO cars (car_id, model, specifications,price,manufacturer_id)VALUES (?, ?, ?,?,?)`
        , [car_id, model, specifications, price, manufacturer_id]
    );
}
const addUser = async (email, password, role_id) => {
    const [results] = await connection.query(
        `INSERT INTO user (email, password,role_id)VALUES ( ?,?,?)`
        , [email, password, role_id]
    );

}
const addMaf = async (manufacturer_id, name) => {
    const [results] = await connection.query(
        `INSERT INTO manufacturers (manufacturer_id,name)VALUES (?, ?)`
        , [manufacturer_id, name]
    );
}

module.exports = {
    getDetailCars, getMaf, getCarID, getMafID,
    updateCarByID, updateMafByID, deleteCarsByID,
    deleteMafByID, addCar, addMaf, addUser, getUserID, updateUserByID
}