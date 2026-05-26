import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  getAllStudyPlans,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
} from '@/api/studyplan';

// Types
export interface StudyPlan {
  id: number;
  plan_name: string;
  user_id: number;
  start_date: string;
  end_date: string;
  weekdays: string[];
  study_time: number;
}

export interface StudyLog {
  date: string;
  minutesStudied: number;
  completed: boolean;
  planId: number;
}

interface WeekdaysObj {
  [key: string]: boolean;
}

interface PlanForm {
  plan_name: string;
  start_date: string;
  end_date: string;
  study_time: number;
  weekdays: WeekdaysObj;
}

export const useStudyPlan = (userId?: number) => {  // make userId optional
  // form state for create/edit plans
  const [planForm, setPlanForm] = useState<PlanForm>({
    plan_name: '',
    start_date: '',
    end_date: '',
    study_time: 60,
    weekdays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      .reduce((acc, d) => ({ ...acc, [d]: true }), {} as WeekdaysObj),
  });

  // state management
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [todayStudied, setTodayStudied] = useState(0);

  const getPlanStatus = useCallback(
    (startDate: string, endDate: string): 'upcoming' | 'active' | 'completed' => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (now < start) return 'upcoming';
      if (now > end) return 'completed';
      return 'active';
    },
    []
  );

  const fetchPlans = useCallback(async () => {
    if (!userId) return;  // early exit if no userId
    setLoading(true);
    setError('');
    try {
      const data = await getAllStudyPlans(userId);
      console.log('Fetched plans:', data); // debugging
      const plansArray: StudyPlan[] = data.plans || data.studyPlans || data || [];
      setPlans(plansArray);

      const active = plansArray.find(plan =>
        getPlanStatus(plan.start_date, plan.end_date) === 'active'
      );
      setActivePlan(active || null);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError('Failed to fetch plans: ' + (err.message || String(err)));
      setActivePlan(null);
    } finally {
      setLoading(false);
    }
  }, [userId, getPlanStatus]);

  const fetchStudyLogs = useCallback(async () => {
    if (!userId) {
      setStudyLogs([]);
      setTodayStudied(0);
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('Fetching study logs for userId:', userId); // debugging
      const res = await axios.get(`/streak/${userId}`, { baseURL: 'http://localhost:3000/api' });
      console.log('Fetched streak response:', res.data); // debugging

      const { streak, last7Days, todayStudy } = res.data;

      const logsFrom7Days = last7Days?.map((day: any) => ({
        date: day.date,
        completed: day.studied,
        minutesStudied: day.minutesStudied,
        planId: activePlan?.id || null,
      })) || [];

      setStudyLogs(logsFrom7Days);

      const today = new Date().toISOString().slice(0,10);
      const todayLog = logsFrom7Days.find(log => log.date === today);
      setTodayStudied(todayLog ? todayLog.minutesStudied : 0);
    } catch (error: any) {
      console.error('Error fetching study logs and streak:', error);
      setError('Failed to fetch study logs and streak');
      setStudyLogs([]);
      setTodayStudied(0);
    } finally {
      setLoading(false);
    }
  }, [userId, activePlan?.id]);

  // Trigger fetching plans and logs when userId changes
  useEffect(() => {
    if (!userId) return;
    fetchPlans();
    fetchStudyLogs();
  }, [userId, fetchPlans, fetchStudyLogs]);

  // React to plan updates to reset active plan
  useEffect(() => {
    if (plans.length > 0) {
      const active = plans.find(plan =>
        getPlanStatus(plan.start_date, plan.end_date) === 'active'
      );
      setActivePlan(active || null);
    }
  }, [plans, getPlanStatus]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        if (!planForm.plan_name.trim()) throw new Error('Plan name is required');
        if (!planForm.start_date || !planForm.end_date) throw new Error('Start and end dates are required');
        if (new Date(planForm.start_date) >= new Date(planForm.end_date))
          throw new Error('End date must be after start date');

        const selectedWeekdays = Object.entries(planForm.weekdays)
          .filter(([, selected]) => selected)
          .map(([day]) => day);
        if (selectedWeekdays.length === 0)
          throw new Error('Please select at least one study day');

        const planData = {
          plan_name: planForm.plan_name.trim(),
          user_id: userId!,
          start_date: planForm.start_date,
          end_date: planForm.end_date,
          weekdays: selectedWeekdays,
          study_time: planForm.study_time,
        };

        if (editingPlan) {
          await updateStudyPlan(editingPlan.id, planData);
          setSuccess('Plan updated successfully!');
        } else {
          await createStudyPlan(planData);
          setSuccess('Plan created successfully!');
        }
        resetForm();
        await fetchPlans();
      } catch (err: any) {
        console.error('Error saving plan:', err);
        setError(err.message || 'An error occurred while saving the plan');
      } finally {
        setLoading(false);
      }
    },
    [planForm, userId, editingPlan, fetchPlans]
  );

  const handleDelete = useCallback(
    async (planId: number) => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        await deleteStudyPlan(planId);
        setSuccess('Plan deleted successfully!');
        await fetchPlans();
      } catch (err: any) {
        console.error('Error deleting plan:', err);
        setError('An error occurred while deleting the plan: ' + (err.message || String(err)));
      } finally {
        setLoading(false);
      }
    },
    [fetchPlans]
  );

  const resetForm = useCallback(() => {
    setPlanForm({
      plan_name: '',
      start_date: '',
      end_date: '',
      study_time: 60,
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        .reduce((acc, d) => ({ ...acc, [d]: true }), {} as WeekdaysObj),
    });
    setShowCreateForm(false);
    setEditingPlan(null);
  }, []);

  const startEdit = useCallback((plan: StudyPlan) => {
    const weekdaysObj: WeekdaysObj = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reduce(
      (acc, d) => ({ ...acc, [d]: plan.weekdays.includes(d) }),
      {} as WeekdaysObj
    );
    setPlanForm({
      plan_name: plan.plan_name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      study_time: plan.study_time,
      weekdays: weekdaysObj,
    });
    setEditingPlan(plan);
    setShowCreateForm(true);
  }, []);

  const handleToggleDay = useCallback((day: string) => {
    setPlanForm(prev => ({
      ...prev,
      weekdays: { ...prev.weekdays, [day]: !prev.weekdays[day] },
    }));
  }, []);

  const addStudySession = useCallback(
    async (minutes: number) => {
      if (!activePlan) {
        setError('No active study plan selected');
        return;
      }
      if (!minutes || minutes <= 0) {
        setError('Invalid minutes entered');
        return;
      }
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.post(
          `/streak/${userId}`,
          {
            date: today,
            completed: minutes >= (activePlan.study_time || 60),
            minutesStudied: minutes,
            planId: activePlan.id,
          },
          { baseURL: 'http://localhost:3000/api' }
        );
        console.log('Added study session:', res.data);
        await fetchStudyLogs();
        await fetchPlans();
        setSuccess(`Added ${minutes} minutes to today's study log!`);
      } catch (err: any) {
        console.error('Error adding study session:', err);
        setError(err.response?.data?.message || 'Failed to add study session');
      } finally {
        setLoading(false);
      }
    },
    [activePlan, userId, fetchStudyLogs, fetchPlans]
  );

  return {
    planForm,
    plans,
    showCreateForm,
    editingPlan,
    loading,
    error,
    success,
    activePlan,
    studyLogs,
    todayStudied,
    setPlanForm,
    setShowCreateForm,
    setError,
    setSuccess,
    handleSubmit,
    handleDelete,
    resetForm,
    startEdit,
    handleToggleDay,
    addStudySession,
    fetchPlans,
    fetchStudyLogs,
  };
};
