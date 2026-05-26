import { Link } from "react-router-dom"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import DeleteTest from "./delete-test"

const ListTests = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
        {['a','b','c','d','e','f','g','h'].map((id, index) => (
            <Card key={index}>
                <CardHeader>
                    <CardTitle>Gate Preparation Test</CardTitle>
                    <CardDescription>
                        Created by Jane Doe on {new Date().toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-xs font-light">Sample Description made by the user, this is just pure lorem ipsum content, don't mind about it..</p>

                    <main className="text-xs inline-flex gap-2 items-center">
                        Made from : <Link to={"/learn/"+id}>
                            <Badge variant={"default"}>Gate Prep Teacher</Badge>
                        </Link>
                    </main>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <DeleteTest id={id as string} />
                    <Button className="" asChild variant={"default"} size={"sm"}>
                        <Link to="/test">
                            Start Test
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        ))}
    </div>
  )
}

export default ListTests