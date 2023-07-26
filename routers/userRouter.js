const requireUser = require('../middlewares/requireUser');
const userController = require('../controllers/userController');
const router = require('express').Router();

router.post('/follow', requireUser, userController.followOrUnfollowController);
router.get('/postsOfFollowing', requireUser, userController.getPostsOfFollowing);

module.exports = router;