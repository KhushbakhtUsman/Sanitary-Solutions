import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { formatCurrency } from "../../utils/currency";

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-xl p-10 text-center">
          <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
          <p className="mt-2 text-sm text-gray-500">Browse products and add items to get started.</p>
          <Link to="/products">
            <Button className="mt-6">Shop products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-gray-900">Cart</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.product.category}</p>
                    <p className="mt-2 text-sm font-semibold text-blue-600">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center text-sm font-semibold text-gray-700">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="h-fit p-6">
            <p className="text-sm text-gray-500">Order summary</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="text-gray-900">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                Total: {formatCurrency(getCartTotal())}
              </div>
            </div>
            <Link to="/checkout">
              <Button className="mt-6 w-full">Proceed to checkout</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
