import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { FileText, Package, ShoppingBag, Users } from "lucide-react";
import { products } from "../../data/products";
import { mockOrders, mockCustomers, mockQuotes, revenueByMonth, customerSatisfaction } from "../../data/mockData";
import { formatCurrency } from "../../utils/currency";

const pieColors = ["#2563eb", "#f59e0b", "#ef4444"];

export const Dashboard = () => {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingQuotes = mockQuotes.filter((quote) => quote.status === "pending").length;

  const statCards = [
    {
      title: "Revenue",
      value: formatCurrency(totalRevenue),
      description: "This month",
      icon: ShoppingBag,
    },
    {
      title: "Orders",
      value: mockOrders.length,
      description: "Active orders",
      icon: FileText,
    },
    {
      title: "Products",
      value: products.length,
      description: "SKU catalog",
      icon: Package,
    },
    {
      title: "Customers",
      value: mockCustomers.length,
      description: "Registered",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Monitor store health and sales momentum.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">{stat.title}</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.description}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByMonth}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={customerSatisfaction} dataKey="value" innerRadius={50} outerRadius={80}>
                  {customerSatisfaction.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Pending quotes</p>
                  <p className="text-xs text-gray-500">Require follow-up</p>
                </div>
                <p className="text-2xl font-semibold text-blue-600">{pendingQuotes}</p>
              </div>
              {mockQuotes.slice(0, 3).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{quote.name}</p>
                    <p className="text-xs text-gray-500">{quote.products} products</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {quote.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
