import { useMemo, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CURRENCY = "Tk ";

const formatCurrency = (value) =>
  `${CURRENCY}${Number(value || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2
  })}`;

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "N/A";

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      })
    : "N/A";

const getUserName = (users, id, fallback) => {
  const user = users.find(item => String(item._id) === String(id));
  return user?.name || fallback || "N/A";
};

const getProductName = (item) =>
  item?.productId?.name?.en || item?.productId?.name || item?.name || "Product";

function AdminSalesReportPanel({ users = [], orders = [] }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatedData = useMemo(() => {
    const farmers = users.filter(user => user.role === "farmer");
    const customers = users.filter(user => user.role === "customer");
    const deliveredOrders = orders.filter(order => order.status === "delivered");
    const pendingOrders = orders.filter(order => order.status === "pending");
    const cancelledOrders = orders.filter(order => order.status === "cancelled");

    const productTotals = {};
    const farmerTotals = {};
    const recentRows = [];

    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const farmerId = item.farmerId?._id || item.farmerId;
        const productName = getProductName(item);
        const quantity = Number(item.qty || 0);
        const price = Number(item.price || 0);
        const totalAmount = quantity * price;
        const farmerName = getUserName(users, farmerId, item.farmerId?.name);
        const customerName =
          order.address?.name ||
          order.customerId?.name ||
          getUserName(users, order.customerId?._id || order.customerId, "Customer");

        if (order.status === "delivered") {
          productTotals[productName] = (productTotals[productName] || 0) + quantity;

          if (!farmerTotals[farmerId]) {
            farmerTotals[farmerId] = {
              farmerName,
              totalProductsSold: 0,
              totalSale: 0,
              orderIds: new Set()
            };
          }

          farmerTotals[farmerId].totalProductsSold += quantity;
          farmerTotals[farmerId].totalSale += totalAmount;
          farmerTotals[farmerId].orderIds.add(String(order._id));
        }

        recentRows.push({
          productName,
          customerName,
          farmerName,
          quantity,
          totalAmount,
          orderStatus: order.status,
          paymentStatus: order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid",
          orderDate: order.createdAt,
          orderTime: order.createdAt
        });
      });
    });

    const bestSellingProduct =
      Object.entries(productTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      summary: {
        totalSale: deliveredOrders.reduce((sum, order) => sum + Number(order.finalTotal || 0), 0),
        platformSale: deliveredOrders.reduce(
          (sum, order) =>
            sum +
            (order.items || []).reduce(
              (itemSum, item) => itemSum + Number(item.commission || 0),
              0
            ),
          0
        ),
        totalOrders: orders.length,
        deliveredOrders: deliveredOrders.length,
        pendingOrders: pendingOrders.length,
        cancelledOrders: cancelledOrders.length,
        totalFarmers: farmers.length,
        totalCustomers: customers.length,
        bestSellingProduct
      },
      farmerRows: Object.values(farmerTotals)
        .map(row => ({
          ...row,
          totalOrders: row.orderIds.size
        }))
        .sort((a, b) => b.totalSale - a.totalSale),
      orderRows: recentRows
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 10)
    };
  }, [orders, users]);

  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      setReport(generatedData);
      setLoading(false);
    }, 300);
  };

  const downloadPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const generatedAt = new Date();

    doc.setFontSize(18);
    doc.text("AgroLink", 14, 18);
    doc.setFontSize(14);
    doc.text("Admin  Report", 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt.toLocaleString()}`, 14, 36);

    autoTable(doc, {
      startY: 46,
      head: [["Summary", "Value", "Summary", "Value"]],
      body: [
        ["Total Sales", formatCurrency(report.summary.totalSale), "Platform Sale", formatCurrency(report.summary.platformSale)],
        ["Total Orders", report.summary.totalOrders, "Delivered Orders", report.summary.deliveredOrders],
        ["Pending Orders", report.summary.pendingOrders, "Cancelled Orders", report.summary.cancelledOrders],
        ["Total Farmers", report.summary.totalFarmers, "Total Customers", report.summary.totalCustomers],
        ["Best Selling Product", report.summary.bestSellingProduct, "", ""]
      ],
      headStyles: { fillColor: [22, 101, 52] },
      styles: { fontSize: 9 }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Farmer Name", "Products Sold", "Sale", "Orders"]],
      body: report.farmerRows.map(row => [
        row.farmerName,
        row.totalProductsSold,
        formatCurrency(row.totalSale),
        row.totalOrders
      ]),
      headStyles: { fillColor: [22, 101, 52] },
      styles: { fontSize: 8 }
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Product", "Customer", "Farmer", "Qty", "Total", "Status", "Payment", "Date", "Time"]],
      body: report.orderRows.map(row => [
        row.productName,
        row.customerName,
        row.farmerName,
        row.quantity,
        formatCurrency(row.totalAmount),
        row.orderStatus,
        row.paymentStatus,
        formatDate(row.orderDate),
        formatTime(row.orderTime)
      ]),
      headStyles: { fillColor: [22, 101, 52] },
      styles: { fontSize: 7 }
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.text("AgroLink Admin Report", 14, pageHeight - 10);
    doc.save("admin-report.pdf");
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 mt-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Admin Report
          </h2>
          
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
            disabled={!report}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl font-semibold transition"
          >
            <Download size={18} />
            Download 
          </button>
        </div>
      </div>

      {!report ? (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center text-gray-500">
          Click Generate Admin Report.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <SummaryCard title="Total Sales" value={formatCurrency(report.summary.totalSale)} />
            <SummaryCard title="Platform Sale" value={formatCurrency(report.summary.platformSale)} />
            <SummaryCard title="Total Orders" value={report.summary.totalOrders} />
            <SummaryCard title="Total Farmers" value={report.summary.totalFarmers} />
            <SummaryCard title="Total Customers" value={report.summary.totalCustomers} />
            <SummaryCard title="Delivered Orders" value={report.summary.deliveredOrders} />
            <SummaryCard title="Pending Orders" value={report.summary.pendingOrders} />
          </div>

          <ReportTable title="Farmer Performance">
            <thead>
              <tr className="text-gray-500 text-left text-sm">
                <th className="px-4">Farmer Name</th>
                <th className="px-4">Total Products Sold</th>
                <th className="px-4">Total Sales</th>
                <th className="px-4">Total Orders</th>
              </tr>
            </thead>
            <tbody>
              {report.farmerRows.length === 0 ? (
                <EmptyRow colSpan={4} text="No delivered farmer sales found." />
              ) : (
                report.farmerRows.map(row => (
                  <tr key={row.farmerName} className="bg-gray-50 hover:bg-green-50 transition">
                    <td className="px-4 py-3 rounded-l-2xl font-semibold">{row.farmerName}</td>
                    <td className="px-4 py-3">{row.totalProductsSold}</td>
                    <td className="px-4 py-3 font-bold text-green-700">{formatCurrency(row.totalSale)}</td>
                    <td className="px-4 py-3 rounded-r-2xl">{row.totalOrders}</td>
                  </tr>
                ))
              )}
            </tbody>
          </ReportTable>

          <ReportTable title="Recent Orders">
            <thead>
              <tr className="text-gray-500 text-left text-sm">
                <th className="px-4">Product Name</th>
                <th className="px-4">Customer Name</th>
                <th className="px-4">Farmer Name</th>
                <th className="px-4">Quantity</th>
                <th className="px-4">Total Amount</th>
                <th className="px-4">Order Status</th>
                <th className="px-4">Payment Status</th>
                <th className="px-4">Order Date</th>
                <th className="px-4">Order Time</th>
              </tr>
            </thead>
            <tbody>
              {report.orderRows.length === 0 ? (
                <EmptyRow colSpan={9} text="No orders found." />
              ) : (
                report.orderRows.map((row, index) => (
                  <tr key={`${row.productName}-${index}`} className="bg-gray-50 hover:bg-green-50 transition">
                    <td className="px-4 py-3 rounded-l-2xl font-semibold">{row.productName}</td>
                    <td className="px-4 py-3">{row.customerName}</td>
                    <td className="px-4 py-3">{row.farmerName}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3 font-bold text-green-700">{formatCurrency(row.totalAmount)}</td>
                    <td className="px-4 py-3">{row.orderStatus}</td>
                    <td className="px-4 py-3">{row.paymentStatus}</td>
                    <td className="px-4 py-3">{formatDate(row.orderDate)}</td>
                    <td className="px-4 py-3 rounded-r-2xl">{formatTime(row.orderTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </ReportTable>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ReportTable({ title, children }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-separate border-spacing-y-3">
          {children}
        </table>
      </div>
    </div>
  );
}

function EmptyRow({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="bg-gray-50 text-center text-gray-500 px-4 py-6 rounded-2xl">
        {text}
      </td>
    </tr>
  );
}

export default AdminSalesReportPanel;
