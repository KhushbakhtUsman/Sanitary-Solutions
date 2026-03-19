import { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Table, TBody, Td, Th, THead } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { QuoteDetailDialog } from "../../components/admin/QuoteDetailDialog";
import { formatCurrency } from "../../utils/currency";
import { deleteQuoteApi, getQuotesApi, updateQuoteStatusApi } from "../../services/adminApi";

const QUOTE_STATUSES = ["pending", "responded", "converted", "rejected"];

export const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredQuotes = useMemo(
    () =>
      quotes.filter((quote) =>
        `${quote.id} ${quote.name} ${quote.email} ${quote.phone} ${quote.status}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [quotes, searchQuery]
  );

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await getQuotesApi({ page: 1, limit: 500, status: "all" });
      setQuotes(data);
    } catch (apiError) {
      setError(apiError.message || "Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleStatusChange = async (quote, nextStatus) => {
    setError("");
    setFeedback("");
    try {
      const updated = await updateQuoteStatusApi(quote.id, nextStatus);
      setQuotes((prev) => prev.map((item) => (item.id === quote.id ? updated : item)));
      setFeedback("Quote status updated.");
    } catch (apiError) {
      setError(apiError.message || "Failed to update quote status.");
    }
  };

  const handleDelete = async (quote) => {
    const confirmed = window.confirm(`Delete quote "${quote.id}"?`);
    if (!confirmed) return;

    setError("");
    setFeedback("");

    try {
      await deleteQuoteApi(quote.id);
      setQuotes((prev) => prev.filter((item) => item.id !== quote.id));
      setFeedback("Quote deleted successfully.");
    } catch (apiError) {
      setError(apiError.message || "Failed to delete quote.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500">
            Search, view details, edit status, and delete quote requests.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            className="w-full text-sm text-gray-700 outline-none sm:w-60"
            placeholder="Search quotes"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <Card className="p-4">
        {loading ? <p className="text-sm text-gray-500">Loading quotes...</p> : null}
        {feedback ? <p className="mb-4 text-sm text-emerald-600">{feedback}</p> : null}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        <Table>
          <THead>
            <tr>
              <Th>Quote</Th>
              <Th>Customer</Th>
              <Th>Email</Th>
              <Th>Products</Th>
              <Th>Total amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th></Th>
            </tr>
          </THead>
          <TBody>
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} className="border-b border-gray-100">
                <Td className="font-semibold text-gray-900">{quote.id}</Td>
                <Td>{quote.name}</Td>
                <Td>{quote.email}</Td>
                <Td>{quote.products}</Td>
                <Td>{formatCurrency(quote.total || 0)}</Td>
                <Td>
                  <Select
                    value={quote.status}
                    onChange={(event) => handleStatusChange(quote, event.target.value)}
                  >
                    {QUOTE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>{quote.date}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedQuote(quote)}>
                      View
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(quote)}>
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

      <QuoteDetailDialog
        open={Boolean(selectedQuote)}
        onClose={() => setSelectedQuote(null)}
        quote={selectedQuote}
      />
    </div>
  );
};
