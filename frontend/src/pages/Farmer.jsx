import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initSocket } from "../utils/socket";
import { LayoutDashboard, Package, PlusSquare, ShoppingCart,  BarChart3, User, LogOut, Wallet, Clock, CheckCircle, TrendingUp,  Award, Truck} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line,  LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import SalesReportPanel from "./SalesReportPanel";
function Farmer() {

  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({
  nameEn: "",
  nameBn: "",

  category: "vegetables",

  price: "",
  quantity: "",
  unit: "kg",

  district: "",
  area: "",

  image: "",
  harvestDate: ""
});
const [showConfirm, setShowConfirm] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);

const [showUpdateModal, setShowUpdateModal] = useState(false);

const [showDeleteModal, setShowDeleteModal] = useState(false);

const visibleProducts = myProducts.filter(product => !product.isDeleted);
const [productFilter, setProductFilter] = useState("all");
const [showAllActivities, setShowAllActivities] = useState(false);
const [showAllOrders, setShowAllOrders] = useState(false);
const displayedProducts = productFilter === "pending"
  ? visibleProducts.filter(product => product.isApproved === false)
  : visibleProducts;
const activeOrders = farmerOrders.filter(
  order => order.status !== "delivered" && order.status !== "cancelled"
);
const getFarmerOrderItems = (order) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (order.items || []).filter(
    item => String(item.farmerId) === String(user?._id)
  );
};

const totalSales = farmerOrders
  .filter(order => order.status === "delivered")
  .reduce((sum, order) => {
    const farmerItems = getFarmerOrderItems(order);
    const farmerSubtotal = farmerItems.reduce(
      (itemSum, item) => itemSum + item.price * item.qty,
      0
    );

    return sum + farmerSubtotal;
  }, 0);

const refreshFarmerOrders = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?._id) return;

  const orderRes = await fetch(
    `http://localhost:3000/api/orders/farmer/${user._id}`
  );

  const orderData = await orderRes.json();
  setFarmerOrders(orderData);
};

const refreshFarmerProducts = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?._id) return;

  const productRes = await fetch(
    `http://localhost:3000/api/products/farmer/${user._id}`
  );

  const products = await productRes.json();
  setMyProducts(products);
};

const refreshAnalytics = async () => {
  await refreshFarmerOrders();
  await refreshFarmerProducts();
};

