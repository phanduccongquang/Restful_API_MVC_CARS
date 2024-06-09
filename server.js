const express = require('express')
const app = express()
require('dotenv').config()
const webRoure = require('./src/routers/api')
const configTemplate = require('./src/config/templateViewEngine')
const connection = require('./src/config/database')
const methodOverride = require('method-override');

app.use(methodOverride('_method'));

//sử dụng dotenv để lưu các biến môi trường
const port = process.env.PORT || 8000
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/', webRoure)
//test conection

// connection.query(
//     ' select * from cars',
//     function (err, results, fields) {
//         console.log("results", results);

//     }
// )





configTemplate(app)
app.listen(port, () => {
    console.log(` App listening on port ${port}`)
})