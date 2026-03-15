import  jwt from "jsonwebtoken";
import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
export const optionalVerifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(); // No token → continue without user
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select("-password -refreshToken");
    console.log("AUTH HEADER:", req.header("Authorization"));
    console.log("COOKIE TOKEN:", req.cookies?.accessToken);
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    next(); // Ignore token errors in optional auth
  }
};