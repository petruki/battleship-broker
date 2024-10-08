const players = [];

export const addPlayer = ({ id, username, room }) => {
    // Check existing players
    const existingUser = players.find((player) => {
        return player.room === room && player.username === username
    });

    // Validate player name
    if (existingUser) {
        return {
            error: 'Player name is in use!'
        };
    }

    // Store player
    const player = { id, username, room };
    players.push(player);
    return { player };
}

export const removePlayer = (id) => {
    const index = players.findIndex((player) => player.id === id);

    if (index !== -1) {
        return players.splice(index, 1)[0];
    }
}

export const getPlayer = (id) => {
    return players.find((player) => player.id === id);
}

export const getPlayersInRoom = (room) => {
    room = room.trim();
    return players.filter((player) => player.room === room);
}