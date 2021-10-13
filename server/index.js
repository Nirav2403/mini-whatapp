import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import moment from 'moment';


const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
let userData = [];

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "Post"],
        credentials: true,
        transports: ["websocket", "polling"],
      },
      allowEIO3: true,
});

io.on("connection", (socket) => {
    // console.log(socket.id)
    socket.broadcast.emit("welcomeMessage", "user has joined the room")
    socket.on("ChatMessage", (payload) => {
        console.log("ChatMessage", payload)
        const user = getCurrentUser(socket.id);
        console.log("===========================", user)
        io.to(user.roomName).emit("ChatMessage",formateMessage(user.userName,payload))
    })
    socket.on("JoinRoom", (payload) => {
        console.log(payload)
        const { userName, roomName } = payload
        const userJoin = JoinRoom(userName, roomName, socket.id)
        console.log("============",userJoin)
        socket.join(userJoin.roomName);
        socket.broadcast.to(userJoin.roomName).emit("ChatMessage", formateMessage("admin",`${userJoin.userName} is joined ${userJoin.roomName}`))
        io.to(userJoin.roomName).emit("roomUser", {
            room: userJoin.roomName,
            users: roomUserList(userJoin.roomName)
        })
    })
    socket.on("disconnect", () => {
        const userLeft = leaveRoom(socket.id);
        if(userLeft){
            io.to(userLeft.roomName).emit("ChatMessage",formateMessage(
                `${userLeft.userName} has left the chat and room..`
              ))
        }
    })
});

const JoinRoom = (userName, roomName, id) => {
    const user = { userName, roomName, id }
    userData.push(user);
    return user;
}


const getCurrentUser = (id) => {
    console.log("getCurrentuserId", id);
    
    return userData.find((user) => user.id === id);
};

const formateMessage = (userName = "admin", msg) => {
    console.log(msg)
    return {
        userName,
        msg,
        time: moment().format("h:mm a"),
    };
};

const leaveRoom = (id) => {
    const leftUser = userData.find((user) => user.id === id);
    const removeUser = userData.filter((user) => user.id !== leftUser.id);
    userData = [...removeUser];
    return leftUser;
}

const roomUserList = (roomName)=>{
    console.log("roomList",roomName)
    const users = userData.filter(user=> user.roomName === roomName).map(user=> user.userName);
    console.log(users)
    return users;
  }
server.listen(PORT, () => console.log(`started port ${PORT}`));