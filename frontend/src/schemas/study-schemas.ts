import {z} from 'zod'

const TimeRangeEnum = z.enum(["Days", "Months", "Years", "Weeks", "Hours"]);

const EducationLevelEnum = z.enum([
  "School",
  "UG",
  "PG",
  "PHD",
  "CompetitiveExam",
  "SelfStudy",
]);

const StudyTimeEnum = z.enum(["Morning", "Afternoon", "Evening", "Night"]);

const PriorKnowledgeEnum = z.enum(["Beginner", "Intermediate", "Advanced"]);

const PreferredStudyMethodsEnum = z.enum([
  "VideoLectures",
  "Reading",
  "PracticeTests",
  "FlashCards",
]);

const RevisionFrequencyEnum = z.enum(["Daily", "Weekly", "BeforeExam"]);

const BreakPreferencesEnum = z.enum([
  "POMODORO",
  "FIFTY_TWO_SEVENTEEN",
  "NINETY_MINUTE_CYCLE",
  "SIXTY_TEN",
  "FLOWTIME",
  "TWO_DAY_RULE",
  "REVERSE_POMODORO",
]);

export const CreatestudyPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  timelimit: TimeRangeEnum,
  education: EducationLevelEnum,
  age: z.number().int().min(10, "Age must be at least 10 years"),
  studyHours: z.number().int().min(1, "Study hours must be at least 1"),
  studytime: StudyTimeEnum,
  prior: PriorKnowledgeEnum,
  examdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  exam: z.string().min(1, "Exam name is required"),
  method: PreferredStudyMethodsEnum,
  revision: RevisionFrequencyEnum,
  breaks: BreakPreferencesEnum,
  availablehoursinWeekend: z.string().min(1, "Weekend availability is required"),
  subject: z.string().min(1, "Subject is required"),
});

export const UpdateStudyPlanSchema = CreatestudyPlanSchema.partial();
