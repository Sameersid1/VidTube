import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { Video } from "../models/video.models";
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const publishVideo=asyncHandler(async(req,res)=>{

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
        [sortStage]:sortType==='asc'?1:-1
    };
    const aggregate=await Video.aggregate([
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
        {$unwind:"owner"}
    ])
    const options={
        page:parseInt(page),
        limit:parseInt(limit)
    };
    const videos=await Video.aggregatePaginate(aggregate,options);

    return res.status(200).json(new ApiResponse(200,videos,"Video fetched successfully"))
})

const getVideoById=asyncHandler(async(req,res)=>{

})

const updateVideo=asyncHandler(async(req,res)=>{

})

const deleteVideo=asyncHandler(async(req,res)=>{

})

const togglePublishStatus=asyncHandler(async(req,res)=>{

})
export  {publishVideo,getAllVideos,getVideoById,updateVideo}