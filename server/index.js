import express from 'express';
import {Server} from 'socket.io';
import {createServer} from 'http';
import cors from 'cors'


const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());

app.get('/',(req,res)=>{
    res.send("server is up and run")
})

const server = createServer(app);
const io = new Server(server,{
    cors: {
        origin: "http://localhost:3000", 
        methods: ["GET","Post"]
    }
});

io.on("connection", (socket)=>{
    // console.log(socket.id)
    socket.broadcast.emit("welcomeMessage","user has joined the room")
    socket.on("chat",(payload)=>{
        io.emit("chat",payload);
        console.log("chat",payload);
    })
    socket.on("room",(payload)=>{
        socket.join(payload.roomName);
        console.log(`${payload.userName} Joined ${payload.roomName}`)
    })
    socket.on("dis",(payload)=>{
        console.log(payload);
    })
})

server.listen(PORT,()=>console.log(`started port ${PORT}`));