import { CreateTestSchema, UpdateTestSchema } from "@/schemas/test-schemas";
import { z } from "zod";

export type CreateTestTypes = z.infer<typeof CreateTestSchema>;
export type UpdateTestTypes = z.infer<typeof UpdateTestSchema>;