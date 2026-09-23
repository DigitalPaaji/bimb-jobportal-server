import express from "express"
import  type { Request, Response } from "express"
import dotenv from "dotenv"
import mongoose  from "mongoose"
import errorHandler from "./middlewere/errorHandler"
import AdminAuthRoutes from "./routes/AdminAuthRoutes"
import AdminCategoryRoutes from "./routes/CategoryRoutes"
import adminJobRoutes from "./routes/adminJobRoutes"
import ArticleRoutes from "./routes/ArticleRoutes"
import NewsRoutes from "./routes/NewsRoutes"
import AdminUsers from "./routes/AdminUsers"



import userAuthRoutes from "./routes/userAuthRoutes"
import userJobRoutes from "./routes/userJobRoutes"
import ArticleUser from "./routes/ArticleUser"
import NewsUser from "./routes/NewsUser"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"
import { connectRedis } from "./helper/redis"
dotenv.config()

const app = express()


app.use(cors({
    origin: process.env.FRONTEND_URL!.split(","),
    credentials: true,               
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],

  })) 
  app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use( 
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"),
 {
    maxAge: "7d",              
    etag: true,               
    lastModified: true,        
    immutable: true            
  })
);

app.get("/ping",async(req:Request,res:Response)=>{
return res.status(200).send("Pong")
})







app.use("/api/v1/admin/auth",AdminAuthRoutes)
app.use("/api/v1/admin/category",AdminCategoryRoutes)
app.use("/api/v1/admin/job",adminJobRoutes)
app.use("/api/v1/admin/article",ArticleRoutes)
app.use("/api/v1/admin/news",NewsRoutes)
app.use("/api/v1/admin/user",AdminUsers)
// app.use("/api/v1/admin/user",AdminUsers)






///////////////       user       ////////
app.use("/api/v1/user/auth",userAuthRoutes)
app.use("/api/v1/user/job",userJobRoutes)
app.use("/api/v1/user/articles",ArticleUser)
app.use("/api/v1/user/news",NewsUser)




app.use(errorHandler)
const PORT = process.env.PORT



const startServer = async () => { try { 
 await mongoose.connect(process.env.DATABASE_URL!);
  console.log("MongoDB connected ✅"); 
  await connectRedis(); console.log("Redis connected ✅"); 
   app.listen(PORT, () => { console.log(`Server running: http://localhost:${PORT}`); }); }
    catch (error) { console.error("Server startup failed:", error); process.exit(1); } };
    
    startServer();





