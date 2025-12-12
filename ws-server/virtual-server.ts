import http from 'http';
import express from 'express';
import injectSocketIO from './socket-io-handler.js';
import { handler } from '../build/handler.js';

const app = express();
const server = http.createServer(app);

injectSocketIO(server);

app.use(handler);

server.listen(3000, () => {
	console.log('Running on http://localhost:5173');
});
