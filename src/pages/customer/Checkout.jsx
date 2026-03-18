import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Button } from "../../components/ui/Button";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/currency";

export const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-xl p-10 text-center">
          <p className="text-lg font-semibold text-gray-900">Order placed successfully</p>
          <p className="mt-2 text-sm text-gray-500">We will confirm your delivery schedule shortly.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto grid gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500">Provide delivery and billing details.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input required placeholder="Ayesha" />
              </div>
              <div>
                <Label>Last name</Label>
                <Input required placeholder="Khan" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required placeholder="ayesha@email.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required placeholder="+92 300 123 4567" />
            </div>
            <div>
              <Label>Delivery address</Label>
              <Input required placeholder="House 10, DHA Phase 5, Karachi" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>City</Label>
                <Input required placeholder="Karachi" />
              </div>
              <div>
                <Label>Postal code</Label>
                <Input required placeholder="75500" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Confirm order
            </Button>
          </form>
        </Card>

        <Card className="h-fit p-6">
          <p className="text-sm font-semibold text-gray-900">Order summary</p>
          <div className="mt-4 space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.product.name}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
              Total: {formatCurrency(getCartTotal())}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