const updateOrderStatus = async (orderId, status) => {
  await fetch(`http://localhost:3000/api/orders/status/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  await refreshFarmerOrders();
  await refreshAnalytics();
};

const getPaymentText = (method) =>
  method === "cod" ? "Cash on Delivery" : "Paid";

const visibleOrders = showAllOrders
  ? farmerOrders
  : farmerOrders.slice(0, 2);

const [editForm, setEditForm] = useState({
  nameEn: "",
  nameBn: "",
  category: "",
  price: "",
  quantity: "",
  unit: "",
  district: "",
  area: "",
  image: "",
  harvestDate: ""
});

const handleEditClick = (product) => {

  setSelectedProduct(product);

  setEditForm({
    nameEn: product.name?.en || "",
    nameBn: product.name?.bn || "",
    category: product.category?.en || "",
    price: product.price || "",
    quantity: product.quantity || "",
    unit: product.unit || "kg",
    district: product.district || "",
    area: product.area || "",
    image: product.image || "",
    harvestDate: product.harvestDate
      ? product.harvestDate.split("T")[0]
      : ""
  });

  setShowUpdateModal(true);
};

const handleEditChange = (e) => {

  setEditForm({
    ...editForm,
    [e.target.name]: e.target.value
  });

};

const updateProduct = async () => {

  try {

    let categoryBn = "";

    if (editForm.category === "vegetables") categoryBn = "সবজি";
    if (editForm.category === "fruits") categoryBn = "ফল";
    if (editForm.category === "grains") categoryBn = "শস্য";
    if (editForm.category === "pulses") categoryBn = "ডাল";
    if (editForm.category === "oilseed") categoryBn = "তেলশস্য";

    await fetch(
      `http://localhost:3000/api/products/update/${selectedProduct._id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: {
            en: editForm.nameEn,
            bn: editForm.nameBn
          },

          category: {
            en: editForm.category,
            bn: categoryBn
          },

          price: Number(editForm.price),
          quantity: Number(editForm.quantity),
          unit: editForm.unit,

          district: editForm.district,
          area: editForm.area,

          image: editForm.image,
          harvestDate: editForm.harvestDate
        })
      }
    );

    const user = JSON.parse(localStorage.getItem("user"));

    const updated = await fetch(
      `http://localhost:3000/api/products/farmer/${user._id}`
    );

    const data = await updated.json();

    setMyProducts(data);
    refreshAnalytics();

    setShowUpdateModal(false);

    alert("Product Updated Successfully");

  } catch (err) {
    console.log(err);
  }

};
const deleteProduct = async () => {

  try {

    await fetch(
      `http://localhost:3000/api/products/delete/${selectedProduct._id}`,
      {
        method: "PUT"
      }
    );

    const user = JSON.parse(localStorage.getItem("user"));

    const updated = await fetch(
      `http://localhost:3000/api/products/farmer/${user._id}`
    );

    const data = await updated.json();

    setMyProducts(data);
    refreshAnalytics();

    setShowDeleteModal(false);
    setShowUpdateModal(false);

    alert("Product Deleted Successfully");

  } catch (err) {
    console.log(err);
  }

};
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatActivityDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "Recently";

  const getActivityTime = (date) =>
    date ? new Date(date).getTime() : 0;

  const approvedActivities = myProducts
    .filter(product => product.isApproved && !product.isDeleted)
    .map(product => ({
      text: `${product.name?.en} is approved by admin`,
      time: formatActivityDate(product.approvedAt),
      timestamp: getActivityTime(product.approvedAt)
    }));

  const pendingActivities = myProducts
    .filter(product => !product.isApproved && !product.isDeleted)
    .map(product => ({
      text: `${product.name?.en} waiting for approval`,
      time: "Pending",
      timestamp: getActivityTime(product.createdAt)
    }));

  const deletedActivities = myProducts
    .filter(product => product.isDeleted)
    .map(product => ({
      text: `${product.name?.en} is deleted by admin`,
      time: product.deletedAt
        ? formatActivityDate(product.deletedAt)
        : "Recently",
      timestamp: getActivityTime(product.deletedAt || product.updatedAt)
    }));
  const orderActivities = farmerOrders.map(order => ({

  text: `New order received from ${order.address?.name}`,

  time: formatActivityDate(order.createdAt),
  timestamp: getActivityTime(order.createdAt)

}));

  const activities = [
    ...deletedActivities,
    ...approvedActivities,
    ...pendingActivities,
    ...orderActivities
  ].sort((a, b) => b.timestamp - a.timestamp);

  const visibleActivities = showAllActivities
    ? activities
    : activities.slice(0, 5);

  const saleStatuses = [ "delivered"];
  const analyticsOrderRows = farmerOrders.map(order => {
    const items = getFarmerOrderItems(order);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    return {
      ...order,
      items,
      farmerSubtotal: subtotal
    };
  });
  const saleOrders = analyticsOrderRows.filter(order =>
    saleStatuses.includes(order.status)
  );
  const analyticsSummary = {

  totalSale: saleOrders.reduce(
    (sum, order) => sum + order.farmerSubtotal,
    0
  ),

  platformFee: saleOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) =>
          itemSum + (item.commission || 0),
        0
      ),
    0
  ),

  netEarnings: saleOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) =>
          itemSum + (item.farmerEarning || 0),
        0
      ),
    0
  ),

  totalOrders: analyticsOrderRows.length,

  pendingOrders:
    analyticsOrderRows.filter(
      order => order.status === "pending"
    ).length,

  confirmedOrders:
    analyticsOrderRows.filter(
      order => order.status === "confirmed"
    ).length,

  deliveredOrders:
    analyticsOrderRows.filter(
      order => order.status === "delivered"
    ).length,

  cancelledOrders:
    analyticsOrderRows.filter(
      order => order.status === "cancelled"
    ).length,

  approvedProducts:
    visibleProducts.filter(
      product => product.isApproved
    ).length,

  pendingProducts:
    visibleProducts.filter(
      product => !product.isApproved
    ).length

};
  const statusChartData = [
    { name: "Pending", value: analyticsSummary.pendingOrders || 0, color: "#f59e0b" },
    { name: "Confirmed", value: analyticsSummary.confirmedOrders || 0, color: "#2563eb" },
    { name: "Delivered", value: analyticsSummary.deliveredOrders || 0, color: "#16a34a" },
    { name: "Cancelled", value: analyticsSummary.cancelledOrders || 0, color: "#dc2626" }
  ];
  const monthlySaleData = Object.values(

  saleOrders.reduce((months, order) => {

    const month =
      new Date(order.createdAt)
        .toISOString()
        .slice(0, 7);

    if (!months[month]) {

      months[month] = {
        month,
        sale: 0
      };

    }

    // NET EARNINGS
    const netEarning =
      order.items.reduce(
        (sum, item) =>
          sum +
          (item.farmerEarning || 0),
        0
      );

    months[month].sale +=
      netEarning;

    return months;

  }, {})

).sort((a, b) =>
  a.month.localeCompare(b.month)
);
  const recentAnalyticsOrders = analyticsOrderRows.slice(0, 5);
  const bestSellingProduct = Object.values(
    saleOrders.reduce((products, order) => {
      order.items.forEach(item => {
        const productId = String(item.productId?._id || item.productId || item.name);
        if (!products[productId]) {
          const product = visibleProducts.find(
            product => String(product._id) === productId
          );

          products[productId] = {
            name: item.name,
            image: item.productId?.image || product?.image,
            totalSoldQty: 0
          };
        }

        products[productId].totalSoldQty += item.qty;
      });

      return products;
    }, {})
  ).sort((a, b) => b.totalSoldQty - a.totalSoldQty)[0];
  const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString()}`;

const [farmerData, setFarmerData] = useState(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    return {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: user.password || "",
      district: user.district || "",
      area: user.area || "",
      nidNumber: user.nidNumber || ""
    };
  }
  return {
    name: "",
    email: "",
    phone: "",
    password: "",
    district: "",
    area: "",
    nidNumber: ""
  };
});
const handleProfileChange = (e) => {

  setFarmerData({
    ...farmerData,
    [e.target.name]: e.target.value
  });

};


const handleChange = (e) => {

  setForm({
    ...form,
    [e.target.name]: e.target.value
  });

};
const handleAddProduct = async () => {

  const user =
    JSON.parse(localStorage.getItem("user"));

  let categoryBn = "";

  if (form.category === "vegetables")
    categoryBn = "সবজি";

  if (form.category === "fruits")
    categoryBn = "ফল";

  if (form.category === "grains")
    categoryBn = "শস্য";

  if (form.category === "pulses")
    categoryBn = "ডাল";

  if (form.category === "oilseed")
    categoryBn = "তেলশস্য";

  try {

    const formData = new FormData();

    formData.append(
      "name",
      JSON.stringify({
        en: form.nameEn,
        bn: form.nameBn
      })
    );

    formData.append(
      "category",
      JSON.stringify({
        en: form.category,
        bn: categoryBn
      })
    );

    formData.append(
      "price",
      Number(form.price)
    );

    formData.append(
      "quantity",
      Number(form.quantity)
    );

    formData.append(
      "unit",
      form.unit
    );

    formData.append(
      "district",
      form.district
    );

    formData.append(
      "area",
      form.area
    );

    formData.append(
      "image",
      form.image
    );

    formData.append(
      "harvestDate",
      form.harvestDate
    );

    formData.append(
      "farmerId",
      user._id
    );

    const res = await fetch(
      "http://localhost:3000/api/products/add",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    console.log(data);

    setShowConfirm(false);

    alert("Product Added Successfully");

    const updated = await fetch(
      `http://localhost:3000/api/products/farmer/${user._id}`
    );

    const updatedData =
      await updated.json();

    setMyProducts(updatedData);

    refreshAnalytics();

    setForm({
      nameEn: "",
      nameBn: "",
      category: "vegetables",
      price: "",
      quantity: "",
      unit: "kg",
      district: "",
      area: "",
      image: "",
      harvestDate: ""
    });

  } catch (err) {

    console.log(err);

  }

};
useEffect(() => {

  const fetchData = async () => {

    const user =
      JSON.parse(localStorage.getItem("user"));

    try {

      // FETCH PRODUCTS
      const res = await fetch(
        `http://localhost:3000/api/products/farmer/${user._id}`
      );

      const data = await res.json();

      setMyProducts(data);

      // FETCH ORDERS
      const orderRes = await fetch(
        `http://localhost:3000/api/orders/farmer/${user._id}`
      );

      const orderData = await orderRes.json();

      setFarmerOrders(orderData);

    } catch (err) {

      console.log(err);

    }

  };

  fetchData();

  // Initialize socket
  const socket = initSocket();

  // Listen for real-time product updates
  socket.on("product:added", (newProduct) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (newProduct.farmerId === user._id || newProduct.farmerId?._id === user._id) {
      setMyProducts(prev => [newProduct, ...prev]);
    }
  });

  socket.on("product:updated", (updatedProduct) => {
    setMyProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
  });

  // Listen for quantity changes specifically
  socket.on("product:quantityChanged", (data) => {
    setMyProducts(prev => prev.map(p => 
      p._id === data.productId 
        ? { ...p, quantity: data.newQuantity, inStock: data.inStock }
        : p
    ));
  });

  socket.on("product:approved", (approvedProduct) => {
    setMyProducts(prev => prev.map(p => p._id === approvedProduct._id ? approvedProduct : p));
  });

  socket.on("product:deleted", (deletedProduct) => {
    setMyProducts(prev => prev.map(p => p._id === deletedProduct._id ? deletedProduct : p));
  });

  // Listen for real-time order updates
  socket.on("order:statusUpdated", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Refetch farmer orders to get latest status
    if (user?._id) {
      fetch(`http://localhost:3000/api/orders/farmer/${user._id}`)
        .then(res => res.json())
        .then(orders => setFarmerOrders(orders))
        .catch(err => console.log("Error fetching orders:", err));
    }
  });

  socket.on("order:placed", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Refetch farmer orders to ensure we have all updated data
    if (user?._id) {
      fetch(`http://localhost:3000/api/orders/farmer/${user._id}`)
        .then(res => res.json())
        .then(orders => setFarmerOrders(orders))
        .catch(err => console.log("Error fetching orders:", err));
    }
  });

  return () => {
    socket.off("product:added");
    socket.off("product:updated");
    socket.off("product:quantityChanged");
    socket.off("product:approved");
    socket.off("product:deleted");
    socket.off("order:statusUpdated");
    socket.off("order:placed");
  };

}, []);

