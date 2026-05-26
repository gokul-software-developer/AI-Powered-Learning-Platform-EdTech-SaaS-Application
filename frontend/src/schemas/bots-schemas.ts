import { z } from "zod";

export const createBotSchema = z.object({
    title : z.string().max(255, {
        message : "title should not be more than 255 characters"
    }),
    description : z.string().max(3000, {
        message : "description should not be more than 3000 characters"
    }).optional(),
    fileUrl : z.array(z.any())
});

export const createBotServerSchema = z.object({
    title : z.string().max(255, {
        message : "title should not be more than 255 characters"
    }),
    description : z.string().max(3000, {
        message : "description should not be more than 3000 characters"
    }).optional(),
    fileUrl : z.array(z.any()),
    userId : z.string()
});