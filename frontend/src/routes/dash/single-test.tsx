import AbondonTest from "@/components/test/abondon-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { twMerge } from "tailwind-merge"

const SingleTest = () => {
    const [time, setTime] = useState(20 * 60); // 20 minutes in seconds

    useEffect(() => {
        if (time <= 0) return; // Stop when timer reaches 0

        const interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [time]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${hours < 10 ? "0" : ""}${hours}:${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

  return (
    <div className="flex flex-col min-h-screen">
        <main className="min-h-[10vh] w-full bg-background items-center flex flex-row justify-between px-4">
            <main className="flex flex-row items-center gap-2">
                    <Button size={"sm"} variant={"ghost"} asChild>
                        <Link to={"/test"}>
                            <ChevronLeft />
                        </Link>
                    </Button>

                    <main className="flex flex-col justify-start gap-1 max-w-[30vw]">
                        <h1 className="text-sm line-clamp-1 font-medium tracking-tight text-foreground">Test 2 - Linear Algebra</h1>
                        <p className="text-xs line-clamp-1 font-medium text-foreground">
                            Vectur Spaces, span, Dimensions, null spaces and theorems related to vector and matrix algebra.
                        </p>
                    </main>
            </main>
            
            <main className="flex flex-row items-center gap-2">
                <AbondonTest />
            </main>
        </main>
        <main className="flex-1 bg-background">
            <ScrollArea className="p-4 flex-1 h-[82vh]">
                <main className="flex flex-col md:flex-row gap-2">
                    <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Qn{1}.  Let A be a 4 × 4 real matrix with eigenvalues 1, 2, 3, and 4. Consider the matrix B = A² - 5A + 6I, where I is the identity matrix. What are the eigenvalues of B?
                        </CardTitle>
                        <CardDescription className="items-center flex flex-row gap-1">
                            Marks Assigned: <span className="text-primary">1</span> Negative Marks: <span className="text-red-500">0</span>
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col gap-2 justify-start">
                        {[
                            "1, 4, 9, 16",
                            "0, 2, 6, 12",
                            "0, 3, 8, 15",
                            "2, 6, 12, 20"
                        ].map((content, index) => (
                            <main className="flex flex-row gap-3 items-center" key={index}>
                                <Input size={4} type="radio" multiple={false} className="h-4 w-4" />
                                <p className="text-sm font-light text-muted-foreground">{content}</p>
                            </main>
                        ))}
                    </CardContent>

                    <CardFooter className="flex justify-end items-center gap-2">
                        <p className="text-sm font-light">
                            It is a required question
                        </p>
                    </CardFooter>
                    </Card>
                    <Separator orientation="vertical" className="hidden md:block" />
                    <Separator orientation="horizontal" className="block md:hidden" />
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>
                                Choose Questions
                            </CardTitle>
                            <CardDescription>
                                UnAnswered questions are marked as <span className="text-destructive">Red</span>, Answered in <span className="text-primary">Green</span> and Reviewed in <span className="text-orange-500">Orange</span> 
                            </CardDescription>
                        </CardHeader>

                        <CardContent className=" flex flex-row flex-wrap gap-4">
                            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((content, index) => (
                                <div className={twMerge("rounded-2xl h-12 w-12 bg-primary text-xs font-medium text-foreground flex cursor-pointer hover:scale-105 transition-all duration-200 ease-in-out active:translate-y-1 justify-center items-center", content > 10 && "bg-destructive", content === 4 && "bg-orange-500")} key={index}>
                                    Qn {content}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </main>
            </ScrollArea>
        </main>
        <main className="items-center juetify-between w-full flex flex-row gap-4 min-h-[8vh] px-4">
            <main className="flex items-center justify-start w-full h-full gap-3">
                <p className="md:inline-flex text-xs font-medium hidden">
                    total marks: 80
                </p>
                <h1 className="text-lg font-medium">Time Left: {formatTime(time)}</h1>
            </main>

            <main className="justify-end items-center flex w-full gap-4">
                <Button variant={"outline"} size={"sm"}>Mark for review</Button>
                <Button variant={"default"} size={"sm"}>Next</Button>
                <Button variant={"default"} size={"sm"} className="hidden md:block" disabled>Submit</Button>
            </main>
        </main>
    </div>
  )
}

export default SingleTest