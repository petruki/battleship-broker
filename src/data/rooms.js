const rooms = [];

export const addRoom = (room) => {
    if (!rooms.includes(room)) {
        rooms.push(room);
    }

    return { rooms };
}

export const removeRoom = (room) => {
    const index = rooms.indexOf(room);
    if (index >= 0) {
        rooms.splice(index, 1);
    }

    return { rooms };
}

export const getRooms = () => {
    return rooms;
}