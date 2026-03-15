import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Video } from "../models/video.models";
import { Comment } from "../models/comment.models";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {content}=req.body

    if(!content){
        throw new ApiError(509,"Comment content is required")
    }
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"Video not found")
    }
    const comment=await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(200,comment,"Comment added successfully"))
})

const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {page=1,limit=10}=req.query

    const aggregate=Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        projects:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {$unwind:"$owner"},
        {$sort:{createdAt:1}}
    ]);
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    }
    const comments=await Comment.aggregatePaginate(aggregate,options)
    return res.status(200).json(new ApiResponse(200,comments,"Comment fetched Successfully"))
})
const updateComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const {content}=req.body

    if(!content){
        throw new ApiError(509,"Comment content is required")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiResponse(500,"Comment not found")
    }
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(409,"Not authorized")
    }
    comment.content=content;
    await comment.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,comment,"Comment updated successfully"))
})
const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found")
    }
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(500,"Unauthorized access")
    }
    await comment.deleteOne();
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted successfully"))
})

export {addComment,getVideoComments,deleteComment,updateComment}