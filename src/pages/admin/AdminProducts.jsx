import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { products as initialProducts } from "../../data/products";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import { ProductDialog } from "../../components/admin/ProductDialog";
import { formatCurrency } from "../../utils/currency";

export const AdminProducts = () => {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.brand}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (productData) => {
    if (selectedProduct) {
      setProducts((prev) =>
        prev.map((item) => (item.id === selectedProduct.id ? { ...item, ...productData } : item))
      );
    } else {
      setProducts((prev) => [
        { ...productData, id: String(prev.length + 1), rating: 4.5, reviews: 10 },
        ...prev,
      ]);
    }
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your catalog inventory.</p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            className="w-full text-sm text-gray-700 outline-none"
            placeholder="Search products"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <Table>
          <THead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Stock</Th>
              <Th>Price</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <Td>
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                </Td>
                <Td>{product.category}</Td>
                <Td>{product.quantity}</Td>
                <Td>{formatCurrency(product.price)}</Td>
                <Td>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        product={selectedProduct}
        onSave={handleSave}
      />
    </div>
  );
};
