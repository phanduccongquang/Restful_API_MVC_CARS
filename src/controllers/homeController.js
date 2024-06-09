const connection = require('../config/database')
const { getDetailCars, getMaf, getCarID, getMafID,
    updateCarByID, updateMafByID, deleteCarsByID, deleteMafByID, addCar, addMaf } = require('../services/CRUD')

// const getHomePage = (req, res) => {
//     res.render('home.ejs')
// }
const showDetailCar = async (req, res) => {
    // let [results, fields] = await connection.query('select * from cars');
    // console.log("results", results);
    const carId = req.params.car_id;
    const data = await getDetailCars(carId)


    // res.render('show.ejs', { listUser: data });
    res.json({ data: data })
}
const showMaf = async (req, res) => {

    const data = await getMaf();

    res.render('showMaf.ejs', { listUser: data });
}
const getCarById = async (req, res) => {
    const carId = req.params.car_id;
    const data = await getCarID(carId)
    // res.render('update.ejs', { useEdit: data });
    res.json({ data: data })

}
const getMafById = async (req, res) => {
    const MafId = req.params.manufacturer_id;
    const data = await getMafID(MafId)
    res.render('updateMaf.ejs', { useEdit: data });

}
const updateCars = async (req, res) => {
    let car_id = req.body.car_id;
    let model = req.body.model;
    let specifications = req.body.specifications;
    let price = req.body.price;
    let manufacturer_id = req.body.manufacturer_id;


    await updateCarByID(model, specifications, price, manufacturer_id, car_id)
    // res.redirect('/listCars');
    res.json({ message: 'Car updated successfully' });



}
const updateMaf = async (req, res) => {

    let manufacturer_id = req.body.manufacturer_id;
    let name = req.body.name;


    await updateMafByID(name, manufacturer_id)

    res.redirect('/show');



}
const deleteCars = async (req, res) => {
    let car_id = req.params.car_id;
    await deleteCarsByID(car_id)

    // res.redirect('/listCars');
    res.json({ message: 'delete car successful' })


}
const deleteMaf = async (req, res) => {
    let Maf_id = req.params.Maf_id;
    await deleteMafByID(Maf_id)
    res.redirect('/show');

}

const createCar = async (req, res) => {
    // console.log("check req.body", req.body);
    let car_id = req.body.car_id;
    let model = req.body.model;
    let specifications = req.body.specifications;
    let price = req.body.price;
    let manufacturer_id = req.body.manufacturer_id;


    await addCar(car_id, model, specifications, price, manufacturer_id)

    // res.redirect('/listCars');
    res.json({ message: 'add car successfuly' })

}

const create = (req, res) => {
    res.render('create.ejs')
}
const createMaf = (req, res) => {
    res.render('createMaf.ejs')
}
const create_maf = async (req, res) => {
    // console.log("check req.body", req.body);

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

const GetCarWithMafAndPrice = async (req, res) => {
    var { manufacturer, price } = req.query;
    try {
        var cars = await getAllcar(); // Gọi đúng tên hàm "getAllcars"
        console.log('check cars', cars);
        let filterCars = cars;
        if (manufacturer) {
            filterCars = filterCars.filter(car => car.manufacturer_id === (manufacturer));
        }
        if (price) {
            filterCars = filterCars.filter(car => car.price <= (price));
        }
        // console.log('chekc fitle', filterCars);
        res.render('ShowMafAndPrice.ejs', { listUser: filterCars });


        // res.json({ cars: filterCars, error: "false" });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }
}

const SearchCars = async (req, res) => {
    var { name } = req.query;
    try {
        var cars = await getAllcar(); // Gọi đúng tên hàm "getAllcars"
        console.log('check cars', cars);
        let filterCars = cars;
        if (name) {
            filterCars = filterCars.filter(car => car.model === (name));
        }

        // console.log('chekc fitle', filterCars);
        res.render('ShowMafAndPrice.ejs', { listUser: filterCars });


        // res.json({ cars: filterCars, error: "false" });
    } catch (err) {
        res.status(500).json({ error: "get cars data is error" });
    }


}

module.exports = {
    getAllcars, showDetailCar, createCar, create,
    getCarById, updateCars, deleteCars, showMaf
    , createMaf, create_maf, getMafById, updateMaf, deleteMaf
    , GetCarWithMafAndPrice, getAllcar, SearchCars
}