const User = require("../models/User");
const Post = require("../models/Post");
const { success, error } = require("../utils/responseWrapper");

const followOrUnfollowController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const curUserId = req._id;

        const userToFollow = await User.findById(userIdToFollow);
        const curUser = await User.findById(curUserId);

        if (curUserId === userIdToFollow) {
            return res.send(error(409, 'Users cannot follow themselves'))
        }

        if (!userToFollow) {
            return res.send(error(404, 'User to Follow not Found'));
        }

        if (curUser.following.includes(userIdToFollow)) { //// for Unfollow
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

const getMyPosts = async (req, res) => {
    try {
        const myUserId = req._id;
        const myUserProfile = await User.findById(myUserId);

        if (!myUserProfile) {
            return res.send(error(404, "User not found"));
        }
        const myPosts = await Post.find({
            'owner': myUserId
        }).populate('likes')

        return res.send(success(200, { myPosts }))

    } catch (err) {
        return res.send(error(500, err.message));
    }
}
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!userId) {
            return res.send(error(404, "UserId is required"));
        }
        if (!user) {
            return res.send(error(404, "User not found"));
        }

        const posts = await Post.find({
            'owner': userId
        }).populate('likes')

        return res.send(success(200, { posts }))

    } catch (err) {
        return res.send(error(500, err.message));
    }
}

const deleteMyProfile = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);

        //// Delete all my Posts
        await Post.deleteMany({
            'owner': curUserId
        })

        //// Remove myself from follower's following
        curUser.followers.forEach(async (followerId) => {
            const follower = await User.findById(followerId);
            const index = follower.following.indexOf(curUserId);
            follower.following.splice(index, 1);
            await follower.save();
        });

        //// Remove myself from following's followers
        curUser.following.forEach(async (followingId) => {
            const following = await User.findById(followingId);
            const index = following.followers.indexOf(curUserId);
            following.followers.splice(index, 1);
            await following.save();
        })

        //// Remove myself from all likes
        const allPosts = await Post.find();
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        })

        //// Delete User
        await User.deleteOne(curUser);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        })

        return res.send(success(200, 'User Profile Deleted'));

    } catch (err) {
        console.log(err);
        return res.send(error(500, err.message));
    }
}

module.exports = {
    followOrUnfollowController,
    getPostsOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteMyProfile
}