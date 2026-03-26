import {asyncHandler} from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import {ApiError} from '../utils/ApiError.js'
import multer from 'multer'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { Tweet } from '../models/tweet.models.js'
import mongoose from 'mongoose'
import {Like} from "../models/like.models.js"
const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    const imageLocalPath=req.file?.path;

    if(!content?.trim() && !imageLocalPath){
        throw new ApiError(400,"Tweet must have content or image");
    }
    let imageUrl;
    if(imageLocalPath){
        const uploadedImage=await uploadOnCloudinary(imageLocalPath,"image")
        imageUrl=uploadedImage.url
    }
    

    const tweet=await Tweet.create({
        content,
        images:imageUrl,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"))
})

const getAllTweets=asyncHandler(async(req,res)=>{
    const {page=1,limit=10}=req.query
    const userId=req.user?._id? new mongoose.Types.ObjectId(req.user._id): null;

    const pageNumber=parseInt(page)
    const limitNumber=parseInt(limit);
    const skip=(pageNumber-1)*limitNumber;

    const totalTweets=await Tweet.countDocuments();
    console.log("REQ USER:", req.user);
    console.log("USER ID TYPE:", typeof req.user?._id);
    const tweets=await Tweet.aggregate([
        {$sort:{createdAt:-1}},
        {$skip:skip},
        {$limit:limitNumber},
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner"
        }
    },{$unwind:"$owner"},
    {
        $lookup:{
            from:"likes",
            let:{tweetId:"$_id"},
            pipeline:[
                {
                    $match:{
                        $expr:{   //for comparison
                            $and:[
                                {$eq:["$tweet","$$tweetId"]},
                                {$eq:["$likedBy",userId]}
                            ]
                        }
                    }
                }
            ],
            as:"liked"
        }
    },
    {
        $addFields:{
            isLiked:userId?{$gt:[{$size:"$liked"},0]}:false}
    },
    {
        $project:{
            content:1,
            image:1,
            likesCount:1,
            createdAt:1,
            isLiked:1,
            "owner._id":1,
            "owner.username":1,
            "owner.avatar":1
        }
    },
])
const totalPages=Math.ceil(totalTweets/limitNumber)

return res.status(200).json(new ApiResponse(200,{tweets,totalTweets,totalPages,currentPage:pageNumber}),"Tweets fetched successfully")
})

const getUserTweets=asyncHandler(async(req,res)=>{
    const {page=1,limit=10}=req.query;

    const pageNumber=parseInt(page)
    const limitNumber=parseInt(limit)
    const skip=(pageNumber-1)*limitNumber;

    const totalTweets=await Tweet.countDocuments({
        owner:req.user._id
    })
    const tweets=await Tweet.find({
        owner:req.user._id
    }).sort({createdAt:-1})
      .skip(skip)
      .limit(limitNumber)
    const totalPages = Math.ceil(totalTweets / limitNumber);

    return res.status(200).json(new ApiResponse(200,{tweets,totalTweets,totalPages,currentPage:pageNumber}),"User Tweets fetched successfully")
})
const updateTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    const {content}=req.body
    const imageLocalPath=req.file?.path;

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(500,"Invalid TweetId")
    }

    const tweet=await Tweet.findById(tweetId)

    if(!tweetId){
        throw new ApiError(400,"Tweet not found")
    }
    if(tweet.owner.toString()!=req.user._id.toString()){
        throw new ApiError(403,"Not authorized to update this tweet");
    }
    if(!content?.trim() && !imageLocalPath){
        throw new ApiError(400,"Nothing to update")
    }
    if(content!=undefined){
        tweet.content=content
    }
    if(imageLocalPath){
        const uploadImage=await uploadOnCloudinary(imageLocalPath,"image")

        if(!uploadImage?.url){
            throw new ApiError(500,"Image upload failed")
        }

        tweet.image=uploadImage.url
    }
    await tweet.save()

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"))
})

const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(409,"Invalid Tweet Id")
    }

    const tweet=await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(500,"Not authorised to delete this tweet");
    }
    await tweet.deleteOne();

    return res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully"));
})
const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(403,"Invalid Tweet Id")
    }

    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
        }
    )
    if(existingLike){
        await existingLike.deleteOne()
        await Tweet.findByIdAndUpdate(tweetId,{
            $inc:{likesCount:-1}
        })

        return res.status(200).json(new ApiResponse(200,{liked:false},"Tweet disliked successfully"))
    }
    await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    })
    await Tweet.findByIdAndUpdate(tweetId,{
        $inc:{likesCount:1}
    })
    return res.status(200).json(new ApiResponse(200,{liked:true},"Tweet liked successfully"))
})
const getPersonalizedTweet=asyncHandler(async(req,res)=>{
    
})
export {createTweet,getAllTweets,getUserTweets,updateTweet,deleteTweet,toggleTweetLike}