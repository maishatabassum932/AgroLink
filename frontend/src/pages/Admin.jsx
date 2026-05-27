import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initSocket } from "../utils/socket";
import {
  Users,
  Package,
  UserCheck,
  UserX,
  LayoutDashboard,
  LogOut,
  Search,
  Bell,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import AdminSalesReportPanel from "./AdminReportPanel";
function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const searchProduct = "";

const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
  user.email.toLowerCase().includes(searchUser.toLowerCase())
);
const filteredProducts = products.filter(product =>
  product.name?.en
    ?.toLowerCase()
    .includes(searchProduct.toLowerCase())
);
const recentActivities = [

  ...products
    .slice(0, 4)
    .map(product => ({
      text: `${product.name?.en} added by farmer`,
      time: "Recently"
    })),

  ...users
    .filter(user => user.warningCount > 0)
    .slice(0, 3)
    .map(user => ({
      text: `${user.name} received warning`,
      time: "Admin Action"
    }))

];
const deleteUser = async (id) => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this user?"
    );

  if (!confirmDelete) return;

  await fetch(
    `http://localhost:3000/api/users/${id}`,
    {
      method: "DELETE"
    }
  );

  fetchUsers();

};
const deleteProduct = async (id) => {

  const confirmDelete =
    window.confirm(
      "Delete this product permanently?"
    );

  if (!confirmDelete) return;

  await fetch(
    `http://localhost:3000/api/products/delete/${id}`,
    {
      method: "DELETE"
    }
  );

  fetchProducts();

};
const fetchOrders = () => {

  fetch("http://localhost:3000/api/orders")
    .then(res => res.json())
    .then(data => setOrders(data));

};

const pendingProducts =
  products.filter(p => !p.isApproved).length;


const warnedUsers =
  users.filter(u => u.warningCount > 0).length;
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const logout = () => {
  localStorage.removeItem("user");
  navigate("/login");
};

  // FETCH
  const fetchUsers = () => {
    fetch("http://localhost:3000/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  const fetchProducts = () => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchOrders();

    // Initialize socket
    const socket = initSocket();

    // Listen for real-time user updates
    socket.on("user:registered", (newUser) => {
      setUsers(prev => [newUser, ...prev]);
    });

    socket.on("user:verified", (verifiedUser) => {
      setUsers(prev => prev.map(u => u._id === verifiedUser._id ? verifiedUser : u));
    });

    socket.on("user:warned", (updatedUser) => {
      setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    });

    socket.on("user:blocked", (updatedUser) => {
      setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    });

    socket.on("user:unblocked", (updatedUser) => {
      setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    });

    socket.on("user:deleted", ({ userId }) => {
      setUsers(prev => prev.filter(u => u._id !== userId));
    });

    // Listen for real-time product updates
    socket.on("product:added", (newProduct) => {
      setProducts(prev => [newProduct, ...prev]);
    });

    socket.on("product:approved", (approvedProduct) => {
      setProducts(prev => prev.map(p => p._id === approvedProduct._id ? approvedProduct : p));
    });

    socket.on("product:deleted", (deletedProduct) => {
      setProducts(prev => prev.map(p => p._id === deletedProduct._id ? deletedProduct : p));
    });

    socket.on("product:updated", (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    });

    // Listen for quantity changes specifically
    socket.on("product:quantityChanged", (data) => {
      setProducts(prev => prev.map(p => 
        p._id === data.productId 
          ? { ...p, quantity: data.newQuantity, inStock: data.inStock }
          : p
      ));
    });

    // Listen for real-time order updates
    socket.on("order:placed", (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on("order:statusUpdated", (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off("user:registered");
      socket.off("user:verified");
      socket.off("user:warned");
      socket.off("user:blocked");
      socket.off("user:unblocked");
      socket.off("user:deleted");
      socket.off("product:added");
      socket.off("product:approved");
      socket.off("product:deleted");
      socket.off("product:updated");
      socket.off("product:quantityChanged");
      socket.off("order:placed");
      socket.off("order:statusUpdated");
    };
  }, []);

  // STATS
  const totalUsers = users.length;
  const totalProducts = products.length;
  const blockedUsers = users.filter(u => u.isBlocked).length;
  const activeUsers = users.filter(u => !u.isBlocked).length;
  const farmers = users.filter(
  user => user.role === "farmer"
);
const totalFarmers = farmers.length;
const deliveredOrders =
  orders.filter(
    order => order.status === "delivered"
  );

const totalMarketplaceSales =
  deliveredOrders.reduce(
    (sum, order) =>
      sum + (order.finalTotal || 0),
    0
  );

const totalPlatformSale =
  deliveredOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) =>
          itemSum +
          (item.commission || 0),
        0
      ),
    0
  );

