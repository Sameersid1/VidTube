import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import mongoose, {isValidObjectId} from "mongoose"

const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description,isPublic}=req.body
    if(!name.trim()){
        throw new ApiError(500,"Playlist name is required")
    }
    const playlist=await Playlist.create({
        name,
        description,
        isPublic: typeof isPublic==='boolean'?isPublic:true,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist created successfully"))
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)||!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(500,"Invalid Id")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(500,"Playlist not found")
    }
    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(500,"Not authorized")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(503,"Video not found")
    }
    await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{videos:videoId}
    },{new:true})

    return res.status(200).json(new ApiResponse(200,{},"Video added to playlist successfully"))
})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {videoId,playlistId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(509,"Invalid Id");
    }
    const playlist=await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(500,"Playlist not found");
    }
    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(500,"Not authorized")
    }
    if(!playlist.videos.some(v => v.toString() === videoId)){
        throw new ApiError(500,"Video not found in playlist")
    }
    await Playlist.updateOne(
        {_id:playlistId},
        {$pull:{videos:videoId}}
    )
    return res.status(200).json(new ApiResponse(200,{},"Video removed from playlist successfully"))
})

const getUserPlaylists=asyncHandler(async(req,res)=>{
    const playlists=await Playlist.find({
        owner:req.user._id
    }).sort({createdAt:-1})

    return res.status(200).json(new ApiResponse(200,playlists,"Users playlists fetched successfully"))
})

const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(500,"Invalid Id");
    }
    const playlist=await Playlist.findById(playlistId).populate({
        path:"videos",
        populate:{
            path:"owner",
            select:"username avatar"
        }
    })
    if(!playlist){
        throw new ApiError(509,"Plalist not found")
    }
    if(!playlist.isPublic && (!req.user || playlist.owner.toString()!==req.user._id.toString())){
        throw new ApiError(403,"This playlist is private")
    }
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched succesfully"))
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id");
    }
    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }
    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(509,"Not authorized to delete this playlist")
    }
    await playlist.deleteOne();

    return res.status(200).json(new ApiResponse(200,{},"Playlist deleted successfully"));
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    const {name,description,isPublic}=req.body;

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(409,"Invalid playlist Id");
    }
    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }
    if(playlist.owner.toString()!==req.user._id.toString()){
        throw new ApiError(409,"Not authorized to update this playlist")
    }

    if(name!==undefined)    playlist.name=name;
    if(description!==undefined) playlist.description=description;
    if(typeof isPublic==="boolean") playlist.isPublic=isPublic;

    await playlist.save();

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"));
})
export {createPlaylist,addVideoToPlaylist,removeVideoFromPlaylist,getUserPlaylists,getPlaylistById,deletePlaylist,updatePlaylist}