// frontend/api/studyplan.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Course {
  id: number;
  course_name: string;
  description: string;
  duration_weeks: number;
  createdAt?: string;
}

export interface StudyPlan {
  id: number;
  plan_name: string;
  user_id: number;
  start_date: string;
  end_date: string;
  weekdays: string[];
  study_time: number;
  course_ids: number[];
  course_settings: Record<string, any>;
  course_count: number;
  created_at?: string;
  updated_at?: string;
  course_details?: Course[];
}

export interface CreateStudyPlanData {
  plan_name: string;
  user_id: number;
  start_date: string;
  end_date: string;
  weekdays: string[];
  study_time: number;
  course_ids?: number[];
  course_settings?: Record<string, any>;
}

// Get all study plans for a user
export const getAllStudyPlans = async (userId: number) => {
  try {
    const response = await api.get(`/studyplan/study-plans?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study plans:', error);
    throw error;
  }
};

// Create a new study plan
export const createStudyPlan = async (planData: CreateStudyPlanData) => {
  try {
    const response = await api.post('/studyplan/study-plans', planData);
    return response.data;
  } catch (error: any) {
    // If the error has a response with data, return it instead of throwing
    if (error.response && error.response.data) {
      return error.response.data;
    }
    console.error('Error creating study plan:', error);
    throw error; // Re-throw if no response data available (network error etc)
  }
};


// Update a study plan
export const updateStudyPlan = async (id: number, planData: Partial<CreateStudyPlanData>) => {
  try {
    const response = await api.put(`/studyplan/study-plans/${id}`, planData);
    return response.data;
  } catch (error) {
    console.error('Error updating study plan:', error);
    throw error;
  }
};

// Delete a study plan
export const deleteStudyPlan = async (id: number) => {
  try {
    const response = await api.delete(`/studyplan/study-plans/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting study plan:', error);
    throw error;
  }
};

// Get registered courses for a user
export const getRegisteredCourses = async (userId: number) => {
  try {
    const response = await api.get(`/registered-courses?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching registered courses:', error);
    throw error;
  }
};

// Get study plan with course details
export const getStudyPlanWithCourses = async (id: number) => {
  try {
    const response = await api.get(`/study-plans/${id}/with-courses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study plan with courses:', error);
    throw error;
  }
};

// Get study plans by user (alternative method with course details)
export const getStudyPlansByUser = async (userId: number) => {
  try {
    const response = await api.get(`/study-plans/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study plans by user:', error);
    throw error;
  }
};

// Get study progress for a plan
export const getStudyProgress = async (planId: number, limit: number = 30) => {
  try {
    const response = await api.get(`/${planId}/progress?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching study progress:', error);
    throw error;
  }
};