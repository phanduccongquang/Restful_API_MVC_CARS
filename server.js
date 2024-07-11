const express = require('express')
const app = express()
require('dotenv').config()
const webRoure = require('./src/routers/web')
const apiRoure = require('./src/routers/api')
const configTemplate = require('./src/models/templateViewEngine')
const methodOverride = require('method-override');

app.use(methodOverride('_method'));

const port = process.env.PORT || 8000
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/', webRoure)
app.use('/v1', apiRoure)

configTemplate(app)
app.listen(port, () => {
    console.log(` App listening on port ${port}`)
})