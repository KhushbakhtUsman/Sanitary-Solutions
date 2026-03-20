import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { CustomerDetailDialog } from "../../components/admin/CustomerDetailDialog";
import { formatCurrency } from "../../utils/currency";
import { deleteCustomerApi, getCustomerByIdApi, getCustomersApi } from "../../services/adminApi";

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async (search = "") => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getCustomersApi({ page: 1, limit: 500, search });
      setCustomers(data || []);
    } catch (apiError) {
      setError(apiError.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [customers]
  );

  const handleView = async (customer) => {
    try {
      setError("");
      const detailed = await getCustomerByIdApi(customer.id || customer._id);
      setSelectedCustomer(detailed);
    } catch (apiError) {
      setError(apiError.message || "Failed to load customer details.");
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}" and related orders/quotes/carts?`
    );
    if (!confirmed) return;

    setError("");
    setFeedback("");

    try {
      await deleteCustomerApi(customer.id || customer._id);
      setCustomers((prev) => prev.filter((item) => (item.id || item._id) !== (customer.id || customer._id)));
      if ((selectedCustomer?.id || selectedCustomer?._id) === (customer.id || customer._id)) {
        setSelectedCustomer(null);
      }
      setFeedback("Customer deleted successfully.");
    } catch (apiError) {
      setError(apiError.message || "Failed to delete customer.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">
            Signed-up customer details with orders and total spend.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            className="w-full text-sm text-gray-700 outline-none sm:w-60"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <Card className="p-4">
        {loading ? <p className="text-sm text-gray-500">Loading customers...</p> : null}
        {feedback ? <p className="mb-4 text-sm text-emerald-600">{feedback}</p> : null}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <Table>
          <THead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Total orders</Th>
              <Th>Total spent</Th>
              <Th>Sign up</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {sortedCustomers.length === 0 && !loading ? (
              <tr>
                <Td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                  No signed-up customers found.
                </Td>
              </tr>
            ) : null}

            {sortedCustomers.map((customer) => (
              <tr key={customer.id || customer._id} className="border-b border-gray-100">
                <Td className="font-semibold text-gray-900">{customer.name}</Td>
                <Td>{customer.email}</Td>
                <Td>{customer.orders}</Td>
                <Td>{formatCurrency(Number(customer.totalSpent || 0))}</Td>
                <Td>{customer.joined}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(customer)}>
                      View
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(customer)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <CustomerDetailDialog
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
};
