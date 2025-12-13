import ioClient, { type Socket } from 'socket.io-client';
import { writable } from 'svelte/store';

const ENDPOINT = 'http://localhost:5173';

/**
 * Socket Connection Singleton
 *
 * This is a singleton class that manages a single WebSocket connection across your entire app.
 * It prevents multiple socket connections and provides room management for chat functionality.
 *
 * @example
 * ```typescript
 * import { socketConnection } from '$lib/ws-connection';
 * import { onMount } from 'svelte';
 *
 * // In your component
 * onMount(() => {
 *   // Join a chat room
 *   socketConnection.joinRoom('chat-id-123');
 *
 *   // Listen for messages
 *   const handler = (message) => {
 *     console.log('Received message:', message);
 *   };
 *   socketConnection.on('message', handler);
 *
 *   // Cleanup
 *   return () => {
 *     socketConnection.off('message', handler);
 *     socketConnection.leaveRoom('chat-id-123');
 *   };
 * });
 *
 * // Send a message
 * socketConnection.emit('message', { text: 'Hello!' });
 * ```
 */

class SocketConnection {
	private socket: Socket | null = null;
	private currentRoom: string | null = null;
	public connected = writable(false);

	private ensureConnection(): Socket {
		if (!this.socket) {
			this.socket = ioClient(ENDPOINT, {
				withCredentials: true
			});

			this.socket.on('connect', () => {
				this.connected.set(true);
				if (this.currentRoom) {
					this.socket!.emit('join', this.currentRoom);
				}
			});

			this.socket.on('disconnect', () => {
				this.connected.set(false);
			});
		}

		return this.socket;
	}

	public joinRoom(chatId: string): void {
		const socket = this.ensureConnection();
		if (this.currentRoom && this.currentRoom !== chatId) {
			socket.emit('leave', this.currentRoom);
		}
		this.currentRoom = chatId;
		socket.emit('join', chatId);
	}

	public leaveRoom(chatId: string): void {
		if (this.socket && this.currentRoom === chatId) {
			this.socket.emit('leave', chatId);
			this.currentRoom = null;
		}
	}

	public on(event: string, handler: (...args: any[]) => void): void {
		const socket = this.ensureConnection();
		socket.on(event, handler);
	}

	public off(event: string, handler?: (...args: any[]) => void): void {
		if (this.socket) {
			if (handler) {
				this.socket.off(event, handler);
			} else {
				this.socket.off(event);
			}
		}
	}

	public emit(event: string, ...args: any[]): void {
		const socket = this.ensureConnection();
		socket.emit(event, ...args);
	}

	public disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
			this.currentRoom = null;
			this.connected.set(false);
		}
	}

	public getSocket(): Socket | null {
		return this.socket;
	}
}

export const socketConnection = new SocketConnection();
