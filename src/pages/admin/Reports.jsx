import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import { mockOrders } from "../../data/mockData";
import { formatCurrency } from "../../utils/currency";

export const Reports = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
      <p className="text-sm text-gray-500">Monthly revenue and order breakdown.</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue goal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-gray-900">{formatCurrency(320000)}</p>
          <p className="text-xs text-gray-500">75% achieved</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Repeat customers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-gray-900">38%</p>
          <p className="text-xs text-gray-500">Up 4% from last month</p>
        </CardContent>
      </Card>
    </div>

    <Card className="p-4">
      <Table>
        <THead>
          <tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Total</Th>
            <Th>Status</Th>
          </tr>
        </THead>
        <TBody>
          {mockOrders.map((order) => (
            <tr key={order.id} className="border-b border-gray-100">
              <Td className="font-semibold text-gray-900">{order.id}</Td>
              <Td>{order.customer}</Td>
              <Td>{formatCurrency(order.total)}</Td>
              <Td>{order.status}</Td>
            </tr>
          ))}
        </TBody>
      </Table>
    </Card>
  </div>
);
