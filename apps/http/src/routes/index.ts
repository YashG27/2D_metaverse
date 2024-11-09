import express, { Router } from 'express';
import { userRouter } from './userRouter';
import { spaceRouter } from './spaceRouter';
import { adminRouter } from './adminRouter';
import { signinSchema, signupSchema } from '../types';
import prisma from '@repo/db';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
export const mainRouter : Router = express.Router();


mainRouter.post('/signup' ,async (req, res) => {
    const body = signupSchema.safeParse(req.body)
    if(!body.success){
        res.status(400).json({
            message : "Invalid inputs"
        })
        return 
    }
    try{
        const { username, role} = body.data;
        const password = await bcrypt.hash(body.data.password, 10)
        const user = await prisma.user.create({
            data : {
                username,
                password,
                role
            }
        })
        res.json({
            userId : user.id
        })
        return
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
})

mainRouter.post('/signin', async(req, res) => {
    const body = signinSchema.safeParse(req.body)
    if(!body.success){
        res.status(400).json({
            message : "Invalid Inputs"
        })
        return
    }
    const {username, password} = body.data;
    try{
        const user = await prisma.user.findFirst({
            where : {
                username : username 
            }
        })
        if(!user){
            res.status(400).json({
                message : "User does not exits"
            })
            return
        }
        if(!(await bcrypt.compare(password, user.password))){
            res.status(400).json({
                message : "Incorrect password"
            })
        }
        const token = jwt.sign({
            id : user.id,
            role : user.role
        }, "JWT_SECRET");
        
        res.cookie("token", token, {
            secure : true,
            sameSite : 'lax',
        });

        res.status(200).json({
            message : "Logged in Successfully!"
        })
    }catch(e){
        res.status(500).json({
            message : "Internal Server Error"
        })
    }
})

mainRouter.get('/avatars', async(req, res) => {
    try{
        const avatars = await prisma.avatar.findMany({})
        res.status(200).json({
            avatars
        })
    }catch(e){
        res.status(500).json({
            message : "Internal Server error"
        })
    }
})

mainRouter.use('/elements', (req, res) => {
    
})

mainRouter.use('/admin', adminRouter)
mainRouter.use("/user", userRouter);
mainRouter.use('space', spaceRouter);
