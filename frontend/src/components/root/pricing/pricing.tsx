import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator";
import { motion } from 'framer-motion';
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingCards = () => {
  return (
    <main className="min-h-[90vh] px-4 py-12">

        <main className="flex text-center flex-col gap-1">
            <h1 className="text-5xl font-medium text-foreground tracking-tight leading-tight">Pricing Plans</h1>
            <p className="text-lg font-normal text-muted-foreground">Choose the best plan for your learning experience with Study App</p>

            <main className="flex flex-row gap-4 justify-center mt-4 items-center">
                <Button variant={"outline"} size={"sm"} asChild>
                    <Link to={"/sign-in"}>
                        Login
                    </Link>
                </Button>

                <Button variant={"default"} size={"sm"} asChild>
                    <Link to={"/sign-up"}>
                        Get Started
                    </Link>
                </Button>
            </main>
        </main>

    <div className="flex justify-center gap-4 flex-col md:flex-row pt-12 w-full">
        {[0,1,2].map((_, index) => (
            <motion.main
            key={index}
            initial={{
                opacity: 0,
                y: 20
            }}
            whileInView={{
                opacity: 100,
                y: 0
            }}
            whileHover={{
                rotate : 4,
                scale : 1.1
            }}
            transition={{
                duration: 0.2 * index,
                ease: "easeInOut"
            }}
        >
        <Card className="shadow-sm">
            <CardHeader className="relative">
                <CardTitle className="text-2xl whitespace-normal font-semibold tracking-tight">
                    Starter Plan
                </CardTitle>
                <CardDescription className="text-lg font-medium flex items-end text-foreground">
                    <p className="text-4xl">$12</p>/month
                </CardDescription>

                <Badge className="absolute top-2 right-2">
                    Best Seller
                </Badge>
            </CardHeader>
            <Separator />
            <CardContent>
                <p className="text-lg font-medium whitespace-normal text-foreground">Best option for students seeking for tuition experience in their mobile phones</p>

                <main className="py-4">
                    <h1 className="text-lg font-medium text-foreground pb-2 tracking-tight">
                        Features: 
                    </h1>

                    <main className="flex flex-col gap-2">
                    <main className="flex flex-row items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 fill-green-500" />
                        <p className="text-sm font-normal text-foreground tracking-tight leading-tight">Unlimited Study plan generations</p>
                    </main>

                    <main className="flex flex-row items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 fill-green-500" />
                        <p className="text-sm font-normal text-foreground tracking-tight leading-tight">Custom Tutoring with PDF Uploads</p>
                    </main>

                    <main className="flex flex-row items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 fill-green-500" />
                        <p className="text-sm font-normal text-foreground tracking-tight leading-tight">Exam Conducting with personalized correction systems.</p>
                    </main>

                    <main className="flex flex-row items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 fill-green-500" />
                        <p className="text-sm font-normal text-foreground tracking-tight leading-tight">Integrations with Notion, Google Calendar etc.,</p>
                    </main>

                    <main className="flex flex-row items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 fill-green-500" />
                        <p className="text-sm font-normal text-foreground tracking-tight leading-tight">Online Communities, post progress, attend events.</p>
                    </main>
                    </main>
                </main>
            </CardContent>
            <Separator />
            <CardFooter className="mt-3">
                <Button size={"sm"} className="w-full" asChild>
                    <Link to={"/sign-up"}>
                        Get Started
                    </Link>
                </Button>
            </CardFooter>
        </Card>
        </motion.main>
        ))}
    </div>    
        
    </main>
  )
}

export default PricingCards