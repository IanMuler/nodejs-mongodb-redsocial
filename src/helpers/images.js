const { Image } = require('../models');

module.exports = {
    
    async popular(){
        const images = await Image.find()
            .limit(9) 
            .sort({likes: -1}) //ordenar a mayor a menor
        return images;
    }

}