const totalFarmerPayout =
  deliveredOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) =>
          itemSum +
          (item.farmerEarning || 0),
        0
      ),
    0
  );

  // USER ACTIONS
  const warnUser = async (id) => {
    await fetch(`http://localhost:3000/api/users/warn/${id}`, { method: "PUT" });
    fetchUsers();
  };

  const blockUser = async (id, days) => {
    await fetch(`http://localhost:3000/api/users/block/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days })
    });
    fetchUsers();
  };

  const unblockUser = async (id) => {
    await fetch(`http://localhost:3000/api/users/unblock/${id}`, { method: "PUT" });
    fetchUsers();
  };

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-gradient-to-b from-green-900 to-green-700 text-white p-4 md:p-5 flex flex-col justify-between md:sticky md:top-0 md:h-screen shadow-2xl">

        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-10">Admin Panel</h2>

          <div className="space-y-3 md:space-y-5">

         <div
    onClick={() => setActiveTab("dashboard")}
    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
      ${
        activeTab === "dashboard"
          ? "bg-green-700 shadow-lg"
          : "hover:bg-green-700"
      }`}
  >
    <LayoutDashboard size={20} className="md:w-6 md:h-6" />
    <span className="font-medium">Dashboard</span>
  </div>

            <div
    onClick={() => setActiveTab("users")}
    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
      ${
        activeTab === "users"
          ? "bg-green-700 shadow-lg"
          : "hover:bg-green-700"
      }`}
  >
    <Users size={20} className="md:w-6 md:h-6" />
    <span className="font-medium">Users</span>
  </div>

            <div
    onClick={() => setActiveTab("products")}
    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200 text-sm md:text-base
      ${
        activeTab === "products"
          ? "bg-green-700 shadow-lg"
          : "hover:bg-green-700"
      }`}
  >
    <Package size={20} className="md:w-6 md:h-6" />
    <span className="font-medium">Products</span>
  </div>

          </div>
        </div>

       <div
  onClick={logout}
  className="flex items-center gap-2 cursor-pointer hover:text-red-300 text-sm md:text-base"
>
  <LogOut size={20} className="md:w-6 md:h-6" /> Logout
</div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-4 md:p-8 space-y-4 md:space-y-5 overflow-auto">

       {/* DASHBOARD */}
{activeTab === "dashboard" && (

  <>

    <h1 className="text-2xl md:text-4xl font-extrabold mb-6 md:mb-10 text-gray-800">
      Dashboard
    </h1>

    {/* STATS */}
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">

      <Card
        title="Total Users"
        value={totalUsers}
        icon={<Users />}
      />

      <Card
        title="Total Products"
        value={totalProducts}
        icon={<Package />}
      />

      <Card
        title="Active Users"
        value={activeUsers}
        icon={<UserCheck />}
      />

      <Card
        title="Blocked Users"
        value={blockedUsers}
        icon={<UserX />}
      />

      <Card
        title="Farmers"
        value={totalFarmers}
        icon={<Users />}
      />

      <Card
        title="Pending Products"
        value={pendingProducts}
        icon={<Package />}
      />

      <Card
        title="Warnings"
        value={warnedUsers}
        icon={<ShieldAlert />}
      />
      <Card
  title="Marketplace Sales"
  value={`৳${totalMarketplaceSales}`}
  icon={<TrendingUp />}
/>

<Card
  title="Platform Sale"
  value={`৳${totalPlatformSale.toFixed(2)}`}
  icon={<TrendingUp />}
/>

<Card
  title="Farmer Payout"
  value={`৳${totalFarmerPayout.toFixed(2)}`}
  icon={<Users />}
/>

    </div>

    <AdminSalesReportPanel users={users} orders={orders} />

    {/* RECENT ACTIVITY */}
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mt-10">

      <div className="flex items-center gap-4 mb-8">

        <div className="bg-green-100 p-4 rounded-2xl">
          <Bell className="text-green-700" />
        </div>

        <div>

          <h2 className="text-3xl font-bold text-gray-800">
            Recent Activity
          </h2>

          <p className="text-gray-400">
            Latest admin and farmer activities
          </p>

        </div>

      </div>

      <div className="space-y-4">

        {recentActivities.map((activity, index) => (

          <div
            key={index}
            className="flex justify-between items-center border border-gray-100 p-5 rounded-2xl hover:bg-green-50 transition"
          >

            <p className="text-gray-700 font-medium">
              {activity.text}
            </p>

            <span className="text-sm text-gray-400">
              {activity.time}
            </span>

          </div>

        ))}

      </div>

    </div>

  </>

)}
        {/* USERS */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
<div className="flex items-center gap-3 mb-5 bg-gray-50 p-3 rounded-2xl border border-gray-200 w-full md:w-96">

  <Search className="text-gray-400" />

  <input
    type="text"
    placeholder="Search users..."
    value={searchUser}
    onChange={(e) =>
      setSearchUser(e.target.value)
    }
    className="bg-transparent outline-none w-full"
  />

</div>
  <h2 className="text-xl font-semibold mb-6 text-gray-700">
    Manage Users
  </h2>

  <div className="overflow-x-auto">
    <table className="w-full border-separate border-spacing-y-3">

      <thead>
        <tr className="text-gray-500 text-left text-sm">
          <th className="px-4">Name</th>
          <th className="px-4">Email</th>
          <th className="px-4">Status</th>
          <th className="px-4">Actions</th>
        </tr>
      </thead>

      <tbody>
        {filteredUsers.map(user => {

          let statusText = "Verified";

let statusStyle =
  "bg-blue-700 text-white";

if (user.isBlocked) {

  statusText = "Blocked";

  statusStyle =
    "bg-red-100 text-red-700";

}

else if (!user.isVerified) {

  statusText = "Pending ";

  statusStyle =
    "bg-blue-100 text-blue-700";

}

else if (user.warningCount > 0) {

  statusText =
    `Warning (${user.warningCount})`;

  statusStyle =
    "bg-blue-100 text-blue-700";

}

          return (
            <tr
              key={user._id}
              className="bg-gray-50 hover:bg-gray-100 transition rounded-xl shadow-sm"
            >
              <td className="px-4 py-3 font-medium text-gray-800">

  <button

    onClick={() =>
      setSelectedUser(user)
    }

    className="hover:text-green-700 hover:underline"

  >
    {user.name}
  </button>

</td>

              <td className="px-4 py-3 text-gray-600">
                {user.email}
              </td>

              <td className="px-4 py-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                  {statusText}
                </span>
              </td>

              <td className="px-4 py-3 flex flex-wrap gap-2">

                {user.role !== "admin" && (
                  <>
                  {!user.isVerified && (

  <button

    onClick={async () => {

      await fetch(
        `http://localhost:3000/api/users/verify/${user._id}`,
        {
          method: "PUT"
        }
      );

      fetchUsers();

      alert(
        "User verified successfully"
      );

    }}

    className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700  px-3 py-1 rounded-lg text-xs font-semibold shadow"

  >
    Verify
  </button>

)}
                    <button
                      onClick={() => warnUser(user._id)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow"
                    >
                      Warn
                    </button>

                    <button
                      onClick={() => blockUser(user._id, 5)}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg text-xs font-semibold"
                    >
                      Block
                    </button>

                    <button
                      onClick={() => unblockUser(user._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                    >
                      Unblock
                    </button>

                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </>
                )}

              </td>
            </tr>
          );
        })}
      </tbody>

    </table>
  </div>