const updateProfile = async () => {

  const user = JSON.parse(localStorage.getItem("user"));

  try {

    const res = await fetch(
      `http://localhost:3000/api/users/${user._id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(farmerData)
      }
    );

    const data = await res.json();

    localStorage.setItem("user", JSON.stringify(data));

    alert("Profile Updated Successfully");

  } catch (err) {
    console.log(err);
  }

};
  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-green-800 text-white p-4 md:p-5 flex flex-col justify-between md:sticky md:top-0 md:h-screen">

        <div>

          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-10">
            Farmer Panel
          </h2>

          <div className="space-y-3 md:space-y-5">

            {/* DASHBOARD */}
            <div
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
                ${activeTab === "dashboard"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <LayoutDashboard size={20} className="md:w-6 md:h-6" />
              <span>Dashboard</span>
            </div>

            {/* MY PRODUCTS */}
            <div
              onClick={() => {
                setProductFilter("all");
                setActiveTab("products");
              }}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
                ${activeTab === "products"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <Package size={20} className="md:w-6 md:h-6" />
              <span>My Products</span>
            </div>

            {/* ADD PRODUCT */}
            <div
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
                ${activeTab === "add"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <PlusSquare size={20} className="md:w-6 md:h-6" />
              <span>Add Product</span>
            </div>

            {/* ORDERS */}
            <div
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
                ${activeTab === "orders"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <ShoppingCart size={20} className="md:w-6 md:h-6" />
              <span>Orders</span>
            </div>

            {/* ANALYTICS */}
            <div
              onClick={() => {
                setActiveTab("analytics");
                refreshAnalytics();
              }}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
                ${activeTab === "analytics"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <BarChart3 size={20} className="md:w-6 md:h-6" />
              <span>Analytics</span>
            </div>

            {/* PROFILE */}
            <div
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
                ${activeTab === "profile"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <User size={20} className="md:w-6 md:h-6" />
              <span>Profile</span>
            </div>

          </div>
        </div>

        {/* LOGOUT */}
        <div
          onClick={logout}
          className="flex items-center gap-3 cursor-pointer hover:text-red-300 text-sm md:text-base"
        >
          <LogOut size={20} className="md:w-6 md:h-6" />
          <span>Logout</span>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-8">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
              Welcome Farmer
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 ">

  <Card
  title="Total Products"
  value={visibleProducts.length}
  onClick={() => {
    setProductFilter("all");
    setActiveTab("products");
  }}
/>
<Card
  title="Pending Products"
  value={
    visibleProducts.filter(
      product => product.isApproved === false
    ).length
  }
  onClick={() => {
    setProductFilter("pending");
    setActiveTab("products");
  }}
/>

  <Card
    title="Orders"
    value={activeOrders.length}
    onClick={() => setActiveTab("orders")}
  />

  <Card
    title="Sales"
    value={`৳${totalSales}`}
    
  />

</div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white p-6 rounded-2xl shadow-md mt-8">

  <h2 className="text-2xl font-bold mb-5">
    Recent Activity
  </h2>

  <div className="space-y-4">

    {visibleActivities.map((activity, index) => (

      <div
        key={index}
        className="flex justify-between items-center border-b pb-3"
      >

        <p className="text-gray-700">
          {activity.text}
        </p>

        <span className="text-sm text-gray-400">
          {activity.time}
        </span>

      </div>

    ))}

  </div>

  {activities.length > 5 && (
    <button
      onClick={() => setShowAllActivities(prev => !prev)}
      className="mt-5 bg-gray-200 hover:bg-green-700 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold"
    >
      {showAllActivities ? "Show Recent Activity" : "Previous Activity"}
    </button>
  )}

</div>
          </>
        )}

        {/* MY PRODUCTS */}
{activeTab === "products" && (

  <div className=" p-6 ">

    <h2 className="text-2xl font-bold mb-6">
      {productFilter === "pending" ? "Pending Products" : "My Products"}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {displayedProducts.map(product => (

        <div
  key={product._id}
  onClick={() => handleEditClick(product)}
          className="bg-gray-50 rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
        >

          <img
            src={product.image}
            alt={product.name?.en}
            className="h-32 mx-auto object-contain rounded-xl mt-3"
          />

          <div className="p-4">

            <h2 className="text-xl font-bold mb-2">
              {product.name?.en}
            </h2>

            <p className="text-gray-600 mb-1">
              <span className="bdt-symbol">৳</span> {product.price} / {product.unit}
            </p>

            <p className="text-gray-500 text-sm mb-1">
              Quantity: {product.quantity}
            </p>

            <p className="text-gray-500 text-sm">
              {product.district}, {product.area}
            </p>

          </div>

        </div>

      ))}

    </div>

  </div>

)}

        {/* ADD PRODUCT */}
        {activeTab === "add" && (

  <div className="bg-white p-6 rounded-2xl shadow">

    <h2 className="text-2xl font-bold mb-6">
      Add Product
    </h2>

    <div className="grid grid-cols-2 gap-4">

      <input
        name="nameEn"
        value={form.nameEn}
        onChange={handleChange}
        placeholder="Product Name English"
        className="border p-3 rounded-xl"
      />

      <input
        name="nameBn"
        value={form.nameBn}
        onChange={handleChange}
        placeholder="বাংলা নাম"
        className="border p-3 rounded-xl"
      />

      <input
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
        className="border p-3 rounded-xl"
      />

      <input
        name="quantity"
        value={form.quantity}
        onChange={handleChange}
        placeholder="Quantity"
        className="border p-3 rounded-xl"
      />

      <input
        name="district"
        value={form.district}
        onChange={handleChange}
        placeholder="District"
        className="border p-3 rounded-xl"
      />

      <input
        name="area"
        value={form.area}
        onChange={handleChange}
        placeholder="Area"
        className="border p-3 rounded-xl"
      />

      <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setForm({
      ...form,
      image: e.target.files[0]
    })
  }
  className="border p-3 rounded-xl col-span-2"
/>

      <input
        type="date"
        name="harvestDate"
        value={form.harvestDate}
        onChange={handleChange}
        className="border p-3 rounded-xl"
      />

      <select
  name="category"
  value={form.category}
  onChange={handleChange}
  className="border p-3 rounded-xl"
>
        <option value="vegetables">Vegetables</option>
        <option value="fruits">Fruits</option>
        <option value="grains">Grains</option>
        <option value="pulses">Pulses</option>
        <option value="oilseed">Oilseed</option>
      </select>

    </div>

    <button
      onClick={() => setShowConfirm(true)}
      className="mt-6 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl"
    >
      Add Product
    </button>

  </div>
)}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">

            <h2 className="text-2xl font-bold mb-6">
              Orders
            </h2>

            {farmerOrders.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl shadow">
                <p className="text-gray-500">
                  Customer orders will appear here.
                </p>
              </div>
            ) : (
              visibleOrders.map(order => {
                const farmerItems = getFarmerOrderItems(order);
                const farmerSubtotal = farmerItems.reduce(
                  (sum, item) => sum + item.price * item.qty,
                  0
                );

                return (
                  <div
                    key={order._id}
                    className="bg-white p-6 rounded-2xl shadow"
                  >
                    <div className="flex flex-wrap justify-between gap-4 border-b pb-4 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-green-700">
                          Order #{order._id.slice(-10).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <span className={`h-fit px-4 py-2 rounded-full text-sm font-semibold ${
                        order.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-bold mb-3 text-lg">
                          Customer Info
                        </h4>
                        <p>Name: {order.address?.name || order.customerId?.name}</p>
                        <p>Phone: {order.address?.phone || order.customerId?.phone}</p>
                        <p>District: {order.address?.district || order.customerId?.district}</p>
                        <p>Area: {order.address?.area || order.customerId?.area}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-bold mb-3 text-lg">
                          Payment & Total
                        </h4>
                        <p>Payment: {getPaymentText(order.paymentMethod)}</p>
                        <p>Subtotal: {order.totalPrice}</p>
                        <p>Delivery: {order.deliveryCharge}</p>
                        <p className="font-bold">
                          Final Total: {order.finalTotal}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-sm text-gray-500">
                            <th className="px-3">Product</th>
                            <th className="px-3">Qty</th>
                            <th className="px-3">Price</th>
                            <th className="px-3">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {farmerItems.map(item => (
                            <tr
                              key={`${order._id}-${item.productId}`}
                              className="bg-gray-50"
                            >
                              <td className="px-3 py-3 rounded-l-xl font-medium">
                                {item.name}
                              </td>
                              <td className="px-3 py-3">
                                {item.qty}
                              </td>
                              <td className="px-3 py-3">
                              {item.price}
                              </td>
                              <td className="px-3 py-3 rounded-r-xl font-semibold">
                               {item.price * item.qty}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
                      <div className="space-y-2">

  <p className="font-semibold text-lg">

    Farmer Sale:
    <span className="ml-2">
      ৳{farmerSubtotal}
    </span>

  </p>

  {order.status === "delivered" && (

    <>
      <p className="text-red-500 font-medium">

        Platform Fee (5%):
        <span className="ml-2">

          ৳
          {farmerItems
            .reduce(
              (sum, item) =>
                sum + (item.commission || 0),
              0
            )
            .toFixed(2)}

        </span>

      </p>

      <p className="text-green-700 font-bold text-lg">

        Net Earnings:
        <span className="ml-2">

          ৳
          {farmerItems
            .reduce(
              (sum, item) =>
                sum +
                (item.farmerEarning || 0),
              0
            )
            .toFixed(2)}

        </span>

      </p>
    </>

  )}

</div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => updateOrderStatus(order._id, "confirmed")}
                          disabled={order.status !== "pending"}
                          className="bg-gray-200 hover:bg-green-700 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-sm font-semibold"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order._id, "delivered")}
                          disabled={order.status !== "confirmed"}
                          className="bg-gray-200 hover:bg-green-700 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-sm font-semibold"
                        >
                          Delivered
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order._id, "cancelled")}
                          disabled={order.status === "delivered" || order.status === "cancelled"}
                          className="bg-gray-200 hover:bg-red-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-sm font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {farmerOrders.length > 2 && (
              <button
                onClick={() => setShowAllOrders(prev => !prev)}
                className="bg-gray-200 hover:bg-green-700 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold"
              >
                {showAllOrders ? "Show Less" : "See More"}
              </button>
            )}

          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6">

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Farmer Analytics
                </h2>
              </div>

              <button
                onClick={refreshAnalytics}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-green-900/10 transition"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnalyticsCard
                title="Total Sales"
                value={formatCurrency(analyticsSummary.totalSale)}
                icon={<Wallet />}
                color="text-green-700"
              />
              <AnalyticsCard
  title="Platform Fee"
  value={formatCurrency(analyticsSummary.platformFee)}
  icon={<Wallet />}
  color="text-red-600"
