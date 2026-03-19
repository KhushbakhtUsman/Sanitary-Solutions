import { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";
import { createContactMessageApi, getPublicStoreSettingsApi } from "../../services/storeApi";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const DEFAULT_STORE_DETAILS = {
  storeAddress: "27 Mall Road, Clifton, Karachi",
  phoneNumber: "+92 300 555 7788",
  supportEmail: "sales@sanitarysolutions.com",
};

export const Contact = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [storeDetails, setStoreDetails] = useState(DEFAULT_STORE_DETAILS);

  useEffect(() => {
    const loadStoreDetails = async () => {
      try {
        const data = await getPublicStoreSettingsApi();
        setStoreDetails({
          storeAddress: data.storeAddress || DEFAULT_STORE_DETAILS.storeAddress,
          phoneNumber: data.phoneNumber || DEFAULT_STORE_DETAILS.phoneNumber,
          supportEmail: data.supportEmail || DEFAULT_STORE_DETAILS.supportEmail,
        });
      } catch (apiError) {
        // Keep fallback details if API call fails
      }
    };

    loadStoreDetails();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createContactMessageApi(formData);
      setSubmitted(true);
      setFormData(INITIAL_FORM);
    } catch (apiError) {
      setError(apiError.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Contact us</h1>
            <p className="text-sm text-gray-500">We would love to support your next project.</p>

            {submitted ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                Message sent successfully. Our team will contact you soon.
              </div>
            ) : null}

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label>Name</Label>
                <Input
                  required
                  placeholder="Areeba Malik"
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
                    placeholder="areeba@email.com"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    placeholder="+92 300 123 8899"
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  required
                  placeholder="Tell us about your requirement..."
                  value={formData.message}
                  onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-lg font-semibold text-gray-900">Showroom details</h2>
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-blue-600" />
                <span>{storeDetails.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>{storeDetails.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>{storeDetails.supportEmail}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
