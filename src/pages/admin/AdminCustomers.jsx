import { useState } from "react";
import { mockCustomers } from "../../data/mockData";
import { Card } from "../../components/ui/Card";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { CustomerDetailDialog } from "../../components/admin/CustomerDetailDialog";
import { formatCurrency } from "../../utils/currency";

export const AdminCustomers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">Customer profiles and spend history.</p>
      </div>

      <Card className="p-4">
        <Table>
          <THead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Orders</Th>
              <Th>Total spent</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {mockCustomers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-100">
                <Td className="font-semibold text-gray-900">{customer.name}</Td>
                <Td>{customer.email}</Td>
                <Td>{customer.orders}</Td>
                <Td>{formatCurrency(customer.totalSpent)}</Td>
                <Td>
                  <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)}>
                    View
                  </Button>
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
