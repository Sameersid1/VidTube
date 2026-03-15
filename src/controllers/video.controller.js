import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.models.js";
import mongoose from 'mongoose'

const publishVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body;

    if(!title || !description){
        throw new ApiError(500,"title and description is required")
    }
    const videoLocalPath=req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath=req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(509,"Video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(509,"Thumbnail is required")
    }
    let uploadedVideo;
    try{
        uploadedVideo=await uploadOnCloudinary(videoLocalPath,"video");
        console.log("Uploaded video")
    }catch(error){
        console.log("Error uploading video ",error);
        throw new ApiError(500,"Cannot upload video")
    }
    if(!uploadedVideo?.url){
        throw new ApiError(500,"Error uploading video")
    }
    let uploadedThumbnail;
    try{
        uploadedThumbnail=await uploadOnCloudinary(thumbnailLocalPath,"image")
        console.log("Uploaded thumbnail successfully")
    }catch(error){
        console.log("Error uploading thumnail ",error)
        throw new ApiError(500,"Error uploading thumbnail")
    }
    console.log("User:", req.user);
    console.log("Duration:", uploadedVideo.duration);
    const video=await Video.create({
        title,
        description,
        videoFile:uploadedVideo.url,
        thumbnail:uploadedThumbnail.url,
        duration:uploadedVideo.duration,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(200,video,"Video uploaded successfully"))
})

const getAllVideos=asyncHandler(async(req,res)=>{
    const {
        page=1,
        limit=10,
        search="",
        sortBy="createdAt",
        sortType="desc"
    }=req.query;

    const matchStage={
        isPublished:true
    }
    if(search){
        matchStage.$text={$search:search}             //it becomes { isPublished: true,
                                                    // $text: { $search: search }}
    }
    const sortStage={
        [sortBy]:sortType==='asc'?1:-1
    };
    const aggregate=Video.aggregate([
        {$match:matchStage},
        {$sort:sortStage},
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {$unwind:"$owner"}
    ])
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    };
    const videos=await Video.aggregatePaginate(aggregate,options);

    return res.status(200).json(new ApiResponse(200,videos,"Video fetched successfully"))
})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(509,"Invalid video id")
    }
    const video=await Video.findById(videoId)
        .populate("owner","username avatar")

    if(!video){
        throw new ApiError(404,"Video not found")
    }    
    video.view+=1;
    await video.save({validateBeforeSave:false});

    await User.findByIdAndUpdate(req.user._id,{
        $addToSet:{watchHistory:video._id}   //prevent duplicate
    })
    const isLiked=await Like.exists({
        video:videoId,
        likedBy:req.user._id
    })
    video._doc.isLiked=!isLiked
    return res.status(200).json(new ApiResponse(200,video,"Video fetched successfully"))
})

const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {title,description}=req.body

    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"Not authorized");
    }
    if(title) video.title=title;
    if(description) video.description=description;

    await video.save();
    return res.status(200).json(new ApiResponse(200,video,"Video updated successfully"))
})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found");
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"Not authorized")
    }
    
    await video.deleteOne();
    return res.status(200).json(new ApiResponse(200,{},"Video deleted successfully"))
})

const togglePublishStatus=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video Id")
    }
    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }

    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(500,"Not Authorized");
    }
    video.isPublished=!video.isPublished

    await video.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,video,`Video ${video.isPublished ? "published" : "unpublished"} successfully` ))
})
const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(500,"Invalid Video Id")
    }
    const video=await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found")
    }
    const existingLike=await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(existingLike){
        await existingLike.deleteOne()

        await Video.findByIdAndUpdate(videoId,{
            $inc:{likesCount:-1}
        })
        return res.status(200).json(new ApiResponse(200,{liked:false},"Video Unliked successfully"))
    }
    if (!video.isPublished && video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Cannot like unpublished video");
    }
    await Like.create({
        video:videoId,
        likedBy:req.user._id
    })
    await Video.findByIdAndUpdate(videoId,{
        $inc:{likesCount:1}
    })
    return res.status(200).json(new ApiResponse(200,{liked:true},"Video liked successfully"))
})
export  {publishVideo,getAllVideos,getVideoById,updateVideo,deleteVideo,togglePublishStatus,toggleVideoLike}