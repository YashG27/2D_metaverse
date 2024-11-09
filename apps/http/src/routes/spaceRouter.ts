import express, { Router } from "express"
import { addElementSchema, createSpaceSchema } from "../types";
import prisma from "@repo/db";
import { userMiddleware } from "../middlewares/authMiddleware";
export const spaceRouter : Router = express.Router();

spaceRouter.post('/',userMiddleware, async(req, res) => {
    try{
        const parsedBody = createSpaceSchema.safeParse(req.body)
        if(!parsedBody.success){
            res.status(400).json({
                message : "Invalid Inputs"
            })
            return
        }
        const { name, dimensions, mapId } = parsedBody.data;
        const width = parseInt(dimensions.split("X")[0] || "");
        const height = parseInt(dimensions.split("X")[1] || "");
        if(!mapId){
            const space = await prisma.space.create({
                data : {
                    name,
                    height,
                    width,
                    creatorid : req.userId!,
                    mapId
                }
            })
            res.status(200).json({
                spaceId : space.id
            })
            return
        }else{
            const map = await prisma.map.findFirst({
                where : {
                    id : mapId
                },
                select : {
                    elements : true,
                    width : true,
                    height : true
                }
            })
            if(!map){
                res.status(400).json({
                    message : "Map not found"
                })
                return
            }

            let space = await prisma.$transaction(async() => {
                const space = await prisma.space.create({
                    data : {
                        name,
                        height,
                        width,
                        creatorid : req.userId!,
                    }
                })
                await prisma.spaceElements.createMany({
                    data: map?.elements.map((elementData) => ({
                        spaceId: space.id,
                        elementId : elementData.elementId!,
                        x: elementData.x!,
                        y: elementData.y!,
                    })),
                });
                return space;
            })
            res.status(200).json({
                message : `Space ${space.id} created`
            })
        } 
    }catch(e){
        res.status(500).json({
            message : "Internal Server error"
        })
        return
    }
})

spaceRouter.delete('/:spaceId',userMiddleware, async(req, res) => {
    const spaceId = req.params.spaceId;
    try{
        const space = await prisma.space.findUnique({
            where : {
                id : spaceId
            },
            select : {
                creatorid : true
            }
        })
        if(!space){
            res.status(400).json({
                message : "Space not found"
            })
            return
        }
        if(req.userId !== space?.creatorid){
            res.status(400).json({
                message : "Unauthorized"
            })
        }
        await prisma.space.delete({
            where : {
                id : spaceId
            }
        })
        res.status(200).json({
            message : `Space ${spaceId} deleted successfully` 
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
        return
    }
})

spaceRouter.get("/all",userMiddleware, async(req, res) => {
    const id = req.userId;
    try{
        const spaces = await prisma.space.findMany({
            where : {
                creatorid : id
            },
            select : {
                id : true,
                name : true,
                width : true,
                height : true,
                thumbnail : true
            }
        })
        res.status(200).json({
            spaces : spaces
        })
    }catch(e){
        res.status(500).json({
            message : "Internal Server error"
        })
        return
    }
})

spaceRouter.get('/:spaceId', async (req, res) => {
    const spaceId = req.params.spaceId;
    try{
        const space = await prisma.space.findUnique({
            where : {
                id : spaceId
            },
            include : {
                elements : {
                    include : {
                        element : true
                    }
                } 
            }
        })
        if(!space){
            res.status(400).json({
                message : "Space not Found"
            })
            return
        }
        res.status(200).json({
            dimensions : `${space.width}x${space.height}`,
            elements : space.elements.map( (element) => ({
                id : element.id,
                element : element.element,
                x : element.x,
                y : element.y
            }))
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
        return
    }
})

spaceRouter.post('/element', userMiddleware, async(req, res) => {
    const parsedBody = addElementSchema.safeParse(req.body)
    if(!parsedBody.success){
        res.status(400).json({
            message : "Invalid Inputs"
        })
        return
    }
    const { elementId, spaceId, x, y } = parsedBody.data;
    try{
        const space = await prisma.space.findUnique({
            where : {
                id : spaceId,
                creatorid : req.userId
            },
        })
        if(!space){
            res.status(400).json({
                message : "Space not found or user unauthorized"
            })
        }
        const spaceElement = await prisma.spaceElements.create({
            data : {
                elementId,
                spaceId,
                x,
                y
            }
        })
        res.status(200).json({
            message : `Space Element ${spaceElement.id} added`
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
        return
    }
})

spaceRouter.delete('/element', userMiddleware, async(req, res) => {
    const id = req.body.id
    const userId = req.userId;
    try{
        const element = await prisma.spaceElements.findUnique({
            where : {
                id
            },
            include : {
                space : true
            }
        })
        if(!element){
            res.status(400).json({
                message : "Element not found"
            })
            return
        }
        if(req.userId !== element.space.creatorid){
            res.status(400).json({
                message : "Unauthorized"
            })
        }
        await prisma.spaceElements.delete({
            where : {
                id
            }
        })
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
        return
    }
})

