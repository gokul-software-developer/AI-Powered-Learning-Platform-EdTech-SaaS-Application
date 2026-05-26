import { Button } from "@/components/ui/button"

import { Crown, Plus } from "lucide-react"
import { Link } from "react-router-dom"

const Community = () => {
  return (
    <div className="w-full p-4">
        <main className="flex justify-start md:justify-between items-start md:items-center flex-col md:flex-row gap-4 flex-wrap">
            <main className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Communities
                </h1>
                <p className="text-muted-foreground text-sm font-light tracking-tight leading-tight">
                    Join and collaborate with study hubs and communities to share your knowledge, study materials etc.,
                </p>
            </main>

            <div className="relative">
                <Button variant={"default"} asChild className="relative" size={"sm"}>
                    <Link to={"/pricing"}>
                    <Plus className="mr-1 h-4 w-4" />
                    Community
                    </Link>
                </Button>
                <div className="text-xs absolute -top-2 right-1 font-light text-yellow-500">
                    <Crown className="h-4 w-4" />
                </div>
            </div>
        </main>
    </div>
  )
}

export default Community