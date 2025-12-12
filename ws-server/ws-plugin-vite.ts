import type { ViteDevServer } from 'vite';
import type { Server as HTTPServer } from 'node:http';

export const webSocketServer = {
	name: 'webSocketServer',
	configureServer(vite: ViteDevServer) {
		const http = vite.httpServer as HTTPServer | null;
		if (!http) {
			console.warn('httpServer is null, skipping socket init');
			return;
		}
		import('./socket-io-handler').then(({ default: injectSocketIO }) => {
			injectSocketIO(http);
		});
	}
};
