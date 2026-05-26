import { createBotSchema, createBotServerSchema } from "@/schemas/bots-schemas";
import { z } from "zod";

export type createBotTypes = z.infer<typeof createBotSchema>;
export type CreateBotServerTypes = z.infer<typeof createBotServerSchema>;