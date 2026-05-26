import { CreatestudyPlanSchema, UpdateStudyPlanSchema } from "@/schemas/study-schemas";
import { z } from "zod";

export type CreatestudyPlanTypes = z.infer<typeof CreatestudyPlanSchema>;
export type UpdateStudyPlanTypes = z.infer<typeof UpdateStudyPlanSchema>;