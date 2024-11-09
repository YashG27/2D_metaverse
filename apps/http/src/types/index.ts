import z, { ParseStatus } from "zod"

export const signupSchema = z.object({
    username : z.string().email(),
    password : z.string(),
    role : z.enum(['User', 'Admin'])
})

export const signinSchema = z.object({
    username : z.string().email(),
    password : z.string()
})

export const createSpaceSchema = z.object({
    name : z.string(),
    dimensions : z.string(),
    mapId : z.string()
})

export const addElementSchema = z.object({
    elementId : z.string(),
    spaceId : z.string(),
    x : z.number(),
    y : z.number()
})

export const createElementSchema = z.object({
    imageUrl : z.string(),
    width : z.number(),
    height : z.number(),
    static : z.boolean()
})

export const updateElementSchema = z.object({
    imageUrl : z.string()
})

export const createAvatarSchema = z.object({
    imageUrl : z.string(),
    name : z.string()
})  

export const createMapSchema = z.object({
    thumbnail : z.string(),
    dimensions : z.string(),
    name : z.string(),
    defaultElements : z.array(z.object({
        elementId : z.string(),
        x : z.number(),
        y : z.number()
    }))
})

declare global {
    namespace Express {
      export interface Request {
        role?: "Admin" | "User";
        userId?: string;
      }
    }
}

