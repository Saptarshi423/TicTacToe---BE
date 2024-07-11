// list of required dependencies.
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const URL = "http://localhost:3000";
app.use(cors({ origin: URL }));
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: URL });
//helper function imports
const {numOfUserConnectedMoreThanTwo, modifyInput, findUserConnectedToSameRoom, generateNewColor} = require('./helper')

// map the socket instance to selected room.
let usertoRoomMapping = new Map();

// TODO: need to find out a generic way to store the user id in a differentiated manner.
//user id
let user_id = 1; 

app.use(cors({ origin: URL }));

io.on("connection", (socket) => {
  console.log(socket.id+" connected");

  // on click event.
  socket.on("clicked", (arg) => {
    try {
      const value = usertoRoomMapping.get(socket.id); //get socket details based on socket id.

      if(value){
        let userListConnectedToSameRoom = findUserConnectedToSameRoom(socket.id, usertoRoomMapping);
        const connectedToRoom  = value.room;

        let inputState = arg.input;
        modifyInput(inputState)

        io.to(...userListConnectedToSameRoom).emit("broadcastClick",{inputState, turn : arg["turn"] === 'X' ? 'O' : 'X'})
      }
    } catch (error) {
      console.log(error)
    }
  });

  //on win event.
  socket.on("win_Event", (arg) => {
    try {
      const value = usertoRoomMapping.get(socket.id); //get socket details based on socket id.
      if(value){
        console.log("Specific socket already connected..getting the room number and broadcasting the clicked event value to the sockets connected to this room..");
        const connectedToRoom  = value.room;

        io.to(connectedToRoom).emit("broadcast_winEvent", arg)
      }
    } catch (error) {
      console.log(error)
    }
  });

  // on reset event.
  socket.on("reset_Event", (arg) => {
    try {
      const value = usertoRoomMapping.get(socket.id); //get socket details based on socket id.
      if(value){
        console.log("Specific socket already connected..getting the room number and broadcasting the clicked event value to the sockets connected to this room..");
        const connectedToRoom  = value.room;

        io.to(connectedToRoom).emit("broadcast_resetEvent")
      }
    } catch (error) {
      console.log(error)
    }
  });

  // on joining a specific room
  socket.on("join_room_Event", (arg) => {
    let { roomNumber } = arg;
    let room = "Room Number " + roomNumber; // room number string

    // NOTE: Currently setting the max number of user 
    // to 2 that can connected to a room
    if(numOfUserConnectedMoreThanTwo(usertoRoomMapping, room)){
      io.to(socket.id).emit("broadcast_user_overflow");
      return;
    }

    socket.join(room); // join the user to the specific room.
    usertoRoomMapping.set(socket.id, { id: user_id++, room: room, color:generateNewColor() }); // map the socket and room number.
    
    

    // inform other connected sockets on a new connection.
    usertoRoomMapping.forEach((value, key) => {
      if ((key !== socket.id) && (room === value.room)) {
        console.log("FOUND DIFFERENT SOCKET CONNECTED TO THE SAME ROOM, SENDING CONNECTION SUCCESS RESPONSE TO THE OTHER WEB CLIENT");

        io.to(key).emit("broadcast_socketToRoom_connected", {
          msg: ` Client ${socket.id} joined...`,
          user_id: usertoRoomMapping.get(socket.id).id,
        });
      }
    });

    //inform the specific client that it's connected to the room
    io.to(socket.id).emit("test", {
      msg: "You are now succesfully connected to" + room,
      color: usertoRoomMapping.get(socket.id).color
    });
  });

  // disconnect event.
  socket.on("disconnect", () => {
    console.log("Disconnecting socket id ", socket.id);
    let user = findUserConnectedToSameRoom(socket.id, usertoRoomMapping);

    usertoRoomMapping.delete(socket.id);
    console.log(usertoRoomMapping)
    if(user){
      io.to(...user).emit("client_disconnected_Event", {msg:"The other player disconnected."}); // inform the second player the other one left/disconnected.
    }

  });
});

httpServer.listen(8080, () => {
  console.log("HTTP SERVER LISTENING AT PORT 5050");
});
