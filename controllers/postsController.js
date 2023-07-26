const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");

const getAllPostsController = (req, res) => {

    return res.send(success(200, "all post"));
}

const createPostController = async (req, res) => {
    try {
        const { caption } = req.body;
        const owner = req._id;

        const user = await User.findById(req._id);

        const post = await Post.create({
            owner,
            caption
        })

        user.posts.push(post._id);
        await user.save();

        return res.send(success(201, post))
    } catch (err) {
        res.send(error(500, err.message))
    }
}

const likeUnlikePostController = async (req, res) => {
    try {
        const { postId } = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.send(error(404, 'Post not Found...!'));
        }

        if (post.likes.includes(curUserId)) {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();

            return res.send(success(200, 'Post Unliked'));
        } else {
            post.likes.push(curUserId);
            await post.save();

            return res.send(success(200, 'Post Liked'));
        }
    } catch (err) {
        res.send(error(500, err.message));
    }

}

const updatePostController = async (req, res) => {
    try {
        const { postId, caption } = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.send(error(404, "Post not found"));
        }

        if (post.owner.toString() !== curUserId) {
            return res.send(error(403, "Only Owner can update their post"));
        }

        if (caption) {
            post.caption = caption;
        }
        await post.save();

        return res.send(success(200, { post }));

    } catch (err) {
        res.send(error(500, err.message))
    }
}

const deletePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const curUserId = req._id;

        const post = await Post.findById(postId);
        const curUser = await User.findById(curUserId);

        if (!post) {
            return res.send(error(404, "Post not found"));
        }

        if (post.owner.toString() !== curUserId) {
            return res.send(error(403, "Only owner can delete their post"));
        }

        
        const index = curUser.posts.indexOf(postId);
        curUser.posts.splice(index, 1);
        
        await curUser.save();
        await Post.findByIdAndDelete(postId);

        return res.send(success(200, "Post Deleted Successfully"));


    } catch (err) {
        return res.send(error(500, err.message))
    }
}

module.exports = {
    getAllPostsController,
    createPostController,
    likeUnlikePostController,
    updatePostController,
    deletePost
}