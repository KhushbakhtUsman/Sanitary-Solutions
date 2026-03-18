import { Modal } from "../ui/Modal";
import { formatCurrency } from "../../utils/currency";

export const OrderDetailDialog = ({ open, onClose, order }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={`Order ${order?.id || ""}`}
    description="Order details and customer information."
  >
    {order ? (
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Customer:</span> {order.customer}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {order.email}
        </p>
        <p>
          <span className="font-semibold">Phone:</span> {order.phone}
        </p>
        <p>
          <span className="font-semibold">Address:</span> {order.address}
        </p>
        <p>
          <span className="font-semibold">Total:</span> {formatCurrency(order.total)}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {order.status}
        </p>
      </div>
    ) : null}
  </Modal>
);
