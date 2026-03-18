import { useState } from "react";
import { mockQuotes } from "../../data/mockData";
import { Card } from "../../components/ui/Card";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { QuoteDetailDialog } from "../../components/admin/QuoteDetailDialog";

export const AdminQuotes = () => {
  const [selectedQuote, setSelectedQuote] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
        <p className="text-sm text-gray-500">Manage incoming quote requests.</p>
      </div>

      <Card className="p-4">
        <Table>
          <THead>
            <tr>
              <Th>Quote</Th>
              <Th>Customer</Th>
              <Th>Products</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {mockQuotes.map((quote) => (
              <tr key={quote.id} className="border-b border-gray-100">
                <Td className="font-semibold text-gray-900">{quote.id}</Td>
                <Td>{quote.name}</Td>
                <Td>{quote.products}</Td>
                <Td>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {quote.status}
                  </span>
                </Td>
                <Td>{quote.date}</Td>
                <Td>
                  <Button size="sm" variant="outline" onClick={() => setSelectedQuote(quote)}>
                    View
                  </Button>
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </Card>

      <QuoteDetailDialog
        open={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        quote={selectedQuote}
      />
    </div>
  );
};
