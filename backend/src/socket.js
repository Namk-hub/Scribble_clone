import io from "./index"

io.on("connection",(socket)=>{
  console.log("user connected successfully",socket.id)
  socket.on("disconnect",()=>{
    console.log("user disconnected !",socket.id)
  })
})