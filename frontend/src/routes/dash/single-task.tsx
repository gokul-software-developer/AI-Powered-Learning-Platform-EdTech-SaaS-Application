import DeleteSchedule from "@/components/schedule/delete-schedule"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, ChevronLeft, Eye, Heart, View } from "lucide-react"
import { Link } from "react-router-dom"

const studySchedule = [
  {
    day: "Monday",
    topic: "Descriptive Statistics",
    tasks: [
      {
        task: "Video Lecture",
        description: "Watch video lectures on descriptive statistics.",
        time: "2 hours"
      },
      {
        task: "Revision",
        description: "Review key concepts and formulas.",
        time: "1 hour"
      }
    ],
    assignments: [
      {
        assignment: "Complete practice questions on descriptive statistics",
        assignmentType: "Practice",
        description: "Solve 15 questions related to mean, median, mode, variance, and standard deviation.",
        time: "1 hour"
      }
    ]
  },
  {
    day: "Tuesday",
    topic: "Probability Distributions",
    tasks: [
      {
        task: "Video Lecture",
        description: "Study video lectures on probability distributions.",
        time: "2 hours"
      },
      {
        task: "Problem Solving",
        description: "Solve example problems.",
        time: "1 hour"
      }
    ],
    assignments: [
      {
        assignment: "Work through practice problems on probability distributions",
        assignmentType: "Practice",
        description: "Solve 15 questions on normal, binomial, and Poisson distributions.",
        time: "1 hour"
      }
    ]
  },
  {
    day: "Wednesday",
    topic: "Inferential Statistics",
    tasks: [
      {
        task: "Video Lecture",
        description: "Study video lectures on Inferential Statistics.",
        time: "2 hours"
      },
      {
        task: "Problem Solving",
        description: "Solve example problems and submit them.",
        time: "1 hour"
      }
    ],
    assignments: [
      {
        assignment: "Complete the assignment and submit it",
        assignmentType: "Graded",
        description: "Submit the assignment",
        time: "1 hour"
      }
    ]
  },
  {
    day: "Thursday",
    topic: "Regression",
    tasks: [
      {
        task: "Video Lecture",
        description: "Study video lectures on Regression.",
        time: "2 hours"
      },
      {
        task: "Problem Solving",
        description: "Solve example problems.",
        time: "1 hour"
      }
    ],
    assignments: [
      {
        assignment: "Solve practice questions for linear regression",
        assignmentType: "Practice",
        description: "Solve 15 questions regarding Regression concepts.",
        time: "1 hour"
      }
    ]
  },
  {
    day: "Friday",
    topic: "Hypothesis Testing",
    tasks: [
      {
        task: "Video Lecture",
        description: "Study video lectures on hypothesis testing.",
        time: "2 hours"
      },
      {
        task: "Problem Solving",
        description: "Solve example problems.",
        time: "1 hour"
      }
    ],
    assignments: [
      {
        assignment: "Solve practice questions for hypothesis testing",
        assignmentType: "Practice",
        description: "Solve 15 questions regarding hypothesis testing.",
        time: "1 hour"
      }
    ]
  },
  {
    day: "Saturday",
    topic: "Weekly Review & GRE Practice",
    tasks: [
      {
        task: "Practice",
        description: "Practice GRE Quantitative Reasoning questions.",
        time: "3 hours"
      },
      {
        task: "Problem Solving",
        description: "Solve practice questions.",
        time: "1 hour"
      }
    ],
    assignments: [
      {
        assignment: "Review all topics covered during the week.",
        assignmentType: "Review",
        description: "Summarize key concepts and formulas.",
        time: "2 hours"
      }
    ]
  },
  {
    day: "Sunday",
    topic: "Mock Test & Review",
    tasks: [
      {
        task: "Analysis",
        description: "Analyze mock test results and identify weak areas.",
        time: "2 hours"
      },
      {
        task: "Revision",
        description: "Review concepts for areas of improvement.",
        time: "1 hour"
      }
    ],
    assignments: [
      {
        assignment: "Take a mock GRE Quantitative Reasoning test.",
        assignmentType: "Mock Test",
        description: "Simulate the actual GRE test environment.",
        time: "3 hours"
      }
    ]
  }
];

