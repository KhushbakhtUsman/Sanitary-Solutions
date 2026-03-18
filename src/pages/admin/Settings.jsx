import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Button } from "../../components/ui/Button";

export const Settings = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <p className="text-sm text-gray-500">Update store preferences and alerts.</p>
    </div>

    <Card className="max-w-xl p-6">
      <form className="space-y-4">
        <div>
          <Label>Store name</Label>
          <Input defaultValue="Sanitary Solutions" />
        </div>
        <div>
          <Label>Support email</Label>
          <Input type="email" defaultValue="support@sanitarysolutions.com" />
        </div>
        <div>
          <Label>Low stock threshold</Label>
          <Input type="number" defaultValue={20} />
        </div>
        <Button type="submit">Save changes</Button>
      </form>
    </Card>
  </div>
);
