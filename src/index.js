import express from 'express';
import http from 'http';
import BrokerServer from './broker-server.js';

const app = express();
const port = process.env.PORT;
const server = http.createServer(app);

server.listen(port, () => {
    new BrokerServer(server).init();
    console.log('Server is up on port ' + port);
});