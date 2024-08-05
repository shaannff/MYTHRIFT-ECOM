//  Set env :-
const dotenv = require('dotenv').config();

//  Connect Mongoose :-
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

const express = require('express');
const app = express();

const errorMidlleware=require('./middleware/error_middleware')

//  Set Session :-
const session = require('express-session');

app.use(session({

    secret: "&##$",
    resave: false,
    saveUninitialized: true

}));

//  Set Nocache :-
const nocache = require('nocache');

app.use(nocache());

// app.use(morgan('dev'))

//  Set Path :-
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

//  Set View Engine :-
app.set('view engine', 'ejs');

//  Set Body-Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  set flash :-
const flash = require('express-flash');

app.use(flash());


//  User route :-
const userRoute = require('./routers/user_route');
app.use('/', userRoute);

//  Admin route :-
const adminRoute = require('./routers/admin_router');
app.use('/admin', adminRoute);

app.use(errorMidlleware)

app.get('*', (req, res) => {
    res.redirect('/error')
    res.status(404).render('user/404')
    // res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { console.log(`Server Running http://localhost:${PORT}`)});