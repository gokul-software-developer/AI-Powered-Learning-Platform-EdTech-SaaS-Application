import { z } from "zod";

export const CreateTestSchema = z.object({
    title : z.string(),
    description : z.string(),
    uid : z.string()
});

export const UpdateTestSchema = CreateTestSchema.partial();