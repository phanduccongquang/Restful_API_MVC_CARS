const express = require('express')
const app = express()
require('dotenv').config()
const webRoure = require('./src/routers/web')
const apiRoure = require('./src/routers/api')
const configTemplate = require('./src/models/templateViewEngine')
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser')


bodyParser = require("body-parser"),
    swaggerJsdoc = require("swagger-jsdoc"),
    swaggerUi = require("swagger-ui-express");


app.use(methodOverride('_method'));
app.use(cookieParser())

const port = process.env.PORT || 8000
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/', webRoure)
app.use('/v1', apiRoure)

configTemplate(app)

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "LogRocket Express API with Swagger",
            version: "0.1.0",
            description:
                "This is a simple CRUD API application made with Express and documented with Swagger",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "LogRocket",
                url: "https://logrocket.com",
                email: "info@email.com",
            },
        },
        servers: [
            {
                url: "https://localhost:3000/v1",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: ["./src/routers/*.js"],
};

const specs = swaggerJsdoc(options);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);
app.listen(port, () => {
    console.log(` App listening on port ${port}`)
})