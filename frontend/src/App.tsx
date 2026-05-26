import { BrowserRouter, Route, Routes } from "react-router-dom"
import Root from "./layouts/root"
import Pricing from "./routes/root/pricing"
import QuizPage from "../src/routes/dash/quiz/QuizPage"; 
import Home from "./routes/root/home"
import Auth from "./layouts/auth"
import SignIn from "./routes/auth/sign-in"
import SignUp from "./routes/auth/sign-up"
import SendMobile from "./routes/auth/send-mobile"
import GroupLanding from "./components/overview/Groups/GroupLanding";
import GroupDetails from "./components/overview/Groups/GroupDetails";
import ActivateEmail from "./routes/auth/activate-email"
import ResetPassword from "./routes/auth/reset-password"
import Dash from "./layouts/main"
import Overview from "./routes/dash/overview"
import Billing from "./routes/dash/billing"
import SetRole from "./middlewares/set-role"
import Rooms from "./routes/dash/rooms"
import GoogleCalendar from "./routes/dash/google-calendar"
import Notion from "./routes/dash/notion"
import FeatureSelection from "./routes/dash/feature-selection"
import Learn from "./routes/dash/learn"
import Schedules from "./routes/dash/schedules"
import SingleLearner from "./routes/dash/single-learner"
import Test from "./routes/dash/test"
import SingleTest from "./routes/dash/single-test"
import SingleTask from "./routes/dash/single-task"
import CourseContent from "./routes/dash/CourseContent/courseContent"
import ContactUsPage from '../../frontend/src/components/root/home/contact-us';
import ScrollToTop from "./utils/scrollToTop"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import MyLearnings from "./routes/dash/MyLearnings/myLearnings"
import CourseOverview from "./routes/dash/CourseOverview/courseOverview"
import UserProfile from "./routes/dash/user-profile/UserProfile";
import { Toaster } from "sonner"; 
import StudyPlanDetail from "./routes/dash/Overview/StudyPlanDetail";
function App() {
  return (
    <>
<BrowserRouter>
    <ScrollToTop />
  <Routes>
    {/* Public Routes */}
    <Route element={<Root />}>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
    </Route>

          <Route path="/set-state" element={<SetRole />} />

          <Route element={<Auth />}>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/verify-user" element={<ActivateEmail />} />
            <Route path="/send-mobile" element={<SendMobile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route
          element={
            <ProtectedRoute>
              <Dash />
            </ProtectedRoute>
          }
        >
            <Route path="/overview" element={<Overview />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/test" element={<Test />} /> 
            <Route path="/test/:id" element={<SingleTest />} /> 
            <Route path="/billing" element={<Billing />} />
            <Route path="/connect-gcalendar" element={<GoogleCalendar />} />
            <Route path="/connect-notion" element={<Notion />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:id" element={<SingleLearner />} />
            <Route path="/schedule" element={<Schedules />} />
            <Route path="/schedule/:id" element={<SingleTask />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/course/:courseId" element={<CourseContent />} />
            <Route path="/course-overview/:courseId" element={<CourseOverview />} />
            <Route path="/mylearnings" element={<MyLearnings />} />
            <Route path="/feature-selection" element={<FeatureSelection />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/groups" element={<GroupLanding />} />
            <Route path="/group/:id" element={<GroupDetails />} />
            <Route path="/profile/:userId" element={<UserProfile/>} />
            <Route path="/studyplan/:id" element={<StudyPlanDetail/>}/>
          </Route>
        </Routes>
      </BrowserRouter>


      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
