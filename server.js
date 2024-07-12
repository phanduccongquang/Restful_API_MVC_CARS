const express = require('express')
const app = express()
require('dotenv').config()
const webRoure = require('./src/routers/web')
const apiRoure = require('./src/routers/api')
const configTemplate = require('./src/models/templateViewEngine')
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser')


app.use(methodOverride('_method'));
app.use(cookieParser())

const port = process.env.PORT || 8000
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/', webRoure)
app.use('/v1', apiRoure)

configTemplate(app)
app.listen(port, () => {
    console.log(` App listening on port ${port}`)
})