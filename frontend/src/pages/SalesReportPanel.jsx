import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "http://localhost:3000";
const CURRENCY = "Tk ";

const formatCurrency = (value) =>
  `${CURRENCY}${Number(value || 0).toLocaleString("en-BD")}`;

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "N/A";

const buildReportRows = (orders, farmerId) =>
  orders
    .filter(order => order.status === "delivered")
    .flatMap(order =>
      (order.items || [])
        .filter(item => String(item.farmerId) === String(farmerId))
        .map(item => ({
          productName: item.name || item.productId?.name?.en || "Product",
          quantity: Number(item.qty || 0),
          price: Number(item.price || 0),
          totalAmount: Number(item.price || 0) * Number(item.qty || 0),
          customerName: order.address?.name || order.customerId?.name || "Customer",
          orderDate: order.createdAt,
          orderStatus: order.status
        }))
    );

function SalesReportPanel() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const farmer = JSON.parse(localStorage.getItem("user"));

  const generateReport = async () => {
    if (!farmer?._id) return;

    setLoading(true);
    setGenerated(false);

    try {
      const res = await fetch(`${API_BASE}/api/orders/farmer/${farmer._id}`);
      const orders = await res.json();
      const reportRows = buildReportRows(Array.isArray(orders) ? orders : [], farmer._id);
      const deliveredOrderIds = new Set(
        (Array.isArray(orders) ? orders : [])
          .filter(order => order.status === "delivered")
          .map(order => order._id)
      );

      setRows(reportRows);
      setSummary({
        totalSales: reportRows.reduce((sum, row) => sum + row.totalAmount, 0),
        totalOrders: deliveredOrderIds.size,
        totalQuantity: reportRows.reduce((sum, row) => sum + row.quantity, 0),
        totalSale: reportRows.reduce((sum, row) => sum + row.totalAmount, 0)
      });
      setGenerated(true);
    } catch (error) {
      console.error("Sales report failed:", error);
      setRows([]);
      setSummary(null);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF();
    const generatedAt = new Date();

    doc.setFontSize(18);
    doc.text("AgroLink Sales Report", 14, 18);

    doc.setFontSize(11);
    doc.text(`Farmer: ${farmer?.name || "Farmer"}`, 14, 30);
    doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 38);

    autoTable(doc, {
      startY: 48,
      head: [["Summary", "Value"]],
      body: [
        ["Total Sales", formatCurrency(summary.totalSales)],
        ["Total Orders", summary.totalOrders],
        ["Total Quantity Sold", summary.totalQuantity],
        ["Total Sale", formatCurrency(summary.totalSale)]
      ],
      headStyles: { fillColor: [22, 101, 52] }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [[
        "Product",
        "Quantity",
        "Price",
        "Total",
        "Customer",
        "Order Date",
        "Status"
      ]],
      body: rows.map(row => [
        row.productName,
        row.quantity,
        formatCurrency(row.price),
        formatCurrency(row.totalAmount),
        row.customerName,
        formatDateTime(row.orderDate),
        row.orderStatus
      ]),
      headStyles: { fillColor: [22, 101, 52] },
      styles: { fontSize: 8 }
    });

    doc.save("sales-report.pdf");
  };

  return (
    <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Sales Report
          </h3>
          
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-green-900/10 transition"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            Generate Report
          </button>

          <button
            onClick={downloadPDF}
            disabled={!summary || rows.length === 0}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl font-semibold transition"
          >
            <Download size={18} />
            Download 
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Sales" value={formatCurrency(summary.totalSales)} />
          <SummaryCard title="Total Orders" value={summary.totalOrders} />
          <SummaryCard title="Quantity Sold" value={summary.totalQuantity} />
          <SummaryCard title="Total Sale" value={formatCurrency(summary.totalSale)} />
        </div>
      )}

      {generated && rows.length === 0 ? (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center text-gray-500">
          No delivered orders found for this farmer.
        </div>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4">Product Name</th>
                <th className="px-4">Quantity</th>
                <th className="px-4">Price</th>
                <th className="px-4">Total Amount</th>
                <th className="px-4">Customer Name</th>
                <th className="px-4">Order Date</th>
                <th className="px-4">Order Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.productName}-${index}`} className="bg-gray-50 hover:bg-green-50 transition">
                  <td className="px-4 py-3 rounded-l-2xl font-semibold text-gray-900">
                    {row.productName}
                  </td>
                  <td className="px-4 py-3">{row.quantity}</td>
                  <td className="px-4 py-3">{formatCurrency(row.price)}</td>
                  <td className="px-4 py-3 font-bold text-green-700">
                    {formatCurrency(row.totalAmount)}
                  </td>
                  <td className="px-4 py-3">{row.customerName}</td>
                  <td className="px-4 py-3">{formatDateTime(row.orderDate)}</td>
                  <td className="px-4 py-3 rounded-r-2xl">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {row.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default SalesReportPanel;
