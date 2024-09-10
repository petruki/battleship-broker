import * as socketio from 'socket.io';
import { addRoom, removeRoom } from './data/rooms.js';
import { addPlayer, getPlayersInRoom, removePlayer, getPlayer } from './data/players.js';

export default class BrokerServer {
    constructor(server) {
        this.io = new socketio.Server(server);
    }

    init() {
        this.io.on('connection', (socket) => {
            socket.on('CHECK_CREATE_ROOM', (req) => this.#onCheckExistingRoom(socket, req));
            socket.on('PLAYER_HAS_JOINED', (req) => this.#onPlayerJoinRoom(socket, req));
            socket.on('PLAYER_HAS_DISCONNECTED', (req) => this.#onPlayerDisconnected(socket, req));
            socket.on('PLAYER_HAS_SHOT', (req) => this.#onPlayerShot(socket, req));
            socket.on('MATCH_STARTED', (req) => this.#onMatchStarted(socket, req));
            socket.on('NEW_ROUND', (req) => this.#onNewRound(socket, req));
        });
    }

    #onCheckExistingRoom(socket, req) {
        try {
            const brokerMessage = JSON.parse(req);
            brokerMessage.exist = false;
    
            if (!brokerMessage.exist) {
                addRoom(brokerMessage.room);
                addPlayer({ id: socket.id, username: brokerMessage.player, room: brokerMessage.room, host: true });
                socket.join(brokerMessage.room);
            }
            
            this.io.to(socket.id).emit(brokerMessage.action, brokerMessage);
        } catch (e) {
            console.log(e);
        }
    }

    #onPlayerJoinRoom(socket, req) {
        try {
            const brokerMessage = JSON.parse(req);
            socket.join(brokerMessage.room);
            addPlayer({ id: socket.id, username: brokerMessage.player, room: brokerMessage.room, host: false });
    
            socket.broadcast.to(brokerMessage.room).emit(brokerMessage.action, req);
            brokerMessage.players = getPlayersInRoom(brokerMessage.room);
            brokerMessage.message = `${brokerMessage.player} has joined`;
            this.io.to(brokerMessage.room).emit('ROOM_DATA', brokerMessage);
        } catch (e) {
            console.log(e);
        }
    }

    #onPlayerDisconnected(socket, req) {
        try {
            const brokerMessage = JSON.parse(req);
            const player = removePlayer(socket.id);
    
            if (player) {
                const playersInRoom = getPlayersInRoom(player.room);
                brokerMessage.players = playersInRoom;
                brokerMessage.message = `${player.username} has disconnected`;
                this.io.to(player.room).emit('ROOM_DATA', brokerMessage);
    
                if (!playersInRoom.length) {
                    removeRoom(player.room);
                } else {
                    this.#updateRotation(player);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    #onMatchStarted(socket, req) {
        try {
            const host = getPlayer(socket.id);
            this.io.to(host.room).emit('MATCH_STARTED');
        } catch (e) {
            console.log(e);
        }
    }

    #onNewRound(socket, req) {
        try {
            const brokerMessage = JSON.parse(req);
            const player = getPlayer(socket.id);
            this.io.to(player.room).emit('NEW_ROUND', brokerMessage);

            const playersInRoom = getPlayersInRoom(player.room);
            playersInRoom.sort(() => Math.random() - 0.5);
            this.io.to(playersInRoom[0].id).emit('SELECT_PLAYER');
        } catch (e) {
            console.log(e);
        }
    }
    
    #onPlayerShot(socket, req) {
        try {
            const brokerMessage = JSON.parse(req);
            const player = getPlayer(socket.id);
            console.log(brokerMessage);

            // update players board
            this.io.to(player.room).emit('PLAYER_HAS_SHOT', brokerMessage);
            this.#updateRotation(player);
        } catch (e) {
            console.log(e);
        }
    }

    #updateRotation(player) {
        try {
            const playersInRoom = getPlayersInRoom(player.room);
            const playerIndex = playersInRoom.findIndex((p) => p.id === player.id);
            
            if (playerIndex + 1 < playersInRoom.length) {
                this.io.to(playersInRoom[playerIndex + 1].id).emit('SELECT_PLAYER');
            } else {
                this.io.to(playersInRoom[0].id).emit('SELECT_PLAYER');
            }
        } catch (e) {
            console.log(e);
        }
    }
}