import {Router} from "express"
import { addVideoToPlaylist, createPlaylist, getUserPlaylists, removeVideoFromPlaylist ,getPlaylistById, deletePlaylist, updatePlaylist} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router=new Router();
router.route("/").post(verifyJWT,createPlaylist)
router.route("/me").get(verifyJWT,getUserPlaylists)
router.route("/:playlistId").get(getPlaylistById)
router.route("/:playlistId").delete(verifyJWT,deletePlaylist)
router.route("/:playlistId/videos/:videoId").post(verifyJWT,addVideoToPlaylist)
router.route("/:playlistId/videos/:videoId").delete(verifyJWT,removeVideoFromPlaylist)
router.route("/:playlistId").patch(verifyJWT,updatePlaylist)

export default router;