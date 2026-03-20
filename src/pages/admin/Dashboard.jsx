import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { FileText, Package, ShoppingBag, Users } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { getDashboardBundleApi } from "../../services/adminApi";
import { formatCurrency } from "../../utils/currency";

const RANGE_OPTIONS = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom" },
];

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

const getStatusClasses = (status) => {
  if (status === "delivered" || status === "converted") return "bg-emerald-50 text-emerald-700";
  if (status === "shipped" || status === "responded") return "bg-blue-50 text-blue-700";
  if (status === "processing") return "bg-amber-50 text-amber-700";
  if (status === "cancelled" || status === "rejected") return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
};

export const Dashboard = () => {
  const [range, setRange] = useState("month");
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState(getTodayDateString());
  const [dashboard, setDashboard] = useState({
    stats: {
      revenue: 0,
      orderRevenue: 0,
      quoteRevenue: 0,
      orders: 0,
      products: 0,
      customers: 0,
    },
    pendingQuotes: 0,
    recentOrders: [],
    recentQuotes: [],
    revenueTrend: [],
    filter: null,
  });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setApplying(true);
      } else {
        setLoading(true);
      }
      setError("");

      const params = { range };
      if (range === "custom") {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const data = await getDashboardBundleApi(params);
      setDashboard(
        data || {
          stats: {
            revenue: 0,
            orderRevenue: 0,
            quoteRevenue: 0,
            orders: 0,
            products: 0,
            customers: 0,
          },
          pendingQuotes: 0,
          recentOrders: [],
          recentQuotes: [],
          revenueTrend: [],
          filter: null,
        }
      );
    } catch (apiError) {
      setError(apiError.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setApplying(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApplyFilters = async (event) => {
    event.preventDefault();

    if (range === "custom") {
      if (!startDate || !endDate) {
        setError("Please select both start and end date.");
        return;
      }
      if (startDate > endDate) {
        setError("Start date must be before end date.");
        return;
      }
    }

    await fetchDashboard({ showLoader: true });
  };

  const statCards = useMemo(
    () => [
      {
        title: "Revenue",
        value: formatCurrency(Number(dashboard.stats?.revenue || 0)),
        description: `Delivered orders + converted quotes (${range})`,
        icon: ShoppingBag,
      },
      {
        title: "Orders",
        value: Number(dashboard.stats?.orders || 0),
        description: "Active orders (excluding delivered/cancelled)",
        icon: FileText,
      },
      {
        title: "Products",
        value: Number(dashboard.stats?.products || 0),
        description: "Actual products added",
        icon: Package,
      },
      {
        title: "Customers",
        value: Number(dashboard.stats?.customers || 0),
        description: "Signed-up customers",
        icon: Users,
      },
    ],
    [dashboard.stats, range]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Live business insights based on real orders and quotes.</p>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-[220px_1fr_1fr_auto]" onSubmit={handleApplyFilters}>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Range</p>
            <Select value={range} onChange={(event) => setRange(event.target.value)}>
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {range === "custom" ? (
            <>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Start date</p>
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">End date</p>
                <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Window</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {dashboard.filter?.startDate || "-"} to {dashboard.filter?.endDate || "-"}
              </div>
            </div>
          )}

          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={loading || applying}>
              {applying ? "Applying..." : "Apply filter"}
            </Button>
          </div>
        </form>
      </Card>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-gray-500">Loading dashboard...</p> : null}

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

      <Card>
        <CardHeader>
          <CardTitle>Revenue trend</CardTitle>
          <p className="text-xs text-gray-500">
            Order revenue: {formatCurrency(Number(dashboard.stats?.orderRevenue || 0))} | Quote revenue: {" "}
            {formatCurrency(Number(dashboard.stats?.quoteRevenue || 0))}
          </p>
        </CardHeader>
        <CardContent className="h-[320px]">
          {dashboard.revenueTrend?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.revenueTrend}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} />
                <Line type="monotone" dataKey="orderRevenue" stroke="#0d9488" strokeWidth={2} />
                <Line type="monotone" dataKey="quoteRevenue" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No revenue data for selected range.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(dashboard.recentOrders || []).length === 0 ? (
              <p className="text-sm text-gray-500">No orders found.</p>
            ) : null}
            {(dashboard.recentOrders || []).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total || 0)}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(order.status)}`}>
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
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Pending quotes</p>
                <p className="text-xs text-gray-500">Need follow-up from sales team</p>
              </div>
              <p className="text-2xl font-semibold text-blue-600">{dashboard.pendingQuotes || 0}</p>
            </div>

            {(dashboard.recentQuotes || []).length === 0 ? (
              <p className="text-sm text-gray-500">No quotes found.</p>
            ) : null}

            {(dashboard.recentQuotes || []).map((quote) => (
              <div key={quote.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{quote.id}</p>
                  <p className="text-xs text-gray-500">{quote.name}</p>
                  <p className="text-xs text-gray-400">{quote.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(quote.total || 0)}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
