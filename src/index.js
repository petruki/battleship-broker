const express = require('express');
const app = express();

const http = require('http');
const BrokerServer = require('./broker-server');

const port = process.env.PORT;
const server = http.createServer(app);

server.listen(port, () => {
    new BrokerServer(server);
    console.log('Server is up on port ' + port);
});