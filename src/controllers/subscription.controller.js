import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subsciption.models.js";
import mongoose from "mongoose";

const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(500,"invalid ChannelId")
    }
    if(channelId===req.user._id.toString()){
        throw new ApiError(500,"You cannot subscribe to your channel")
    }
    const existingSubscription=await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    })
    if(existingSubscription){
        await existingSubscription.deleteOne();

        return res.status(200).json(new ApiResponse(200,{},"Unsubscribed successfully"))
    }
    await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })
    return res.status(200).json(new ApiResponse(200,{},"Subscribed successfully"))
})

const getSubscribedChannels=asyncHandler(async(req,res)=>{
    const {page=1,limit=10}=req.query;
    const aggregate=Subscription.aggregate([
        {
            $match:{
                subscriber:req.user._id
            }
        },{
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1,
                            fullname:1
                        }
                    }
                ]
            }
        },{$unwind:"$channel"},
        {$replaceRoot:{newRoot:"$channel"}}
    ])
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    }
    const result=await Subscription.aggregatePaginate(aggregate,options)
    return res.status(200).json(new ApiResponse(200,result,"Subscribed channels fetched successfully"))
})

const getChannelSubscribers=asyncHandler(async(req,res)=>{

})
export {toggleSubscription,getSubscribedChannels,getChannelSubscribers}