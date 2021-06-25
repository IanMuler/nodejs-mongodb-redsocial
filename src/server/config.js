const path = require('path');
const exphbs = require('express-handlebars');

const morgan = require('morgan');
const multer = require('multer');
const express = require('express')
const errorHandler = require('errorhandler');


const routes = require('../routes/index');

module.exports = app => {

    //Settings
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, '../views'));
    app.engine('.hbs', exphbs({
        defaultLayout: 'main',
        partialsDir: path.join(app.get('views'), 'partials'),
        layoutsDir: path.join(app.get('views'), 'layouts'),
        extname: '.hbs',
        helpers: require('./helpers'),
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
          }
    }))
    app.set('view engine', '.hbs');

    //Middlewares
    app.use(morgan('dev'));
    app.use(multer({dest: path.join(__dirname, '../public/upload/temp')}).single('image'));// a través de multer cuando me envies una imagen la coloco en esta carpeta destino, a través de un input name="image" y así tomar sus datos.
    app.use(express.urlencoded({extended:false}));
    app.use(express.json()); //para manejar los likes (ajax)

    //routes
    routes(app);

    //static files
    app.use('/public', express.static(path.join(__dirname, '../public'))); // /public para acceder a la carpeta desde la url del navegador

    //errorhandlers
    if('development' === app.get('env')){ //si estamos en desarrollo hace que se use errorhandler
        app.use(errorHandler)
    }

    return app;
}