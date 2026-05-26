import { Heart } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import DeleteSchedule from "./delete-schedule"
import { Badge } from "../ui/badge"
import { Link } from "react-router-dom"

const ListSchedule = () => {
  return (
    <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-3">
        {[0,1,2,3,4,5].map((content, index) => (
            <Card className={`${content}`} key={index}>
                <CardHeader className="relative">
                    <CardTitle>
                        GRE Preparations - 6 Months
                    </CardTitle>
                    <CardDescription> 
                        custom study plan created for GRE preparations to boost the students score in GRE,
                    </CardDescription>
                    <Badge className="absolute top-2 right-2" variant={"default"}>onGoing</Badge>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-medium tracking-tight">
                        Completed - <span className="text-primary">6</span>, Due - <span className="text-orange-500">4</span>, Abondoned - <span className="text-destructive">3</span>
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <p className="text-xs font-medium text-muted-foreground">Created on {new Date().toDateString().split('T')}</p>

                    <main className="flex flex-row gap-4 items-center">
                        <Button className="" variant={"outline"} size={"sm"}>
                            <Heart />
                        </Button>
                        <Button className="" variant={"default"} size={"sm"} asChild>
                            <Link to={"/schedule/"+content}>Enter</Link>
                        </Button>
                        <DeleteSchedule />
                    </main>
                </CardFooter>
            </Card>
        ))}
    </div>
  )
}

export default ListSchedule