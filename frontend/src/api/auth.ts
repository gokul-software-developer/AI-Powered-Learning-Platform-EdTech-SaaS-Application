import { LoginUserTypes } from '@/types/auth-types';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ✅ Check if mobile exists (during signup)
export async function checkMobileExists(mobile: string) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/check-mobile`, { mobile }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error checking mobile number');
  }
}

// ✅ Create a new user (signup)
export async function CreateUser(values: { firstname: string; lastname: string; mobile: string; password: string }) {
  try {
    console.log("Sending values:", values);
    const response = await axios.post(`${BASE_URL}/auth/signup`, values, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Signup error:", error.response?.data || error.message);
    throw error;
  }
}

// ✅ Login a user
export const LoginUser = async (data: LoginUserTypes) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
    throw new Error(errorMessage);
  }
};

// ✅ Get current session
export const GetCurrentSession = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/session/check-session`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      return { loggedIn: false };
    }
    throw new Error(error.response?.data?.message || "Failed to get session");
  }
};

// ✅ Logout user
export const LogoutUser = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    throw new Error(errorMessage);
  }
};

// ✅ Check mobile for forgot password flow
export async function checkMobileForReset(mobile: string) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/forgot/check-mobile`, { mobile }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error checking mobile number for reset');
  }
}

// ✅ Reset password
export const resetPassword = async (mobile: string, newPassword: string) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
      mobile,
      newPassword,
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to reset password");
  }
};

// ===============================
// TODO/TASK FUNCTIONS
// ===============================

export const getAllTasks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/todos`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch tasks");
  }
};

export const createTask = async (task: { title: string; time: string; description: string }) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/todos`, task, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create task");
  }
};

export const updateTask = async (
  id: number,
  task: { title: string; time: string; description: string }
) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/todos/${id}`, task, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update task");
  }
};

export const deleteTask = async (id: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/todos/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete task");
  }
};

// Get all study plans for a user - UPDATED
export const getAllStudyPlans = async (userId: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/study-plans?userId=${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch study plans');
  }
};

// Create a new study plan - UPDATED
export const createStudyPlan = async (plan: {
  user_id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  weekdays: string[];
  study_time: number;
  course_ids?: number[];
  course_settings?: Record<string, any>;
}) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/study-plans`, plan, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create study plan");
  }
};

// Update a study plan - UPDATED
export const updateStudyPlan = async (
  id: number,
  plan: {
    plan_name?: string;
    start_date?: string;
    end_date?: string;
    weekdays?: string[];
    study_time?: number;
    course_ids?: number[];
    course_settings?: Record<string, any>;
  }
) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/study-plans/${id}`, plan, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update study plan");
  }
};

export const deleteStudyPlan = async (id: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/study-plans/${id}`, {
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete study plan')
  }
}

// Get registered courses for a user - NEW
export const getRegisteredCourses = async (userId: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/studyplan/registered-courses?userId=${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch registered courses");
  }
};

// Get study plan with course details - NEW
export const getStudyPlanWithCourses = async (id: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/study-plans/${id}/with-courses`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch study plan with courses");
  }
};

// Get study plans by user (with course details) - NEW
export const getStudyPlansByUser = async (userId: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/study-plans/user/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch study plans by user");
  }
};

// Get study progress for a plan - NEW
export const getStudyProgress = async (planId: number, limit: number = 30) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/${planId}/progress?limit=${limit}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch study progress");
  }
};

// 🔒 Future placeholders for OTP/OAuth (if needed)
export const createVerification = async () => { /* implement when ready */ };
export const LoginOauthgoogle = async () => { /* implement when ready */ };
export const updateVerification = async () => { /* implement when ready */ };
export const updatePasswordRecovery = async () => { /* implement when ready */ };
export const createPasswordRecovery = async () => { /* implement when ready */ };