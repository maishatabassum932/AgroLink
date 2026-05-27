import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, PackageCheck, ReceiptText, ShoppingBag, Truck } from "lucide-react";
import { initSocket } from "../utils/socket";

const API_BASE = "http://localhost:3000";
const CURRENCY = "Tk ";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Approved",
  approved: "Approved",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const formatCurrency = (value) =>
  `${CURRENCY}${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-BD", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(new Date(value))
    : "N/A";

const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-BD", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date(value))
    : "N/A";

const getPaymentStatus = (method) =>
  method === "cod" ? "Cash on Delivery" : method ? "Paid" : "Not available";

const getProductName = (item) =>
  item?.productId?.name?.en || item?.productId?.name || item?.name || "Product";

const getImageSrc = (item) => {
  const image = item?.productId?.image || item?.image;
  if (!image) return "";
  return image.startsWith("http") ? image : `${API_BASE}${image.startsWith("/") ? "" : "/"}${image}`;
};

const getFarmerName = (item) =>
  item?.farmerId?.name || item?.farmerName || "Farmer";

const getBadgeClass = (status) =>
  statusStyles[String(status || "pending").toLowerCase()] || statusStyles.pending;

function OrderHistory() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrdersData = async () => {
      if (!user?._id) {
        navigate("/login");
        return;
      }

      try {
        setError("");
        const res = await fetch(`${API_BASE}/api/orders/user/${user._id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Unable to load order history");
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, [user?._id, navigate]);

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/orders/user/${user._id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unable to load order history");
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load order history");
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    const socket = initSocket();

    socket.on("order:statusUpdated", (updatedOrder) => {
      if (String(updatedOrder?.customerId?._id || updatedOrder?.customerId) === String(user?._id)) {
        fetchOrders();
      }
    });

    socket.on("order:placed", (newOrder) => {
      if (String(newOrder?.customerId?._id || newOrder?.customerId) === String(user?._id)) {
        fetchOrders();
      }
    });

    return () => {
      socket.off("order:statusUpdated");
      socket.off("order:placed");
    };
  }, [user?._id, fetchOrders]);

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.finalTotal || 0),
    0
  );

  const deliveredCount = orders.filter(order => order.status === "delivered").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-full bg-white border border-green-100 shadow-sm flex items-center justify-center hover:bg-green-700 hover:-translate-x-0.5 transition hover:text-white"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
             
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Order History
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
            <div className="bg-white border border-green-100 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map(item => (
              <div key={item} className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/3 mb-5" />
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="h-24 bg-gray-100 rounded-xl md:col-span-2" />
                  <div className="h-24 bg-gray-100 rounded-xl" />
                  <div className="h-24 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
            <ReceiptText className="mx-auto text-red-500 mb-3" size={42} />
            <h2 className="text-xl font-bold text-gray-900">Could not load orders</h2>
            <p className="text-gray-500 mt-2">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-5 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-green-100 rounded-3xl p-10 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-green-50 mx-auto flex items-center justify-center mb-5">
              <ShoppingBag className="text-green-700" size={38} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Your previous purchases, payment details, farmer information, and delivery status will appear here.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition shadow-sm"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <SummaryCard icon={<ReceiptText size={22} />} label="Invoices" value={orders.length} />
              <SummaryCard icon={<PackageCheck size={22} />} label="Delivered" value={deliveredCount} />
              <SummaryCard icon={<Truck size={22} />} label="In Progress" value={orders.length - deliveredCount} />
            </div>

            {orders.map(order => {
              const status = String(order.status || "pending").toLowerCase();
              const deliveryStatus = status === "delivered" ? "Delivered" : status === "cancelled" ? "Cancelled" : "In Progress";

              return (
                <article
                  key={order._id}
                  className="bg-white border border-green-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden"
                >
                  <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</p>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 break-all">
                        #{String(order._id).slice(-10).toUpperCase()}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={status} />
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getBadgeClass(status)}`}>
                        Delivery: {deliveryStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 md:p-6 grid lg:grid-cols-[1fr_320px] gap-6">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left border-separate border-spacing-y-3">
                        <thead>
                          <tr className="text-xs uppercase tracking-wide text-gray-500">
                            <th className="px-4">Product</th>
                            <th className="px-4">Farmer</th>
                            <th className="px-4">Qty</th>
                            <th className="px-4">Unit Price</th>
                            <th className="px-4">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(order.items || []).map(item => (
                            <tr key={item._id || `${order._id}-${item.name}`} className="bg-gray-50 hover:bg-green-50/70 transition">
                              <td className="px-4 py-3 rounded-l-2xl">
                                <div className="flex items-center gap-3">
                                  {getImageSrc(item) ? (
                                    <img
                                      src={getImageSrc(item)}
                                      alt={getProductName(item)}
                                      className="w-14 h-14 rounded-xl object-cover border border-white shadow-sm bg-white"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                                      <ShoppingBag size={22} />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-gray-900">{getProductName(item)}</p>
                                    <p className="text-xs text-gray-500">Product details from invoice summary</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700">{getFarmerName(item)}</td>
                              <td className="px-4 py-3 font-semibold text-gray-900">{item.qty}</td>
                              <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                              <td className="px-4 py-3 rounded-r-2xl font-bold text-green-700">
                                {formatCurrency(Number(item.price || 0) * Number(item.qty || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <aside className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl p-5 h-fit">
                      <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                        <InfoPill icon={<CalendarDays size={16} />} label="Date" value={formatDate(order.createdAt)} />
                        <InfoPill icon={<Clock size={16} />} label="Time" value={formatTime(order.createdAt)} />
                      </div>

                      <div className="space-y-3 text-sm">
                        <InfoRow label="Payment Status" value={getPaymentStatus(order.paymentMethod)} />
                        <InfoRow label="Subtotal" value={formatCurrency(order.totalPrice)} />
                        <InfoRow label="Delivery Charge" value={formatCurrency(order.deliveryCharge)} />
                        <InfoRow label="Quantity Ordered" value={(order.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0)} />
                        <div className="pt-4 mt-4 border-t border-green-100 flex items-center justify-between">
                          <span className="text-gray-600 font-semibold">Total Price</span>
                          <span className="text-2xl font-bold text-green-700">{formatCurrency(order.finalTotal)}</span>
                        </div>
                      </div>
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getBadgeClass(normalized)}`}>
      {statusLabels[normalized] || "Pending"}
    </span>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-green-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-green-100">
      <div className="flex items-center gap-2 text-green-700 mb-1">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

export default OrderHistory;
