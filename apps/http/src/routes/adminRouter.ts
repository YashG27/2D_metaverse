import express, { Router } from "express"
import { adminMiddleware } from "../middlewares/authMiddleware"
import { createAvatarSchema, createElementSchema, createMapSchema } from "../types"
import prisma from "@repo/db"
import { string } from "zod"

export const adminRouter : Router = express.Router()

adminRouter.use(adminMiddleware)
adminRouter.post('/element', async(req, res) => {
    const parsedBody = createElementSchema.safeParse(req.body);
    if(!parsedBody.success){
        res.status(400).json({
            message : "Inavlid Inputs"
        })
        return
    }
    const { imageUrl, width, height} = parsedBody.data;
    const elementStatic = parsedBody.data.static;
    try{
        const element = await prisma.element.create({
            data : {
                imageUrl,
                width,
                height,
                static : elementStatic
            }
        })
        res.status(200).json({
            message : `Element ${element.id} created`
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
        return
    }
})

adminRouter.put('/element/:elementId', async(req, res) => {
    const elementId = req.params.elementId;
    const imageUrl = req.body;
    if(!imageUrl || imageUrl !== string){
        res.status(400).json({
            message : "Invalid Inputs"
        })
    }
    try { 
        await prisma.element.update({
            where : {
                id : elementId
            },
            data : {
                imageUrl
            }
        })

        res.status(200).json({
            message : `Element ${elementId} updated`
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
        return
    }
})

adminRouter.post('/avatar', async(req, res) => {
    const parsedBody = createAvatarSchema.safeParse(req.body);
    if(!parsedBody.success){
        res.status(400).json({
            message : "Inavlid Inputs"
        })
        return
    }
    const {imageUrl, name} = parsedBody.data
    try {
        const avatar = await prisma.avatar.create({
            data : {
                imageUrl,
                name
            }
        })

        res.status(200).json({
            message : `Avatar ${avatar.id} created`
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })  
        return
    }
})

adminRouter.post('/map', async(req, res) => {
    const parsedBody = createMapSchema.safeParse(req.body);
    if(!parsedBody.success){
        res.status(400).json({
            message : "Inavlid Inputs"
        })
        return
    }
    const { thumbnail, dimensions, name, defaultElements } = parsedBody.data
    const width = parseInt(dimensions.split("x")[0]!);
    const height = parseInt(dimensions.split("x")[1]!);
    try{    
        const map = await prisma.$transaction(async() => {
            const map = await prisma.map.create({
                data : {
                    name,
                    width,
                    height,
                    thumbnail
                }
            })


            prisma.mapElements.createMany({
                data : defaultElements.map( e => ({
                    mapId : map.id,
                    elementId : e.elementId,
                    x : e.x,
                    y : e.y
                }))
            })
            return map
        })
        res.status(200).json({
            id : map.id
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
        return
    }
})