import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import {Server} from "socket.io"

const app=express();
dotenv.config();



const server=http.createServer(app)
const io=new Server(server , {
  cors: {
    origin:"http://localhost:5173",
  },
})

app.get('/',(req,res)=>{
  res.send("your server is running successfully")
})



const PORT=process.env.PORT || 3000
server.listen(PORT,()=>{
  console.log(`server is runing at http://localhost:${PORT}/`)
});

export default io;
