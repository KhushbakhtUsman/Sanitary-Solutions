import { Modal } from "../ui/Modal";

export const QuoteDetailDialog = ({ open, onClose, quote }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={`Quote ${quote?.id || ""}`}
    description="Quote request details."
  >
    {quote ? (
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Customer:</span> {quote.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {quote.email}
        </p>
        <p>
          <span className="font-semibold">Phone:</span> {quote.phone}
        </p>
        <p>
          <span className="font-semibold">Products:</span> {quote.products}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {quote.status}
        </p>
        <p>
          <span className="font-semibold">Requested:</span> {quote.date}
        </p>
      </div>
    ) : null}
  </Modal>
);
