import { z } from "zod";


export const CreateUserSchema = z.object({
  firstname: z
    .string()
    .max(50, {
      message: "First name is too large, maximum is 50 characters.",
    })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "First name must only contain letters and spaces.",
    }),

  lastname: z
    .string()
    .max(50, {
      message: "Last name is too large, maximum is 50 characters.",
    })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Last name must only contain letters and spaces.",
    }),


    
  mobile: z
    .string()
    .length(10, {
      message: "Mobile number must be exactly 10 digits.",
    })
    .regex(/^[0-9]+$/, {
      message: "Mobile number must contain only digits.",
    }),

  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long.",
    })
    .max(80, {
      message: "Password must be less than 80 characters.",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one digit.",
    })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    }),
});

export const LoginUserSchema = z.object({
  mobile: z
    .string()
    .length(10, { message: "Mobile number must be exactly 10 digits." })
    .regex(/^\d{10}$/, { message: "Mobile number must contain only digits." }),

  password: z
    .string()
    .min(6, { message: "Password is too short." })
    .max(80, { message: "Password is too long." }),
});



export const VerifyUserSchema = z.object({
    userId : z.string(),
    secret : z.string()
});
export const sendOTPSchema = z.object({
  mobile: z
    .string()
    .length(10, {
      message: "Mobile number must be exactly 10 digits.",
    })
    .regex(/^[0-9]+$/, {
      message: "Mobile number must contain only digits.",
    })
    .refine(value => value.length === 10, {
      message: "Please enter a valid 10-digit mobile number.",
    }),
});


export const updatePasswordRecoverySchema = z.object({
    password : z.string().min(6, {
        message : "Password is too short"
    }).max(80, {
        message : "Exceeded the limits, try shorter"
    }),
    confirmpassword : z.string().min(6, {
        message : "Password is too short"
    }).max(80, {
        message : "Exceeded the limits, try shorter"
    })
})