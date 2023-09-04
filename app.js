const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const morgan=require('morgan');
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');





app.use(cors());
app.options('*',cors());



//middleware ( check before go to the server)
app.use(bodyParser.json());
app.use(morgan('tiny'));


const api=process.env.API_URL




// the authorize methods
 app.use(authJwt()
 .unless({
    path: [//regex tester
        // {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
        {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
        {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
        {url: /\/api\/v1\/orders(.*)/,methods: ['GET', 'OPTIONS', 'POST']},
        `${api}/users/login`,
        `${api}/users/register`,
    ]
    }));

    //error handleding
    app.use(errorHandler);







//Routes
const categoriesRoutes=require("./routers/categories")
const productsRoutes=require("./routers/products")
const usersRoutes=require("./routers/users")
const ordersRoutes=require("./routers/orders");






app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);







mongoose.connect(process.env.CONNECTION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:'eshop-database'
})
.then(()=>{
    console.log("Database connection is ready");
})
.catch(()=>{
    console.log(err)
})

app.listen(3000,()=>{
    console.log('Server is Runinning in http://localhost:3000')
})