import WebSocket, { WebSocketServer } from "ws";
import express, { Response } from 'express'
import prisma from "@repo/db"
const app = express()
app.get('/', (res : Response) => {
    res.send("Server is up and running")
})
const roomData : Map<string, WebSocket[]> = new Map();
const PositionData : Map<[number, number], WebSocket> = new Map()
const httpserver = app.listen(8000);
const wss = new WebSocketServer( {server : httpserver} )

const checkSpace = async(ws : WebSocket, id : string) => {
    const space = await prisma.space.findUnique({
        where : {
            id
        }
    })
    if(!space){
        ws.send(`Space ${id} not found`)
        return false
    }
    return true
}

const handleResponse = async(message : any, ws : WebSocket) => {
    let result;
    switch(message.method){
        case "JOIN":
            result = checkSpace(ws, message.data.spaceId)
            if(!result) return
            roomData.set(message.data.spaceId, [])
            roomData.get(message.data.spaceId)?.push(ws)
            const x = Math.random();
            const y = Math.random();  
            PositionData.set([x, y], ws)
            break;
        case "LEAVE":
            result = checkSpace(ws, message.data.spaceId)
            if(!result) return
            roomData.get(message.data.spaceId)?.filter( data => data!==ws)
            for (const [key, WebSocket] of PositionData.entries()){
                if(WebSocket === ws){
                    PositionData.delete(key);
                    break;
                }
            }
            break;
        case "MOVE":

    }
    if(message.method === 'MOVE'){

    }
}


wss.on('connection', async(ws) => {
    ws.send("Connected Successfully");
    ws.on('error', console.error)
    ws.on('message', (message : string) => {
        const parsedMessage = JSON.parse(message);
        handleResponse(parsedMessage, ws)
    })
})