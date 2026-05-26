import AbondonTest from "@/components/test/abondon-test"
import DeleteTest from "@/components/test/delete-test"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronLeft, Plus, Settings2 } from "lucide-react"
import { Link } from "react-router-dom"

const Test = () => {
  return (
    <div className="min-h-screen">
        <main className="min-h-[10vh] w-full bg-background items-center flex flex-row justify-between px-4">
            <main className="flex flex-row items-center gap-2">
                    <Button size={"sm"} variant={"ghost"} asChild>
                        <Link to={"/rooms"}>
                            <ChevronLeft />
                        </Link>
                    </Button>

                    <main className="flex flex-col justify-start gap-1 max-w-[30vw]">
                        <h1 className="text-sm line-clamp-1 font-medium tracking-tight text-foreground">Gate Preparation Test</h1>
                        <p className="text-xs line-clamp-1 font-medium text-foreground">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus eleifend velit, in accumsan arcu finibus vel. Integer vel faucibus eros. Sed vel ex non nisi ullamcorper consectetur.
                        </p>
                    </main>
            </main>
            
            <main className="hidden md:flex flex-row items-center gap-2">
                <DeleteTest id="1" />
            </main>

            <main className="block md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size={"sm"} variant={"outline"} >
                            <Settings2 />
                        </Button>
                    </DropdownMenuTrigger>
                
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        Settings
                    </DropdownMenuLabel>
                    <Separator />
                    <DropdownMenuItem asChild>
                        <DeleteTest id="1" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </main>
        </main>
        <Separator />

        <main className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[0,1,2].map((content, index) => (
                <Card key={index}>
                    <CardHeader className="relative">
                        <CardTitle>
                            Test {content} - Linear Algebra
                        </CardTitle>
                        <CardDescription>
                            Vectur Spaces, span, Dimensions, null spaces and theorems related to vector and matrix algebra.
                        </CardDescription>

                        <Badge variant={"destructive"} className="absolute top-2 right-2">Hard</Badge>
                    </CardHeader>

                    <CardContent>
                        <main className="flex flex-row gap-2 items-center flex-wrap"><p className="text-sm font-medium tracking-tight text-foreground">
                           Total marks assigned : <span className="text-primary">80</span>
                        </p>
                        <p className="text-sm font-medium tracking-tight text-foreground">
                           Pass Grade : <span className="text-primary">20</span>
                        </p>
                        </main>
                        <p className="text-xs line-clamp-1 font-medium tracking-tight text-foreground">
                            Total time: 30 minutes
                        </p>

                        <main className="flex flex-col gap-3 mt-3">
                            <main className="flex flex-row gap-2">
                                <Check className="text-primary h-4 w-4" />
                                <p className="text-xs text-foreground tracking-tight">multiple choice questions</p>
                            </main>
                            <main className="flex flex-row gap-2">
                                <Check className="text-primary h-4 w-4" />
                                <p className="text-xs text-foreground tracking-tight">multiple select questions</p>
                            </main>
                            <main className="flex flex-row gap-2">
                                <Check className="text-primary h-4 w-4" />
                                <p className="text-xs text-foreground tracking-tight">short answers</p>
                            </main>
                            <main className="flex flex-row gap-2">
                                <Check className="text-primary h-4 w-4" />
                                <p className="text-xs text-foreground tracking-tight">long answers</p>
                            </main>
                            <main className="flex flex-row gap-2">
                                <Plus className="text-destructive rotate-45 h-4 w-4" />
                                <p className="text-xs text-foreground tracking-tight">Essay type</p>
                            </main>
                        </main>
                    </CardContent>

                    <CardFooter className="flex justify-between items-center">
                        <main className="flex flex-row text-sm font-light text-foreground gap-2">
                            <Badge variant={"default"}>Passed</Badge>
                            Marks - <span className="text-primary font-medium">54/80</span>
                        </main>
                        <main className="flex flex-row items-center gap-2">
                        <AbondonTest />
                        <Button asChild variant={"default"} size={"sm"}>
                            <Link to={"/test/" + index}>
                                Enter
                            </Link>
                        </Button>
                        </main>
                    </CardFooter>
                </Card>
            ))}
        </main>
    </div>
  )
}

export default Test