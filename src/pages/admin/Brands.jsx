import { brands } from "../../data/products";
import { Card, CardContent } from "../../components/ui/Card";

export const Brands = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Brands</h1>
      <p className="text-sm text-gray-500">Partner brands and performance tracking.</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {brands
        .filter((item) => item !== "All")
        .map((brand) => (
          <Card key={brand}>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-gray-900">{brand}</p>
              <p className="text-xs text-gray-500">Supplier in good standing</p>
            </CardContent>
          </Card>
        ))}
    </div>
  </div>
);
