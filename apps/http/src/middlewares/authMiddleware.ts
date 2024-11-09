import { NextFunction, Request, Response } from "express"
import jwt, { decode } from 'jsonwebtoken'
import { string } from "zod";

const authCheck = (req : Request, res : Response) => {
    const token = req.cookies.token;
    if(!token){
        res.status(400).json({
            message : "Unauthorized"
        })
        return
    }
    const decoded = jwt.verify(token.id, "JWT_SECRET") as string;
    if(!decoded){
        res.status(400).json({
            message : "Unauthorized"
        })
    }
    req.userId = decoded;
    req.role = req.cookies.role
}
export const userMiddleware = (req : Request, res : Response, next : NextFunction) => {
    authCheck(req, res);
    next();
}

export const adminMiddleware = (req : Request, res : Response, next : NextFunction) => {
    authCheck(req, res)
    if(req.cookies.token.role !== "Admin"){
        res.status(400).json({
            message : "Unauthorized"
        })
    }
    next();
}