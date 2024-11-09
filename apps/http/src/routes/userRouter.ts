import express, { Router } from "express"
import { userMiddleware } from "../middlewares/authMiddleware";
import prisma from "@repo/db";

export const userRouter : Router = express.Router();

userRouter.post('/metadata', userMiddleware , async(req, res) => {
    const { userId, avatarId } = req.body;
    try {
        const user = await prisma.user.update({
            where : {
                id : userId
            },
            data : {
                avatarId
            }
        })
        res.status(200).json({
            message : "User metadata updated successfully"
        })
    }catch(e : any){
        res.status(500).json({
            message : e.message
        })
    }
})

userRouter.get('/metadata/bulk', async(req, res) => {
    const ids : string[] = req.query.ids as string[]
    try{
        const user = await prisma.user.findMany({
            where : {
                id : {
                    in : ids
                }
            },
            select : {
                avatar : true,
                id : true
                }
        })
        res.status(200).json({
            avatars : user.map( (data) => {
                return {userId : data.id,
                imageUrl : data.avatar?.imageUrl}
            })
        })
    }catch(e){
        res.status(500).json({
            message : "Internal Server error"
        })
    }
})
