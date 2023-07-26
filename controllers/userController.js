const User = require("../models/User");
const Post = require("../models/Post");
const { success, error } = require("../utils/responseWrapper");

const followOrUnfollowController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const curUserId = req._id;

        const userToFollow = await User.findById(userIdToFollow);
        const curUser =  await User.findById(curUserId);

        if(curUserId === userIdToFollow){
            return res.send(error(409, 'Users cannot follow themselves'))
        }

        if (!userToFollow) {
            return res.send(error(404, 'User to Follow not Found'));
        }

        if(curUser.following.includes(userIdToFollow)) { //// for Unfollow
            const followingIndex = curUser.following.indexOf(userToFollow);
            curUser.following.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(curUser);
            userToFollow.followers.splice(followerIndex, 1);

            await userToFollow.save();
            await curUser.save();
            
            return res.send(success(200, "User Unfollowed"));
        } else { //// for Follow
            userToFollow.followers.push(curUserId);
            curUser.following.push(userIdToFollow);
            
            await userToFollow.save();
            await curUser.save();

            return res.send(success(200, "User Followed"));
        }
    } catch (err) {
        return res.send(error(500, err.message))
    }
}

const getPostsOfFollowing = async (req, res) => {
    try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    const posts = await Post.find({
        'owner': {
            '$in': curUser.following
        }
    })

    return res.send(success(200, posts))
        
    } catch (err) {
        return res.send(error(500, err.message))
    }
}

module.exports = {
    followOrUnfollowController,
    getPostsOfFollowing
}