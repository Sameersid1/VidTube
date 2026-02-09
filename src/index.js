import {app} from './app.js'
import dotenv from 'dotenv'
import logger from "./logger.js";
import morgan from "morgan";
import connectDB from './db/index.js';

dotenv.config({
    path:'./.env'
})

const PORT=process.env.PORT || 8001

connectDB()
.then(()=>{
    app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection error ",err)
})


//logger for gettting detail about my current status


const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);