/>
<AnalyticsCard
  title="Net Earnings"
  value={formatCurrency(analyticsSummary.netEarnings)}
  icon={<TrendingUp />}
  color="text-green-700"
/>
              <AnalyticsCard
                title="Total Orders"
                value={analyticsSummary.totalOrders || 0}
                icon={<ShoppingCart />}
                color="text-emerald-700"
              />
              <AnalyticsCard
                title="Pending Orders"
                value={analyticsSummary.pendingOrders || 0}
                icon={<Clock />}
                color="text-yellow-600"
              />
              <AnalyticsCard
                title="Delivered Orders"
                value={analyticsSummary.deliveredOrders || 0}
                icon={<Truck />}
                color="text-green-600"
              />
              <AnalyticsCard
                title="Approved Products"
                value={analyticsSummary.approvedProducts || 0}
                icon={<CheckCircle />}
                color="text-blue-600"
              />
              <AnalyticsCard
                title="Pending Products"
                value={analyticsSummary.pendingProducts || 0}
                icon={<Package />}
                color="text-orange-600"
              />
            </div>

            <SalesReportPanel />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">
                    Monthly Sale
                  </h3>
                  <TrendingUp className="text-green-700" />
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySaleData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="sale" fill="#16a34a" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">
                    Order Status
                  </h3>
                  <BarChart3 className="text-green-700" />
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {statusChartData.map(entry => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {statusChartData.map(item => (
                    <div key={item.name} className="flex items-center gap-2 text-sm text-gray-600">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-5">
                  Recent Orders
                </h3>

                <div className="space-y-4">
                  {recentAnalyticsOrders.length === 0 ? (
                    <p className="text-gray-500">
                      No recent orders yet.
                    </p>
                  ) : (
                    recentAnalyticsOrders.map(order => (
                      <div
                        key={order._id}
                        className="p-4 rounded-2xl bg-green-50/60 hover:bg-green-50 transition border border-green-100"
                      >
                        <div className="flex flex-wrap justify-between gap-3 mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {order.address?.name || order.customerId?.name || "Customer"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {order.address?.area}, {order.address?.district}
                            </p>
                          </div>

                          <span className="h-fit px-3 py-1 rounded-full bg-white text-green-700 text-sm font-semibold shadow-sm">
                            {order.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                          <p>
                            Products: {order.items?.map(item => item.name).join(", ")}
                          </p>
                          <p>
                            Quantity: {order.items?.reduce((sum, item) => sum + item.qty, 0)}
                          </p>
                          <p>
                            Payment: {getPaymentText(order.paymentMethod)}
                          </p>
                          <p>
                            Date: {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">
                    Best Selling Product
                  </h3>
                  <Award className="text-green-700" />
                </div>

                {bestSellingProduct ? (
                  <div className="space-y-4">
                    <img
                      src={bestSellingProduct.image}
                      alt={bestSellingProduct.name}
                      className="w-full h-44 object-contain rounded-2xl bg-green-50 p-3"
                    />
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">
                        {bestSellingProduct.name}
                      </h4>
                      <p className="text-green-700 font-semibold mt-1">
                        Total sold: {bestSellingProduct.totalSoldQty} units
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No delivered or confirmed sales yet.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (

  <div className="bg-white p-8 rounded-3xl shadow-lg max-w-5xl">

    <div className="flex flex-col items-center mb-10">

      <div className="w-28 h-28 rounded-full bg-green-200 flex items-center justify-center mb-4">
        <User size={55} className="text-green-800" />
      </div>

      <h1 className="text-4xl font-bold">
        {farmerData.name}
      </h1>

      <p className="text-gray-500 mt-2">
        Manage your farmer account information
      </p>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>
        <label className="block mb-2 text-gray-600">
          Name
        </label>

        <input
          type="text"
          name="name"
          value={farmerData.name}
          onChange={handleProfileChange}
          className="w-full border p-3 rounded-xl"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-600">
          Email
        </label>

        <input
          type="email"
          name="email"
          value={farmerData.email}
          onChange={handleProfileChange}
          className="w-full border p-3 rounded-xl"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-600">
          Phone
        </label>

        <input
          type="text"
          name="phone"
          value={farmerData.phone}
          onChange={handleProfileChange}
          className="w-full border p-3 rounded-xl"
        />
      </div>
      <div>
  <label className="block mb-2 text-gray-600">
    Password
  </label>

  <input
    type="text"
    name="password"
    value={farmerData.password}
    onChange={handleProfileChange}
    className="w-full border p-3 rounded-xl"
  />
</div>

      <div>
        <label className="block mb-2 text-gray-600">
          NID Number
        </label>

        <input
          type="text"
          name="nidNumber"
          value={farmerData.nidNumber}
          onChange={handleProfileChange}
          className="w-full border p-3 rounded-xl"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-600">
          District
        </label>

        <input
          type="text"
          name="district"
          value={farmerData.district}
          onChange={handleProfileChange}
          className="w-full border p-3 rounded-xl"
        />
      </div>

      <div>
        <label className="block mb-2 text-gray-600">
          Area
        </label>

        <input
          type="text"
          name="area"
          value={farmerData.area}
          onChange={handleProfileChange}
          className="w-full border p-3 rounded-xl"
        />
      </div>

    </div>

    <div className="flex justify-end mt-8">

      <button
        onClick={updateProfile}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
      >
        Update Profile
      </button>

    </div>

  </div>

)}
        {/* CONFIRM MODAL */}
{showConfirm && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white px-2 py-6 rounded-2xl shadow-2xl w-[400px] text-center">

      <h2 className="text-2xl font-bold mb-4">
        Confirm Product
      </h2>

      <p className="text-gray-600 mb-6">
        Are you sure you want to add this product?
      </p>

      <div className="flex justify-center gap-10">

        {/* CANCEL */}
        <button
          onClick={() => setShowConfirm(false)}
          className="px-5 text-md py-2 rounded-xl bg-gray-200 hover:bg-green-700 hover:text-white"
        >
          Cancel
        </button>

        {/* YES */}
        <button
          onClick={handleAddProduct}
          className="px-5 py-2 text-md rounded-xl bg-gray-200  hover:bg-green-700 hover:text-white"
        >
          Confirm  
        </button>

      </div>

    </div>

  </div>

)}
{/* UPDATE PRODUCT MODAL */}
{showUpdateModal && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white w-[700px] p-8 rounded-3xl shadow-2xl">

      <h2 className="text-2xl font-bold mb-8 text-center">
        Update Your Product
      </h2>

      <div className="grid grid-cols-2 gap-5">

        <input
          type="text"
          name="nameEn"
          value={editForm.nameEn}
          onChange={handleEditChange}
          placeholder="Product Name English"
          className="border p-2 rounded-xl"
        />

        <input
          type="text"
          name="nameBn"
          value={editForm.nameBn}
          onChange={handleEditChange}
          placeholder="বাংলা নাম"
          className="border p-2 rounded-xl"
        />

        <input
          type="number"
          name="price"
          value={editForm.price}
          onChange={handleEditChange}
          placeholder="Price"
          className="border p-2 rounded-xl"
        />

        <input
          type="number"
          name="quantity"
          value={editForm.quantity}
          onChange={handleEditChange}
          placeholder="Quantity"
          className="border p-2 rounded-xl"
        />

        <input
          type="text"
          name="district"
          value={editForm.district}
          onChange={handleEditChange}
          placeholder="District"
          className="border p-2 rounded-xl"
        />

        <input
          type="text"
          name="area"
          value={editForm.area}
          onChange={handleEditChange}
          placeholder="Area"
          className="border p-2 rounded-xl"
        />

        <input
          type="text"
          name="image"
          value={editForm.image}
          onChange={handleEditChange}
          placeholder="Image URL"
          className="border p-2 rounded-xl col-span-2"
        />

        <input
          type="date"
          name="harvestDate"
          value={editForm.harvestDate}
          onChange={handleEditChange}
          className="border p-2 rounded-xl"
        />

        <select
          name="category"
          value={editForm.category}
          onChange={handleEditChange}
          className="border p-2 rounded-xl"
        >
          <option value="vegetables">Vegetables</option>
          <option value="fruits">Fruits</option>
          <option value="grains">Grains</option>
          <option value="pulses">Pulses</option>
          <option value="oilseed">Oilseed</option>
        </select>

      </div>

      <div className="flex justify-between mt-8">

        {/* DELETE BUTTON */}
        <button
          onClick={() => {
            setShowUpdateModal(false);
            setShowDeleteModal(true);
          }}
          className="bg-red-600 hover:bg-red-700 hover:font-semibold text-white px-6 py-3 rounded-xl"
        >
          Delete 
        </button>

        <div className="flex gap-4">

          <button
            onClick={() => setShowUpdateModal(false)}
            className="bg-gray-200 hover:bg-green-700 hover:text-white px-6 py-3 font-semibold rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={updateProduct}
            className="bg-gray-200 hover:bg-green-700 hover:text-white px-6 py-3 font-semibold rounded-xl"
          >
            Update 
          </button>

        </div>

      </div>

    </div>

  </div>

)}
{/* DELETE MODAL */}
{showDeleteModal && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white w-[400px] p-8 rounded-3xl text-center shadow-2xl">

      <h2 className="text-3xl font-semibold mb-4">
        Delete Product
      </h2>

      <p className="text-gray-600 mb-8">
        Are you sure you want to delete this product?
      </p>

      <div className="flex justify-center gap-5">

        <button
          onClick={() => setShowDeleteModal(false)}
          className="bg-gray-200 hover:bg-green-700 hover:text-white px-6 py-3 font-semibold rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={deleteProduct}
          className="bg-gray-200 hover:bg-green-700 hover:text-white px-6 py-3 font-semibold rounded-xl"
        >
           Delete
        </button>

      </div>

    </div>

  </div>

)}
<FarmerFooter />
      </div>
    </div>
  );
}

const FarmerFooter = () => (
  <footer className="bg-gradient-to-t from-green-200 to-green-50 text-black px-6 py-10 mt-10 rounded-t-3xl">
    <div className="grid md:grid-cols-4 gap-8">
      <div>
        <h2 className="text-2xl font-bold mb-3">
          AgroLink
        </h2>
        <p className="text-md text-gray-500">
          Connecting farmers with customers for fresh and healthy food.
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-3">
          Quick Links
        </h3>
        <ul className="space-y-2 text-md text-gray-500">
          <li><a href="/" className="hover:text-white">Home</a></li>
          <li><a href="/products" className="hover:text-white">Products</a></li>
          <li><a href="/login" className="hover:text-white">Login</a></li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-3">
          Contact
        </h3>
        <p className="text-sm text-gray-500 mb-2">Dhaka, Bangladesh</p>
        <p className="text-sm text-gray-500 mb-2">017XXXXXXXX</p>
        <p className="text-sm text-gray-500">support@agrolink.com</p>
      </div>

      <div>
        <h3 className="font-semibold mb-3">
          Follow Us
        </h3>
        <div className="flex gap-4 text-2xl">
          <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook /></a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer"><FaInstagram /></a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer"><FaYoutube /></a>
        </div>
      </div>
    </div>

    <div className="border-t border-green-700 mt-8 pt-4 text-center text-sm text-gray-700">
      © 2026 AgroLink. All rights reserved.
    </div>
  </footer>
);

const AnalyticsCard = ({ title, value, icon, color }) => (
  <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 hover:-translate-y-1 hover:shadow-2xl transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">
          {title}
        </p>
        <h3 className={`text-3xl font-bold mt-2 ${color}`}>
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-2xl bg-green-50 ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

/* CARD */
const Card = ({ title, value, color, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition cursor-pointer"
  >

    <p className="text-gray-500 mb-2">
      {title}
    </p>

    <h2 className={`text-3xl font-bold ${color}`}>
      {value}
    </h2>

  </div>
);

export default Farmer;
