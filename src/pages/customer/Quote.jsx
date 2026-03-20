import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { createQuoteRequestApi, getStoreProductsApi } from "../../services/storeApi";
import { formatCurrency } from "../../utils/currency";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  projectType: "",
};

export const Quote = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError("");
        const response = await getStoreProductsApi({ page: 1, limit: 500 });
        setProducts(response.data || []);
      } catch (apiError) {
        setProductsError(apiError.message || "Failed to load products for quote.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!user || user.role !== "customer") return;

    setFormData((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) =>
      `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query)
    );
  }, [products, productSearch]);

  const selectedQuoteItems = useMemo(() => {
    return Object.values(selectedItems)
      .map((item) => ({
        ...item,
        quantity: Number.parseInt(item.quantity, 10),
      }))
      .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0);
  }, [selectedItems]);

  const selectedProductsCount = useMemo(
    () => selectedQuoteItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedQuoteItems]
  );

  const selectedTotal = useMemo(
    () =>
      selectedQuoteItems.reduce(
        (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
        0
      ),
    [selectedQuoteItems]
  );

  const setItemChecked = (product, checked) => {
    const productId = product.id || product._id;
    if (!productId) return;

    setSelectedItems((prev) => {
      const next = { ...prev };
      if (!checked) {
        delete next[productId];
        return next;
      }

      next[productId] =
        next[productId] || {
          productId,
          productName: product.name,
          brand: product.brand || "",
          quantity: 1,
          unitPrice: Number(product.price || 0),
        };

      return next;
    });
  };

  const setItemField = (productId, key, value) => {
    setSelectedItems((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;

      return {
        ...prev,
        [productId]: {
          ...existing,
          [key]: value,
        },
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (selectedQuoteItems.length === 0) {
      setSubmitting(false);
      setError("Please select at least one product for quote.");
      return;
    }

    const productsNeeded = selectedQuoteItems
      .map((item) => `${item.productName} (${item.brand || "No brand"}) x ${item.quantity}`)
      .join(", ");

    try {
      await createQuoteRequestApi({
        ...formData,
        productsNeeded,
        productsCount: selectedProductsCount,
        total: Number(selectedTotal.toFixed(2)),
        quoteItems: selectedQuoteItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          brand: item.brand,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice || 0),
        })),
      });

      setSubmitted(true);
      setFormData(INITIAL_FORM);
      setSelectedItems({});
    } catch (apiError) {
      setError(apiError.message || "Failed to submit quote request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900">Request a quote</h1>
            <p className="text-sm text-gray-500">
              Select products, set quantity and preferred brand, and submit your quote request.
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
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Label>Products needed</Label>
                  <Input
                    className="max-w-xs"
                    placeholder="Search products"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                  />
                </div>

                <div className="max-h-[380px] space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3">
                  {loadingProducts ? <p className="text-sm text-gray-500">Loading products...</p> : null}
                  {productsError ? <p className="text-sm text-red-600">{productsError}</p> : null}

                  {!loadingProducts && !productsError && filteredProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">No products match your search.</p>
                  ) : null}

                  {filteredProducts.map((product) => {
                    const productId = product.id || product._id;
                    const selected = selectedItems[productId];

                    return (
                      <div key={productId} className="rounded-lg border border-gray-200 p-3">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={Boolean(selected)}
                            onChange={(event) => setItemChecked(product, event.target.checked)}
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                              <p className="text-sm font-semibold text-blue-600">
                                {formatCurrency(Number(product.price || 0))}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {product.category} | Default brand: {product.brand}
                            </p>
                          </div>
                        </label>

                        {selected ? (
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min={1}
                                value={selected.quantity}
                                onChange={(event) =>
                                  setItemField(productId, "quantity", event.target.value)
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label>Brand</Label>
                              <Input
                                value={selected.brand}
                                onChange={(event) => setItemField(productId, "brand", event.target.value)}
                                placeholder="Preferred brand"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={submitting || loadingProducts}>
                {submitting ? "Submitting..." : "Submit request"}
              </Button>
            </form>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-lg font-semibold text-gray-900">Quote summary</h2>
            <p className="mt-2 text-sm text-gray-600">
              Selected items: <span className="font-semibold">{selectedProductsCount}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Estimated total: <span className="font-semibold">{formatCurrency(selectedTotal)}</span>
            </p>
            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
              Admin can update quote status. You can track it from the tracking page after login.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
