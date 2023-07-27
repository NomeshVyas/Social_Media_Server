const requireUser = require('../middlewares/requireUser');
const userController = require('../controllers/userController');
const router = require('express').Router();

router.post('/follow', requireUser, userController.followOrUnfollowController);
router.get('/postsOfFollowing', requireUser, userController.getPostsOfFollowing);
router.get('/myPosts', requireUser, userController.getMyPosts);
router.get('/userPosts', requireUser, userController.getUserPosts);
router.delete('/', requireUser, userController.deleteMyProfile);

module.exports = router;