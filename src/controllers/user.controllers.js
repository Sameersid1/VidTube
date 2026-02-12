import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
    
        if(!user){
            throw new ApiError(510,"User do not exist");
        }
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
    
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(509,"Something went wrong while generating access or refresh token")
    }
}

const registerUser=asyncHandler(async (req,res)=>{
    const {fullname,email,username,password}=req.body

    //validation
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    } 
    const existedUser=await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist");
    }

    const avatarLocalPath=req.files?.avatar?.[0]?.path;
    const coverLocalPath=req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    // const avatar=await uploadOnCloudinary(avatarLocalPath)
    // let coverImage="";
    // if(coverLocalPath){
    //     coverImage=await uploadOnCloudinary(coverImage)
    // }
    let avatar;
    try{
        avatar=await uploadOnCloudinary(avatarLocalPath);
        console.log("Uploaded avatar ",avatar);
    }catch(error){
        console.log("Error uploading avatar ",error);
        throw new ApiError(500,"Failed to upload the avatar")
    }


    let coverImage=null;
    try{
        coverImage=await uploadOnCloudinary(coverLocalPath);
        console.log("Uploaded avatar ",coverImage);
    }catch(error){
        console.log("Error uploading coverImage ",error);
        throw new ApiError(500,"Failed to uploaad the coverImage")
    }

    try {
        const user=await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
        //getting it back from the database
        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering user")
        }
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    createdUser,
                    "User registered successfully"
                )
            )
    } catch (error) {
        console.log("User creation failed. ",error);
        if(avatar){
            await deleteFromCloudinary(avatar.public_id)
        }
        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ApiError(509,"Something went wrong while registering a user and images were deleted")
    }
})

const loginUser=asyncHandler(async(req,res)=>{
    const {email,password,username}=req.body

    if(!email){
        throw new ApiError(400,"Email is required")
    }
    const user=await User.findOne({
        $or: [{username},{email}]
    })

    //validate password

    const isPasswordValid=user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(409,"Invalid credentials");
    }

    const {accessToken,refreshToken}=generateAccessAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
    }
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {user:loggedInUser,accessToken,refreshToken},
                "User loggedIn Successfully"
            )
        )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"RefreshToken is required")
    }
    try{
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }  
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Invalid refresh Token");
        }  
        const options={
            httpOnly:true,
            secure:process.env.NODE_ENV="roduction"
        }
        const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshToken(user_.id)

        return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                new ApiResponse(200,{
                    accessToken,refreshToken:newRefreshToken
                },"Access token refreshed successfully")
            )
    }catch(error){
        throw new ApiError(500,"Someting went wrong while refreshing access token")
    }
})
const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined,
            }
        },{new:true}
    )
    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV==="production",
    }
    return res
        .status(200)
        .clearCookies("accessToken",options)
        .clearCookies("refreshToken",options)
        .json(
            new ApiResponse(200,{},"User logged out successfully")
        )
})
export{
    registerUser,loginUser,refreshAccessToken,logoutUser
}