import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CreateUserTypes } from "@/types/auth-types";
import { Loader, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema } from "@/schemas/auth-schemas";
import { AppErrClient } from "@/utils/app-err";
import { CreateUser } from "@/api/auth";
import { toast } from "@/hooks/use-toast";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCheckSession } from "@/hooks/use-check-session";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { setupRecaptcha, sendOtp } from "../../firebase/otpUtils";

const SIGNUP_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const SignUp = () => {
  const [agreed, setAgreed] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"mobile" | "otp" | "form">("mobile");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0); // For resend OTP button timer
  const [signupStartTime, setSignupStartTime] = useState<number | null>(null);
  const [signupTimeLeft, setSignupTimeLeft] = useState(0); // in seconds

  const navigate = useNavigate();
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<CreateUserTypes>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      mobile: "",
      password: "",
    },
  });

  // Setup Recaptcha once on mount
  useEffect(() => {
    setupRecaptcha("recaptcha-container");
  }, []);

  // Restore session info from localStorage once on mount
  useEffect(() => {
    const savedMobile = localStorage.getItem("mobile");
    const savedStep = localStorage.getItem("otp-step");
    const savedTimestamp = localStorage.getItem("signup-start-time");

    if (savedMobile) form.setValue("mobile", savedMobile);
    if (savedStep === "otp") setStep("otp");
    else if (savedStep === "form") setStep("form");

    if (savedTimestamp) {
      const startTimeNum = Number(savedTimestamp);
      setSignupStartTime(startTimeNum);
      const timePassed = Date.now() - startTimeNum;
      const timeLeft = Math.max(0, Math.floor((SIGNUP_TIMEOUT_MS - timePassed) / 1000));
      setSignupTimeLeft(timeLeft);

      // Reset if expired
      if (timePassed > SIGNUP_TIMEOUT_MS) {
        resetSignupSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manage timers (resend OTP and signup countdown)
  useEffect(() => {
    if (resendTimer > 0 || signupTimeLeft > 0) {
      timerInterval.current = setInterval(() => {
        setResendTimer((t) => (t > 0 ? t - 1 : 0));
        setSignupTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    } else if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    };
  }, [resendTimer, signupTimeLeft]);

  // Reset session on signup timeout
  useEffect(() => {
    if (signupTimeLeft === 0 && signupStartTime) {
      toast({
        title: "Signup session expired",
        description: "Please start again by entering your mobile number.",
        variant: "destructive",
      });
      resetSignupSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signupTimeLeft]);

  // Reset helper function
  const resetSignupSession = () => {
    localStorage.removeItem("otp-timestamp");
    localStorage.removeItem("otp-step");
    localStorage.removeItem("mobile");
    localStorage.removeItem("signup-start-time");
    setStep("mobile");
    setConfirmationResult(null);
    setEnteredOtp("");
    form.reset({
      firstname: "",
      lastname: "",
      mobile: "",
      password: "",
    });
    setAgreed(false);
    setResendTimer(0);
    setSignupStartTime(null);
    setSignupTimeLeft(0);
  };

  const handleSendOtp = async () => {
    const mobile = form.watch("mobile");

    if (!mobile || mobile.length !== 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/auth/check-mobile`, { mobile });
      if (res.data?.status === "exists") {
        toast({
          title: "Mobile Exists",
          description: "This mobile number is already registered.",
          variant: "destructive",
        });
        return;
      }

      const formattedPhone = mobile.startsWith("+") ? mobile : `+91${mobile}`;
      await setupRecaptcha("recaptcha-container");

      const result = await sendOtp(formattedPhone);
      setConfirmationResult(result);

      if (!signupStartTime) {
        const now = Date.now();
        setSignupStartTime(now);
        localStorage.setItem("signup-start-time", now.toString());
        setSignupTimeLeft(Math.floor(SIGNUP_TIMEOUT_MS / 1000));
      }

      localStorage.setItem("mobile", mobile);
      localStorage.setItem("otp-timestamp", Date.now().toString());
      localStorage.setItem("otp-step", "otp");
      setStep("otp");
      setEnteredOtp("");
      setResendTimer(60); // start 60s cooldown for resend button

      toast({
        title: "OTP Sent",
        description: `OTP sent to ${formattedPhone}`,
      });
    } catch (error: any) {
      console.error("❌ Error sending OTP:", error);
      // toast({
      //   title: "OTP Error",
      //   description: error?.response?.data?.message || "Failed to send OTP",
      //   variant: "destructive",
      // });
      toast({
  title: "Verification Error",
  description: "No OTP session found. Please refresh the page and resend OTP.",
  variant: "destructive",
});

    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!confirmationResult) {
        toast({
          title: "Verification Error",
          description: "No OTP session found. Please resend OTP.",
          variant: "destructive",
        });
        return;
      }

      await confirmationResult.confirm(enteredOtp);
      localStorage.removeItem("otp-timestamp");
      localStorage.setItem("otp-step", "form");

      toast({
        title: "Verified",
        description: "Mobile number successfully verified.",
      });

      setStep("form");
    } catch (error) {
      console.error("❌ OTP verification failed:", error);
      toast({
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect or expired.",
        variant: "destructive",
      });
    }
  };

  useCheckSession();

  // const onSubmit = async (values: CreateUserTypes) => {
  //   try {
  //     const response = await CreateUser(values);
  //     if (response) {
  //       toast({
  //         title: "Success",
  //         description: "User has been successfully created",
  //       });
  //       resetSignupSession();
  //       navigate("/feature-selection");
  //     }
  //   } catch (error) {
  //     AppErrClient(error);
  //   }
  // };

  // Format MM:SS timer display
  const onSubmit = async (values: CreateUserTypes) => {
  try {
    console.log("Submitting user creation with values:", values);
    const response = await CreateUser(values);
    console.log("CreateUser response:", response);
    if (response) {
      toast({
        title: "Success",
        description: "User has been successfully created",
      });
      console.log("Calling resetSignupSession");
      resetSignupSession();
      console.log("Navigating to /feature-selection");
      navigate("/feature-selection");
    } else {
      console.log("No response from CreateUser");
    }
  } catch (error) {
    console.error("Error in onSubmit:", error);
    AppErrClient(error);
  }
};

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full flex bg-gradient-to-br from-black via-gray-900 to-green-900 relative overflow-hidden">
      <div id="recaptcha-container" className="hidden" />
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <motion.div
        className="hidden lg:flex flex-col justify-center items-start w-1/2 px-16 text-white relative"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-5xl font-extrabold leading-tight text-white drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          whileHover={{
            scale: 1.02,
            textShadow: "0px 0px 20px rgba(34, 197, 94, 0.8)",
          }}
        >
          People Choose Us for Learning
        </motion.h1>
        <motion.h2 className="text-3xl font-semibold text-green-400 mt-2">
          Congratulations on Your New Journey!
        </motion.h2>
        <motion.p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-md">
          Learning opens the door to limitless opportunities. Let’s build something amazing together!
        </motion.p>
      </motion.div>

      <motion.div
        className="flex justify-center items-center w-full lg:w-1/2 px-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div className="w-full max-w-md bg-black/50 border border-white/20 shadow-xl backdrop-blur-lg p-8 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold text-white">Create an Account</CardTitle>
            <CardDescription className="text-gray-300">Start your learning journey today!</CardDescription>
            {signupTimeLeft > 0 && (
              <p className="mt-1 text-sm text-yellow-400 font-semibold">
                Complete signup in: {formatTime(signupTimeLeft)}
              </p>
            )}
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {(step === "mobile" || step === "otp" || step === "form") && (
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter 10-digit mobile number"
                            type="tel"
                            maxLength={10}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/\D/g, "");
                              if (digitsOnly.length <= 10) field.onChange(digitsOnly);
                            }}
                           // disabled={step !== "mobile"}
                           disabled={step === "form"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {step === "mobile" && (
                  <CardFooter className="flex w-full">
                    <motion.div
                      whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px #22c55e" }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <Button
                        type="button"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleSendOtp}
                      >
                        Get OTP
                      </Button>
                    </motion.div>
                  </CardFooter>
                )}

                {step === "otp" && (
                  <>
                    <Input
                      placeholder="Enter OTP"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                    />
                    <CardFooter className="flex flex-col gap-4 w-full">
                      <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px #22c55e" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full"
                      >
                        <Button
                          type="button"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleVerifyOtp}
                        >
                          Verify Mobile Number
                        </Button>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px #22c55e" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full"
                      >
                        <Button
                          type="button"
                          className="w-full bg-gray-700 hover:bg-gray-800 text-white"
                          disabled={resendTimer > 0}
                          onClick={() => {
                            handleSendOtp();
                          }}
                        >
                          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </>
                )}

                {step === "form" && (
                  <>
                    <FormField
                      control={form.control}
                      name="firstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">First Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="John" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Doe" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                className="bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:ring-green-500 focus:border-green-500"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label="Toggle password visibility"
                              >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(Boolean(checked))}
                      />
                      <label htmlFor="terms" className="text-white text-sm">
                        I agree to the{" "}
                        <Link to="/terms" className="text-green-400 underline">
                          Terms and Conditions
                        </Link>
                      </label>
                    </div>

                    <CardFooter className="flex w-full flex-col gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px #22c55e" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full"
                      >
                        <Button
                          type="submit"
                          disabled={!agreed || form.formState.isSubmitting}
                          variant="default"
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-lg"
                        >
                          {form.formState.isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader className="animate-spin w-4 h-4" />
                              Creating Account...
                            </span>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </motion.div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setStep("otp")}
                        type="button"
                      >
                        Back to OTP
                      </Button>
                    </CardFooter>
                  </>
                )}
              </form>
            </Form>
          </CardContent>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;
