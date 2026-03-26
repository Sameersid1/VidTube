import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import Like from "../models/like.models.js"

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    if(!mongoose.Types.ObjectId(videoId)){
        throw new ApiError(500,"Invalid video Id")
    }
    const video=await Video.findById({videoId})

    if(!video){
        throw new ApiError(500,"Video not found")
    }

    const existingLike=await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(existingLike){
        await existingLike.deleteOne();
        Video.findByIdAndUpdate(videoId,{
            $inc:{likesCount:-1}
        })
        return res.status(200).json(new ApiResponse(200,{},"Unliked video Successfully"))
    }

    await Like.create({
        video:videoId,
        likedBy:req.user._id
    })
    await Video.findByIdAndUpdate(videoId,{
        $inc:{likesCount:1}
    })
    return res.status(200).json(new ApiResponse(200,{},"Video liked successfully"))
})

const getLikedVideos=asyncHandler(async(req,res)=>{
    const likes=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video"
            }
        },{$unwind:"$video"},
        {$replaceRoot:{newRoot:"$video"}}
    ])
})

export {toggleVideoLike,getLikedVideos}