import { useState } from "react";
import { Filter } from "lucide-react";
import { mockOrders } from "../../data/mockData";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import { OrderDetailDialog } from "../../components/admin/OrderDetailDialog";
import { formatCurrency } from "../../utils/currency";

export const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = mockOrders.filter((order) =>
    statusFilter === "all" ? true : order.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Track fulfillment and delivery progress.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
          </Select>
        </div>
      </div>

      <Card className="p-4">
        <Table>
          <THead>
            <tr>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Status</Th>
              <Th>Total</Th>
              <Th>Date</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100">
                <Td className="font-semibold text-gray-900">{order.id}</Td>
                <Td>{order.customer}</Td>
                <Td>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                    {order.status}
                  </span>
                </Td>
                <Td>{formatCurrency(order.total)}</Td>
                <Td>{order.date}</Td>
                <Td>
                  <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                    View
                  </Button>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <OrderDetailDialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
};
