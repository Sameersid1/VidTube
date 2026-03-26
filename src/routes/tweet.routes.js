import { createTweet,deleteTweet,getAllTweets,getUserTweets,toggleTweetLike,updateTweet} from "../controllers/tweet.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { optionalVerifyJWT } from "../middlewares/optionalAuth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router=new Router()
router.route("/me").get(verifyJWT,getUserTweets)
router.route("/").get(optionalVerifyJWT,getAllTweets).post(verifyJWT,upload.single("image"),createTweet)
router.route("/:tweetId").patch(verifyJWT,upload.single("image"),updateTweet).delete(verifyJWT,deleteTweet)
router.route("/:tweetId/toggle-like").post(verifyJWT,toggleTweetLike)
export default router