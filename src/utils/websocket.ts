import WebSocket from 'ws';
import http from 'http';
import { IPixel } from '../models/pixel';

class Ws {
  wss: WebSocket.Server;

  // eslint-disable-next-line no-spaced-func
  private onMessage = new Map<string, (data: any, ws: WebSocket, uuid: string | undefined) => void>();

  rooms = new Map<string, Map<string | undefined, WebSocket>>();

  constructor(server: http.Server) {
    this.setOnMessageOperations();

    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws: WebSocket, request: http.IncomingMessage) => {
      const uuid = request.url;
      console.log(`websocket user: ${uuid}`);

      ws.on('message', (data) => {
        const parsedData = JSON.parse(data.toString());
        console.log(parsedData);
        const operation = this.onMessage.get(parsedData.type);
        if (operation) {
          operation(parsedData, ws, uuid);
        }
      });

      ws.on('close', () => {
        console.log(`websocket user disconnect: ${uuid}`);
        this.rooms.forEach((v, room) => this.leaveRoom(room, uuid));
      });
    });
  }

  setOnMessageOperations = () => {
    this.onMessage.set('room', (data, ws, uuid) => {
      const { operation, room } = data;

      if (operation === 'join') {
        if (!this.rooms.has(room)) {
          this.rooms.set(room, new Map());
        }

        if (!this.rooms.get(room)?.has(uuid)) {
          this.rooms.get(room)?.set(uuid, ws);
          console.log('joined room');
        }
      } else if (operation === 'leave') {
        this.leaveRoom(room, uuid);
      }
    });
  };

  createPixelsMessage = (pixels: IPixel[]): string => this.createMessage('pixels', pixels);

  private createMessage = (type: string, dataInside: any): string => {
    const message = {
      type,
      data: dataInside,
    };

    return JSON.stringify(message);
  };

  private leaveRoom = (room: string, uuid: string | undefined) => {
    if (!this.rooms.get(room)?.has(uuid)) {
      return;
    }

    if (this.rooms.get(room)?.keys.length === 1) {
      this.rooms.delete(room);
    } else {
      this.rooms.get(room)?.delete(uuid);
    }
  };

  public sendPixelsToUsers = (placeName: string, pixels: IPixel[]) => {
    const pixelsMessage = this.createPixelsMessage(pixels);
    this.rooms.get(placeName)?.forEach((socket) => {
      socket.send(pixelsMessage);
    });
  };
}

let ws: Ws;

const initializeWebSocket = (server: http.Server) => {
  ws = new Ws(server);
};

export { initializeWebSocket, ws };
