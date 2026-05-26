import { Button } from "@/components/ui/button"
import { HandCoins } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import BillingForm from "@/components/billing/billing-form"
import PreviousPayments from "@/components/billing/previous-payments"

const Billing = () => {
  function getBillingInfo() {
    // In a real app, this would fetch data from your backend
    return {
      plan: 'Pro',
      amount: 15,
      interval: 'month',
      nextBillingDate: '2023-07-01',
      usage: {
        overview: 80,
        learn: 65,
        schedule: 90,
        tests: 70,
        googleCalendar: 50,
        notion: 30,
        community: 40,
      },
    }
  };

  const billingInfo = getBillingInfo();

  return (
    <div className="w-full p-4">
        <main className="flex justify-start md:justify-between items-start md:items-center flex-col md:flex-row gap-4 flex-wrap">
            <main className="flex flex-col gap-1">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Billing
                </h1>
                <p className="text-muted-foreground text-sm font-light tracking-tight leading-tight">
                    manage your billing and invoices, upgrading and auto-payment features
                </p>
            </main>

            <div className="relative">
                <Button variant={"default"} className="relative" size={"sm"}>
                    <HandCoins />
                    Upgrade
                </Button>
            </div>
        </main>
        <div className="grid gap-8 md:grid-cols-2 my-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the {billingInfo.plan} plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold tracking-tight">${billingInfo.amount}/{billingInfo.interval}</p>
            <p>Next billing date: {billingInfo.nextBillingDate}</p>
            <div className="flex space-x-4">
              <Button variant="outline" size={"sm"}>Cancel Subscription</Button>
              <Button size={"sm"}>View Other Plans</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
  <CardHeader>
    <CardTitle>Payment Information</CardTitle>
    <CardDescription>Manage your payment details.</CardDescription>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2">
      <li className="flex justify-between">
        <span className="font-medium">Current Plan:</span>
        <span>Basic</span>
      </li>
      <li className="flex justify-between">
        <span className="font-medium">Features Used:</span>
        <span>3/5</span>
      </li>
      <li className="flex justify-between">
        <span className="font-medium">Upgrade Recommendation:</span>
        <span>Pro Plan for more integrations</span>
      </li>
    </ul>
  </CardContent>
  <CardFooter>
    <BillingForm />
  </CardFooter>
</Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Previous Payments</CardTitle>
            <CardDescription>Your payment history.</CardDescription>
          </CardHeader>
          <CardContent>
            <PreviousPayments />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Billing