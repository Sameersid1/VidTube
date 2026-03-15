import mongoose,{Schema} from 'mongoose';

const likeSchema=new Schema(
    {
        video:{
            type: Schema.Types.ObjectId,
            ref:"Video",
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        },
        tweet:{
            type: Schema.Types.ObjectId,
            ref:"Tweet"
        },
        likedBy:{
            type: Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },{timestamps:true}
)
likeSchema.index({video:1,comment:1,tweet:1,likedBy:1},{unique:true})
export const Like=mongoose.model("Like",likeSchema)