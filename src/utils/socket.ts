import { Server } from "socket.io";

let _io: Server;

export const initSocket = (io: Server) => {
  _io = io;
};

export const getSocket = () => {
  if (!_io) {
    throw new Error("Socket.io not initialized");
  }
  return _io;
};