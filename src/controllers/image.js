const path = require('path')
const {randomNumber} = require('../helpers/libs')
const fs = require('fs-extra')
const md5 = require('md5')

const { Image, Comment } = require('../models')
const sidebar = require('../helpers/sidebar')

const ctrl = {};

ctrl.index = async (req,res) => {

    let viewModel = {
        image: {},
        comments: {}
    }

    const image = await Image.findOne({filename: {$regex: req.params.image_id}})
    

    if (image){
    
        image.views = image.views + 1;
        viewModel.image = image;
        await image.save();
        const comments = await Comment.find({image_id: image._id})
        viewModel.comments = comments;
        viewModel = await sidebar(viewModel);
        res.render('image', viewModel); 
        
    } else {
        res.redirect("/")
    }
};

ctrl.create = async (req,res) => {
    
    const saveImage = async () => {
        const imgUrl = randomNumber();
        const images = await Image.find({filename: imgUrl})
        if (images.length > 0){
            saveImage();
        } else {
            const imageTempPath = req.file.path; //carpeta inicial
            const ext = path.extname(req.file.originalname).toLowerCase(); //nombre de la extensión del archivo subido
            const targetPath = path.resolve(`src/public/upload/${imgUrl}${ext}`) //carpeta donde se moverá
        
            if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif'){
                await fs.rename(imageTempPath, targetPath); //mueve el archivo desde una carpeta a otra
                const  newImg = new Image({
                    title: req.body.title,
                    description: req.body.description,
                    filename: imgUrl + ext,
                })
                const imageSaved = await newImg.save();
                res.redirect('/images/' + imgUrl)
            } else {
                await fs.unlink(imageTempPath); //elimina el archivo del servidor
                res.status(500).json({error: 'Only Images are allowed'});
            }
        }
    };

    saveImage();
};

ctrl.like = async (req,res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}})
    if(image){
        image.likes = image.likes + 1;
        await image.save();
        res.json({likes: image.likes}) 
    } else {
        res.status(500).json({error: 'Internal Error'});
    }
};

ctrl.comment = async (req,res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}})
    if (image) {
        const newComment = new Comment(req.body);
        newComment.gravatar = md5(newComment.email); //md5 crea un hash con el mail
        newComment.image_id = image._id; //otorga al comentario el id de la imagen traída desde la db
        await newComment.save();
        res.redirect('/images/' + image.uniqueId);
    } else {
        res.redirect("/")
    }
};

ctrl.remove = async (req,res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image){
        await fs.unlink(path.resolve('./src/public/upload/' + image.filename));
        await Comment.deleteOne({image_id: image._id});
        await image.remove();
        res.json(true)
    }
};

module.exports = ctrl;