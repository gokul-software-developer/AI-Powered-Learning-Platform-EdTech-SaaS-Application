
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import StudyPlanPopup from '../../../src/components/overview/studyplanui/studyplanpopup';
import { useStudyPlan } from '../../hooks/use-studyPlan';
import { formatDate, getPlanStatus } from '../../utils/studyMetrics';
import { Planner } from '@/routes/dash/planner';
import ContinueLearning from '../../../src/routes/dash/continue-reading';
import StartLearning from '../../../src/routes/dash/start-learning';
import Footer from '@/components/footer/footer';
import { Plus, Calendar, Edit, Trash2, Share2 } from 'lucide-react';
import SearchBar from './Overview/searchbar';
import axios from 'axios';
import { toast } from "sonner";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
import StudyProgress from './studyProgress';

const Overview = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get<SessionResponse>(`${BASE_URL}/session/check-session`, {
          withCredentials: true,
        });
        if (res.data.loggedIn) {
          setUser(res.data.user);
          console.log('User session:', res.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
      } finally {
        setSessionLoading(false);
      }
    };
    fetchSession();
  }, []);

  // Always call the hook (unconditionally)
  const studyPlanHook = useStudyPlan(user?.userId);

  // Destructure with safe defaults
  const plans = studyPlanHook?.plans || [];
  const loading = studyPlanHook?.loading || false;
  const error = studyPlanHook?.error || '';
  const success = studyPlanHook?.success || '';
  const activePlan = studyPlanHook?.activePlan || null;
  const setError = studyPlanHook?.setError || (() => {});
  const setSuccess = studyPlanHook?.setSuccess || (() => {});
  const handleDelete = studyPlanHook?.handleDelete || (() => {});
  const fetchPlans = studyPlanHook?.fetchPlans || (() => {});

 

  // Compute max study_time across all plans (0 if none)
// Filter only active plans before taking max
const activePlans = plans.filter(
  plan => getPlanStatus(plan.start_date, plan.end_date) === 'active'
);

const maxStudyTime = activePlans.length > 0
  ? Math.max(...activePlans.map(plan => plan.study_time))
  : 0;

console.log('Max Study Time (Active Plans Only):', maxStudyTime);

  const handlePlusClick = () => {
    navigate('/MyLearnings');
  };


  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsPopupOpen(true);
  };


  const handleEditPlan = (plan: StudyPlan) => {
    setEditingPlan(plan);
    setIsPopupOpen(true);
  };


  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingPlan(null);
  };


  const handlePlanUpdate = () => {
    fetchPlans();
    handleClosePopup();
  };


  // Render fallback during session load
  if (sessionLoading) return <div className="p-4 text-center">Loading session...</div>;
  if (!user) return <div className="p-4 text-center text-red-500">Please log in to view this page</div>;


  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 xl:max-w-screen-xl">
      {/* Header Section */}
      <main className="w-full mb-6 space-y-6 md:space-y-0 md:flex md:items-center md:justify-between">
        {/* Left: Greeting */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Welcome back, {user.firstname} {user.lastname}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Continue your journey with our curator
          </p>
        </div>


        {/* Right: Search + Button */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center w-full md:w-auto">
          <SearchBar />
          <button
            onClick={handlePlusClick}
            className="flex items-center justify-center p-3 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
            aria-label="Add a Course"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </main>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">&times;</button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
          <button onClick={() => setSuccess('')} className="float-right font-bold">&times;</button>
        </div>
      )}


      {/* StudyProgress gets maxStudyTime as target time */}
      <StudyProgress activePlan={activePlan} userId={user.userId} targetStudyTime={maxStudyTime} />

      {/* Study Plan Management Section */}
      <Card className="mb-6 bg-gray shadow-lg">
        <CardHeader>
          <CardTitle>Study Plan Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <button
              onClick={handleCreatePlan}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Study Plan
            </button>
          </div>

          {/* Existing Plans */}
          {loading && plans.length === 0 ? (
            <div className="text-center py-4">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No study plans yet. Create your first plan to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan: StudyPlan) => {
                const status = getPlanStatus(plan.start_date, plan.end_date);
                return (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                    onClick={() => navigate(`/studyplan/${plan.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/studyplan/${plan.id}`);
                      }
                    }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                      <h3 className="text-lg font-semibold text-white-800 mb-2 md:mb-0">{plan.plan_name}</h3>
                      <div className="flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          aria-label="Edit plan"
                          title="Edit plan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          aria-label="Delete plan"
                          title="Delete plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/studyplan/${plan.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success("Study plan link copied to clipboard!");
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                          aria-label="Share plan"
                          title="Share plan link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Duration:</strong> {formatDate(plan.start_date)} - {formatDate(plan.end_date)}</p>
                        <p><strong>Daily Study Time:</strong> {plan.study_time} minutes</p>
                      </div>
                      <div>
                        <p><strong>Study Days:</strong> {Array.isArray(plan.weekdays) ? plan.weekdays.join(', ') : 'N/A'}</p>
                        <p>
                          <strong>Status:</strong>
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${
                            status === 'active' ? 'bg-green-100 text-green-800'
                            : status === 'upcoming' ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {status === 'active' ? 'Active' : status === 'upcoming' ? 'Upcoming' : 'Completed'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <StudyPlanPopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        userId={user.userId}
        editingPlan={editingPlan}
        setSuccess={setSuccess}
        setError={setError}
        onPlanUpdate={handlePlanUpdate}
      />

      {showProgressModal && selectedProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowProgressModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Progress for: {selectedProgress.planName}</h2>
            {selectedProgress.progress.length === 0 ? (
              <p>No progress data available.</p>
            ) : (
              <div className="space-y-4">
                {selectedProgress.progress.map((course: any) => (
                  <div key={course.courseId} className="border rounded p-4">
                    <h3 className="font-semibold">{course.courseName}</h3>
                    <p className="text-sm mb-2">
                      Watched: {course.watchedVideos} / {course.totalVideos}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{
                          width:
                            course.totalVideos > 0
                              ? `${(course.watchedVideos / course.totalVideos) * 100}%`
                              : '0%',
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mt-2 text-gray-500">
                      Daily: {course.settings?.daily_hours || 0} hr(s), Days: {course.settings?.study_days?.join(', ') || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Planner Section */}
      <Card className="mb-6 bg-gray shadow-lg">
        <CardContent>
          <Planner />
        </CardContent>
      </Card>

      {/* Start Learning Section */}
      <Card className="mb-6 bg-gray shadow-lg">
        <CardContent>
          <StartLearning />
        </CardContent>
      </Card>

      {/* Continue Learning Section */}
      <Card className="mb-6 bg-gray shadow-lg">
        <CardContent>
          <ContinueLearning />
        </CardContent>
      </Card>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Overview;
