const socketio = require('socket.io');
const { addRoom, getRooms, removeRoom } = require('./data/rooms');
const { addPlayer, getPlayersInRoom, removePlayer, getPlayer } = require('./data/players');

class BrokerServer {
    constructor(server) {
        this.io = socketio(server);
        this.init(); 
    }

    init() {
        this.io.on('connection', (socket) => {
            socket.on('CHECK_CREATE_ROOM', (req) => this.onCheckExistingRoom(socket, req));
            socket.on('PLAYER_HAS_JOINED', (req) => this.onPlayerJoinRoom(socket, req));
            socket.on('PLAYER_HAS_DISCONNECTED', (req) => this.onPlayerDisconnected(socket, req));
            socket.on('MATCH_STARTED', (req) => this.onMatchStarted(socket, req));
        });
    }

    onCheckExistingRoom(socket, req) {
        const brokerMessage = JSON.parse(req);
        brokerMessage.exist = getRooms().includes(brokerMessage.room);

        if (!brokerMessage.exist) {
            addRoom(brokerMessage.room);
            addPlayer({ id: socket.id, username: brokerMessage.player, room: brokerMessage.room, host: true });
            socket.join(brokerMessage.room);
        }
        
        this.io.to(socket.id).emit(brokerMessage.action, brokerMessage);
    }

    onPlayerJoinRoom(socket, req) {
        const brokerMessage = JSON.parse(req);
        socket.join(brokerMessage.room);
        addPlayer({ id: socket.id, username: brokerMessage.player, room: brokerMessage.room, host: false });

        socket.broadcast.to(brokerMessage.room).emit(brokerMessage.action, req);
        brokerMessage.players = getPlayersInRoom(brokerMessage.room);
        brokerMessage.message = `${brokerMessage.player} has joined`;
        this.io.to(brokerMessage.room).emit('ROOM_DATA', brokerMessage);
    }

    onPlayerDisconnected(socket, req) {
        const brokerMessage = JSON.parse(req);
        const player = removePlayer(socket.id);

        if (player) {
            const playersInRoom = getPlayersInRoom(brokerMessage.room);
            brokerMessage.players = playersInRoom;
            brokerMessage.message = `${player.username} has disconnected`;
            this.io.to(player.room).emit('ROOM_DATA', brokerMessage);

            if (!playersInRoom.length) {
                removeRoom(player.room);
            }
        }
    }

    onMatchStarted(socket, req) {
        const host = getPlayer(socket.id);
        this.io.to(host.room).emit('MATCH_STARTED');
    }
}

module.exports = BrokerServer;