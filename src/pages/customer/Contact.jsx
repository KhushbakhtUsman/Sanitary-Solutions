import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Textarea } from "../../components/ui/Textarea";
import { Button } from "../../components/ui/Button";

export const Contact = () => (
  <div className="bg-slate-50">
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Contact us</h1>
          <p className="text-sm text-gray-500">We would love to support your next project.</p>

          <form className="mt-6 space-y-5">
            <div>
              <Label>Name</Label>
              <Input placeholder="Areeba Malik" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="areeba@email.com" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="+92 300 123 8899" />
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea placeholder="Tell us about your requirement..." />
            </div>
            <Button type="submit">Send message</Button>
          </form>
        </Card>

        <Card className="h-fit p-6">
          <h2 className="text-lg font-semibold text-gray-900">Showroom details</h2>
          <div className="mt-4 space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 h-4 w-4 text-blue-600" />
              <span>27 Mall Road, Clifton, Karachi</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>+92 300 555 7788</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>sales@sanitarysolutions.com</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);
