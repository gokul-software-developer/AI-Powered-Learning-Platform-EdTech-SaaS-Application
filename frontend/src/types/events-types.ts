import { createEventsSchema, updateEventsSchema } from "@/schemas/events-schemas";
import { z } from "zod";

export type CreateEventTypes = z.infer<typeof createEventsSchema>;
export type UpdateEventTypes = z.infer<typeof updateEventsSchema>;