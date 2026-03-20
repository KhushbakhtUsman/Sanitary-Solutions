import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { ImageWithFallback } from "../../components/common/ImageWithFallback";
import { Button } from "../../components/ui/Button";
import { useCart } from "../../contexts/CartContext";
import { formatCurrency } from "../../utils/currency";
import { getStoreProductByIdApi } from "../../services/storeApi";

export const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getStoreProductByIdApi(id);
        setProduct(data);
      } catch (apiError) {
        setError(apiError.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-600">{error || "Product not found."}</p>
          <Link to="/products">
            <Button className="mt-4">Back to products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="h-[420px] w-full rounded-2xl object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-blue-600">{product.category}</p>
            <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
           
          </div>

          <p className="text-gray-600">{product.description}</p>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">Price</p>
            <p className="text-3xl font-semibold text-blue-600">{formatCurrency(product.price)}</p>
            <p className="mt-2 text-sm text-gray-500">
              Stock status: {product.inStock ? "Available" : "Out of stock"}
            </p>
            <Button className="mt-4 w-full" onClick={() => addToCart(product)} disabled={!product.inStock}>
              <ShoppingCart className="h-4 w-4" />
              Add to cart
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Brand</p>
              <p className="text-sm font-semibold text-gray-900">{product.brand}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Inventory</p>
              <p className="text-sm font-semibold text-gray-900">{product.quantity} units</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
