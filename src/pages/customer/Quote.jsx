import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { createQuoteRequestApi } from "../../services/storeApi";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  projectType: "",
  productsNeeded: "",
};

export const Quote = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createQuoteRequestApi(formData);
      setSubmitted(true);
      setFormData(INITIAL_FORM);
    } catch (apiError) {
      setError(apiError.message || "Failed to submit quote request.");
    } finally {
      setSubmitting(false);
    }
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
                <Input
                  required
                  placeholder="Muhammad Usman"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    placeholder="usman@email.com"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    required
                    placeholder="+92 333 444 7788"
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Project type</Label>
                <Input
                  required
                  placeholder="Residential renovation"
                  value={formData.projectType}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, projectType: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Products needed</Label>
                <Textarea
                  required
                  placeholder="List items, quantities, and preferred brands..."
                  value={formData.productsNeeded}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, productsNeeded: event.target.value }))
                  }
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit request"}
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
