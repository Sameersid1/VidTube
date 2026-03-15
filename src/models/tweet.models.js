import mongoose,{Schema} from 'mongoose';

const tweetSchema=new Schema(
    {
        content:{
            type: String,
            required: true
        },
        images:{
            type:String
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        likesCount:{
            type:Number,
            default:0
        }
    },
    {timestamps:true}
)
tweetSchema.index({createdAt:-1})
tweetSchema.index({owner:1,createdAt:-1})
export const Tweet=mongoose.model("Tweet",tweetSchema);