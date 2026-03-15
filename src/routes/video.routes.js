import {Router} from "express"
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, toggleVideoLike, updateVideo} from "../controllers/video.controller.js"

const router=new Router()

router.route("/publish").post(verifyJWT,upload.fields([
    {name:"videoFile",maxCount:1},
    {name:"thumbnail",maxCount:1}
]),publishVideo)
router.route("/").get(getAllVideos)
router.route("/:videoId").get(verifyJWT,getVideoById)
router.route("/:videoId").patch(verifyJWT,updateVideo)
router.route("/:videoId").delete(verifyJWT,deleteVideo)
router.route("/:videoId").patch(verifyJWT,togglePublishStatus)
router.route("/:videoId").post(verifyJWT,toggleVideoLike)
export default router;