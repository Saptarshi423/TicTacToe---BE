
/**
 * @param {Map} usertoRoomMapping - The user to room map.
 * @param {string} connectedRoom - The name of the room to which the web client wants to connect.
 */
const numOfUserConnectedMoreThanTwo = (usertoRoomMapping, connectedRoom) => {
  let users = 0;
  usertoRoomMapping.forEach((value, key) => {
    if (value.room === connectedRoom) {
      users++;
    }
  });

  if (users >= 2) return true;
  return false;
};

const modifyInput = (input)=>{
  Object.keys(input).forEach((key)=>{
    if((input[Number(key)].val.length === 0)){
      input[Number(key)].color = "blue";
    }
  });
  //console.log(input)
}

const findUserConnectedToSameRoom = (incomingConnID, usertoRoomMapping)=>{
  let users = [];
  let {room} = usertoRoomMapping.get(incomingConnID);

  usertoRoomMapping.forEach((value, key) => {
    if ((value.room === room) && (incomingConnID !== key)) {
      users.push(key); // collect the socket id.
    }
  });
  return users;
}

function generateNewColor() {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  return `rgb(${red}, ${green}, ${blue}, 1)`;
}

module.exports = {numOfUserConnectedMoreThanTwo, modifyInput, findUserConnectedToSameRoom, generateNewColor}