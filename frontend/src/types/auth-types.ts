import { CreateUserSchema, LoginUserSchema, updatePasswordRecoverySchema, VerifyUserSchema } from "@/schemas/auth-schemas";
import { z } from "zod";

export type CreateUserTypes = z.infer<typeof CreateUserSchema>;
export type LoginUserTypes = z.infer<typeof LoginUserSchema>;
export type VerifyUserTypes = z.infer<typeof VerifyUserSchema>;
export type updatePasswordRecoverytypes = z.infer<typeof updatePasswordRecoverySchema>;