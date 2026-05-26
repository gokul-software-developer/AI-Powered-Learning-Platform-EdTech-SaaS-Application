import ImproveBot from "@/components/learn/improve-bot";
import UpdateBotsSheet from "@/components/learn/update-bots-sheet";
import DeleteTest from "@/components/test/delete-test";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Copy, Send, Settings, ThumbsDown, ThumbsUp, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const userData = {
  name: "Sherin PS",
  email: "sherin@example.com",
  mobile: "9876543210",
};

const fetchAvatarImage = () => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`;
};

const SingleLearner = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="min-h-[10vh] w-full bg-background items-center flex flex-row justify-between px-4">
        <main className="flex flex-row items-center gap-2">
          <Button size={"sm"} variant={"ghost"} asChild>
            <Link to={"/learn"}>
              <ChevronLeft />
            </Link>
          </Button>

          <main className="flex flex-col justify-start gap-1 max-w-[30vw]">
            <h1 className="text-sm line-clamp-1 font-medium tracking-tight text-foreground">Single Learner</h1>
            <p className="text-xs line-clamp-1 font-medium text-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus eleifend velit, in accumsan arcu finibus vel.
            </p>
          </main>
        </main>

        <main className="hidden md:flex flex-row items-center gap-2">
          <ImproveBot />
          <UpdateBotsSheet />
          <DeleteTest id="1" />
        </main>

        <main className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={"sm"} variant={"outline"}>
                <Settings />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <Separator />
              <DropdownMenuItem asChild>
                <ImproveBot />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <UpdateBotsSheet />
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <DeleteTest id="1" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </main>
      </main>

      <main className="flex-1 bg-background">
        <ScrollArea className="p-4 flex-1 h-[82vh]">
          {[0, 1, 2, 3, 4].map((_, index) => (
            <main key={index} className="mb-5">
              <main className="w-full mb-4 justify-start flex">
                <Card className="max-w-sm">
                  <CardHeader>
                    <CardTitle>Vioquix Agent</CardTitle>
                    <CardDescription className="items-center flex flex-row gap-1">
                      <Badge variant={"default"} /> Online
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm line-clamp-3 font-medium text-muted-foreground">
                      Hi, {userData.name}, Welcome to Study App agent. Get started with your learning experience.
                    </p>
                  </CardContent>

                  <CardFooter className="flex justify-end items-center gap-2">
                    <Button variant={"outline"} size={"sm"}>
                      <ThumbsUp />
                    </Button>
                    <Button variant={"outline"} size={"sm"}>
                      <ThumbsDown />
                    </Button>
                    <Button variant={"outline"} size={"sm"}>
                      <Copy />
                    </Button>
                  </CardFooter>
                </Card>
              </main>

              <main className="w-full justify-end flex mb-2">
                <Card className="max-w-sm">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Avatar>
                      <AvatarImage src={fetchAvatarImage()} alt={userData.name} />
                      <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <main>
                      <CardTitle>{userData.name}</CardTitle>
                      <CardDescription>{userData.email}</CardDescription>
                    </main>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm line-clamp-3 font-medium text-muted-foreground">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus eleifend velit, in accumsan arcu finibus vel.
                    </p>
                  </CardContent>
                </Card>
              </main>

              <Separator />
            </main>
          ))}
        </ScrollArea>
      </main>

      <main className="items-center flex flex-row gap-4 min-h-[8vh] px-4">
        <Button variant={"outline"}>
          <Upload />
        </Button>
        <Input placeholder="type something here.." />
        <Button variant={"default"} className="h-full">
          <Send />
        </Button>
      </main>
    </div>
  );
};

export default SingleLearner;
