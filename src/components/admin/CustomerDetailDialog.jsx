import { Modal } from "../ui/Modal";
import { formatCurrency } from "../../utils/currency";

export const CustomerDetailDialog = ({ open, onClose, customer }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={customer?.name || "Customer details"}
    description="Customer purchase and profile snapshot."
  >
    {customer ? (
      <div className="space-y-3 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Email:</span> {customer.email}
        </p>
        <p>
          <span className="font-semibold">Phone:</span> {customer.phone}
        </p>
        <p>
          <span className="font-semibold">Address:</span>{" "}
          {[customer.address, customer.city, customer.postalCode].filter(Boolean).join(", ") || "-"}
        </p>
        <p>
          <span className="font-semibold">Total orders:</span> {customer.orders}
        </p>
        <p>
          <span className="font-semibold">Total spent:</span> {formatCurrency(customer.totalSpent)}
        </p>
        <p>
          <span className="font-semibold">Joined:</span> {customer.joined}
        </p>
      </div>
    ) : null}
  </Modal>
);
