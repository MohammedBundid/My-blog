require("dotenv").config();
const express = require('express');
const morgan = require('morgan')
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const mainRoutes = require('./server/routes/main');
const AdminRoutes = require('./server/routes/admin');

const connectDB = require('./server/config/db')
const { isActiveRoute } = require('./server/helpers/routeHelpers')

const app = express();
const PORT = 5000 || process.env.PORT;
connectDB();


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'mamo',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    // cookie: { maxAge: new Date ( Date.now() * (3600000) ) }
}));

app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('', mainRoutes);
app.use('', AdminRoutes);

app.listen(PORT, (req, res) => {
    console.log(`app listening on port ${PORT}`)
})