const { success } = require("../utils/responseWrapper");

const getAllPostsController = (req,res) => {
    
    return res.send(success(200, "all post"));
}

module.exports = {
    getAllPostsController
}