const SingleTask = () => {
  return (
    <div className="min-h-screen">
        <main className="min-h-[10vh] w-full bg-background items-center flex flex-row justify-between px-4">
            <main className="flex flex-row items-center gap-2">
                    <Button size={"sm"} variant={"ghost"} asChild>
                        <Link to={"/schedule"}>
                            <ChevronLeft />
                        </Link>
                    </Button>

                    <main className="flex flex-col justify-start gap-1 max-w-[30vw]">
                        <h1 className="text-sm line-clamp-1 font-medium tracking-tight text-foreground">GRE Preparations - 6 Months</h1>
                        <p className="text-xs line-clamp-1 font-medium text-foreground">
                            custom study plan created for GRE preparations to boost the students score in GRE,
                        </p>
                    </main>
            </main>
            
            <main className="flex flex-row items-center gap-2">
                <DeleteSchedule />
            </main>
        </main>

        <main className="flex-1 bg-background">
            <ScrollArea className="p-4 h-[82vh]">
                <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {studySchedule.map((schedule, index) => (
                        <Card key={index} className="border border-primary">
                            <CardHeader className="relative">
                                <Badge className="absolute top-2 right-2 bg-orange-500 text-white hover:bg-orange-600 hover:text-white text-xs" variant={"secondary"}>Pending - 2</Badge>
                                <CardTitle>
                                    {schedule.topic}
                                </CardTitle>
                                <CardDescription>
                                    Assigned Day: {schedule.day}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <main className="grid grid-cols-1 gap-2">
                                    <main className="flex flex-row items-center gap-3">
                                        <Eye size={"sm"} className="text-primary h-4 w-4" />
                                        <p className="text-xs font-medium tracking-tight">
                                            {schedule.tasks.length} Tasks
                                        </p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size={"sm"} variant={"outline"}>
                                                    <View className="" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl mx-auto">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Tasks assigned for {schedule.day}      
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        No of Tasks : {schedule.tasks.length}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <section>
                                                    <Table>
                                                        <TableCaption>A list of tasks for the day.</TableCaption>
                                                        <TableHeader>
                                                            <TableRow>
                                                            <TableHead className="">Mark</TableHead>
                                                            <TableHead>Task</TableHead>
                                                            <TableHead>description</TableHead>
                                                            <TableHead>Time</TableHead>
                                                            </TableRow>

                                                        </TableHeader>
                                                        <TableBody>
                                                            {schedule.tasks.map((task, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell className="font-medium">
                                                                            <Input type="checkbox" className="h-4 w-4" />
                                                                        </TableCell>
                                                                        <TableCell>{task.task}</TableCell>
                                                                        <TableCell>{task.description}</TableCell>
                                                                        <TableCell className="text-right">{task.time}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </section>
                                            </DialogContent>
                                        </Dialog>
                                    </main>
                                    <main className="flex flex-row items-center gap-3">
                                        <Heart size={"sm"} className="text-primary w-4 h-4" />
                                        <p className="text-xs font-medium tracking-tight">
                                            {schedule.assignments.length} Assignments
                                        </p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size={"sm"} variant={"outline"}>
                                                    <View className="" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl w-full">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Assignments for {schedule.day}      
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        No of Assignment : {schedule.tasks.length}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <section>
                                                    <Table>
                                                        <TableCaption>A list of assignments issued for the day.</TableCaption>
                                                        <TableHeader>
                                                            <TableRow>
                                                            <TableHead className="">Mark</TableHead>
                                                            <TableHead>Assignment</TableHead>
                                                            <TableHead>description</TableHead>
                                                            <TableHead>type</TableHead>
                                                            <TableHead>Time</TableHead>
                                                            </TableRow>

                                                        </TableHeader>
                                                        <TableBody>
                                                            {schedule.assignments.map((assignment, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell className="font-medium">
                                                                            <Input type="checkbox" className="h-4 w-4" />
                                                                        </TableCell>
                                                                        <TableCell>{assignment.assignment}</TableCell>
                                                                        <TableCell>{assignment.description}</TableCell>
                                                                        <TableCell><Badge>{assignment.assignmentType}</Badge></TableCell>
                                                                        <TableCell className="text-right">{assignment.time}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </section>
                                            </DialogContent>
                                        </Dialog>
                                    </main>
                                </main>
                            </CardContent>
                            <CardFooter className="justify-between gap-4 items-center flex flex-row flex-wrap">
                                <p className="text-sm font-light text-muted-foreground">Created on {new Date().toDateString().split('T')}</p>

                                <main className="flex flex-row gap-4 items-center">
                                    <Button className="" variant={"default"} size={"sm"}>
                                        <Check />
                                    </Button>
                                    <DeleteSchedule />
                                </main>
                            </CardFooter>
                        </Card>
                    ))}
                </main>
            </ScrollArea>
        </main>
        <main className="items-center flex flex-row gap-4 min-h-[8vh] px-4">
            <p className="text-sm font-medium tracking-tight">
                Completed - <span className="text-primary">6</span>, Due - <span className="text-orange-500">4</span>, Abondoned - <span className="text-destructive">3</span>
            </p>
        </main>
    </div>
  )
}

export default SingleTask