import { categories } from "../../data/products";
import { Card, CardContent } from "../../components/ui/Card";

export const Categories = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
      <p className="text-sm text-gray-500">Manage category highlights and merchandising.</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories
        .filter((item) => item !== "All")
        .map((category) => (
          <Card key={category}>
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-gray-900">{category}</p>
              <p className="text-xs text-gray-500">Seasonal focus</p>
            </CardContent>
          </Card>
        ))}
    </div>
  </div>
);
