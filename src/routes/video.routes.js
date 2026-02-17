import {Router} from "express"
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {uploadVideo} from "../controllers/video.controller.js"

const router=new Router()

router.route("/").post(verifyJWT,uploadFields([
    {name:"videoFile",maxCount:1},
    {name:"thumbnail",maxCount:1}
]),uploadVideo)

export default router;