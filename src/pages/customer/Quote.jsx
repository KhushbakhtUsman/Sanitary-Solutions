import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";

export const Quote = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Request a quote</h1>
            <p className="text-sm text-gray-500">
              Share your project details and we will prepare a tailored quotation.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                Quote request received. Our sales team will reach out within 24 hours.
              </div>
            ) : null}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label>Full name</Label>
                <Input required placeholder="Muhammad Usman" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <Input type="email" required placeholder="usman@email.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input required placeholder="+92 333 444 7788" />
                </div>
              </div>
              <div>
                <Label>Project type</Label>
                <Input required placeholder="Residential renovation" />
              </div>
              <div>
                <Label>Products needed</Label>
                <Textarea required placeholder="List items, quantities, and preferred brands..." />
              </div>
              <Button type="submit" className="w-full">
                Submit request
              </Button>
            </form>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-lg font-semibold text-gray-900">Why request a quote?</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>Access contractor pricing for bulk orders.</li>
              <li>Receive recommendations from our product experts.</li>
              <li>Get delivery timelines aligned to your project schedule.</li>
            </ul>
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
              Average response time: under 12 hours.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