</div>
        )}



      
        {/* PRODUCTS */}
{activeTab === "products" && (
  

  <div className="space-y-8">

    <h1 className="text-3xl font-bold">
      Farmer Products
    </h1>

    {farmers.map(farmer => {

      const farmerProducts = filteredProducts.filter(
        p =>
          String(p.farmerId?._id || p.farmerId)
          === String(farmer._id)
      );

      return (

        <div
          key={farmer._id}
          className="bg-white p-6 rounded-3xl shadow-lg"
        >

          {/* FARMER INFO */}
          <div className="border-b pb-4 mb-6">

            <h2 className="text-2xl font-bold text-green-700">
              {farmer.name}
            </h2>

            <p className="text-gray-600">
              {farmer.email}
            </p>

            <p className="text-gray-500">
              {farmer.district}, {farmer.area}
            </p>

          </div>

          {/* PRODUCTS */}
          {farmerProducts.length === 0 ? (

            <p className="text-gray-400">
              No products added
            </p>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {farmerProducts.map(product => (

                <div
                  key={product._id}
                  className="bg-gray-50 rounded-2xl overflow-hidden shadow hover:shadow-xl transition"
                >

                  <img
                    src={product.image}
                    alt={product.name?.en}
                    className="h-44 w-full object-contain p-3"
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

                    <p className="text-sm mb-3">

                      Status:
<span
  className={`ml-2 font-semibold ${
    product.isApproved
      ? "text-green-600"
      : "text-yellow-500"
  }`}
>
  {product.isApproved ? "Approved" : "Pending"}
</span>

                    </p>

                    <div className="flex gap-3">

  {!product.isApproved ? (

    <button
      onClick={async () => {

        const confirmApprove = window.confirm(
          "Are you sure you want to approve this product?"
        );

        if (!confirmApprove) return;

        await fetch(
          `http://localhost:3000/api/products/approve/${product._id}`,
          {
            method: "PUT"
          }
        );

        fetchProducts();

        alert("Product Approved Successfully");

      }}
      className="bg-gray-200 hover:bg-green-700 hover:text-white px-4 py-2 rounded-xl text-sm"
    >
      Approve
    </button>

  ) : (

    <button
      disabled
      className="bg-green-200 text-green-800 px-4 py-2 rounded-xl text-sm cursor-not-allowed"
    >
      Approved
    </button>

  )}

  <button
    onClick={() => deleteProduct(product._id)}
    className="bg-gray-200 hover:bg-green-600 hover:text-white px-4 py-2 rounded-xl text-sm"
  >
    Delete
  </button>

</div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      );

    })}

  </div>

)}
      {selectedUser && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white w-[650px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative">
      {/* CLOSE */}
      <button

        onClick={() =>
          setSelectedUser(null)
        }

        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"

      >
       x
      </button>

      <h2 className="text-3xl font-bold text-green-700 mb-6">

        User Details

      </h2>

      <div className="grid grid-cols-2 gap-4 text-gray-700">

        <div className="bg-gray-50 p-3 rounded-xl">
  <p className="text-sm text-gray-500">
    Name
  </p>

  <p className="font-semibold">
    {selectedUser.name}
  </p>
</div>

<div className="bg-gray-50 p-3 rounded-xl">
  <p className="text-sm text-gray-500">
    Email
  </p>

  <p className="font-semibold break-all">
    {selectedUser.email}
  </p>
</div>

<div className="bg-gray-50 p-3 rounded-xl">
  <p className="text-sm text-gray-500">
    Phone
  </p>

  <p className="font-semibold">
    {selectedUser.phone}
  </p>
</div>

<div className="bg-gray-50 p-3 rounded-xl">
  <p className="text-sm text-gray-500">
    Role
  </p>

  <p className="font-semibold capitalize">
    {selectedUser.role}
  </p>
</div>

<div className="bg-gray-50 p-3 rounded-xl">
  <p className="text-sm text-gray-500">
    NID Number
  </p>

  <p className="font-semibold">
    {selectedUser.nidNumber}
  </p>
</div>

<div className="bg-gray-50 p-3 rounded-xl">
  <p className="text-sm text-gray-500">
    District
  </p>

  <p className="font-semibold">
    {selectedUser.district}
  </p>
</div>

<div className="bg-gray-50 p-3 rounded-xl col-span-2">
  <p className="text-sm text-gray-500">
    Area
  </p>

  <p className="font-semibold">
    {selectedUser.area}
  </p>
</div>

      </div>

      {/* NID IMAGE */}
      {selectedUser.nidImage && (

        <div className="w-full max-h-[400px] object-contain border rounded-2xl bg-gray-50">

          <p className="font-semibold mb-2">
            NID Document
          </p>

          <img
            src={selectedUser.nidImage}
            alt="NID"
            className="w-full h-64 object-contain border rounded-2xl"
          />

        </div>

      )}

    </div>

  </div>

)}

      </div>
    </div>
  );
}

const Card = ({ title, value, icon }) => (
  <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-3xl shadow-lg hover:-translate-y-2 hover:shadow-2xl transition duration-300 border border-green-100">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h2 className="text-4xl font-extrabold text-green-700 mt-2">{value}</h2>
      </div>
      <div className="bg-green-100 text-green-700 p-4 rounded-2xl shadow-inner">{icon}</div>
    </div>
  </div>
);

export default Admin;
