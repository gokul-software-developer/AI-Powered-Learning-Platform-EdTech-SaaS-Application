import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/format-date";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import UpdateEventDialog from "./update-events";
// import  DeleteEventsDrawer from "./delete-events";

const ListEvents = ({content} : {
  content : any
}) => {
  return (
    <Card>
      <CardHeader>
          <CardTitle>Event : {content?.eventType as string}</CardTitle>
          <CardDescription>Message : {content?.summary as string}</CardDescription>
      </CardHeader>

      <CardContent>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
          <p className="text-xs font-light text-muted-foreground tracking-tight">
              {formatDate(content?.created as string)}
          </p>

          <main className="flex flex-row items-center justify-end w-full gap-2">
              <Button size={"sm"} variant={"outline"} asChild>
                  <Link to={content?.htmlLink as string} target="_blank">
                      <User />
                  </Link>
              </Button>
              <UpdateEventDialog />
             
          </main>
      </CardFooter>
</Card>
  )
}

export default ListEvents