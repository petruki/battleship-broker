const rooms = [];

const addRoom = (room) => {
    if (!rooms.includes(room)) {
        rooms.push(room);
    }

    return { rooms };
}

const removeRoom = (room) => {
    const index = rooms.indexOf(room);
    if (index >= 0) {
        rooms.splice(index, 1);
    }

    return { rooms };
}

const getRooms = () => {
    return rooms;
}

module.exports = {
    addRoom,
    removeRoom,
    getRooms
}