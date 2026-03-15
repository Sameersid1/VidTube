import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {toggleSubscription,getSubscribedChannels,getChannelSubscribers} from "../controllers/subscription.controller.js"

const router=new Router()

router.route("/me").get(verifyJWT,getSubscribedChannels)   //order me first
router.route("/channel/:channelId").get(verifyJWT,getChannelSubscribers)
router.route("/:channelId").post(verifyJWT,toggleSubscription)

export default router;