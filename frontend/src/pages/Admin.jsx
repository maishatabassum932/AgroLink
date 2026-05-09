import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  UserCheck,
  UserX,
  LayoutDashboard,
  LogOut
} from "lucide-react";

function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
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
  }, []);
  useEffect(() => {

  const latestUsers = users.slice(-3).map(user => ({
    text: `${user.name} joined as ${user.role}`,
    time: new Date(user.createdAt).toLocaleDateString()
  }));

  const latestProducts = products.slice(-3).map(product => ({
    text: `${product.name?.en} added`,
    time: new Date(product.createdAt).toLocaleDateString()
  }));

  setActivities([
    ...latestUsers,
    ...latestProducts
  ]);

}, [users, products]);

  // STATS
  const totalUsers = users.length;
  const totalProducts = products.length;
  const blockedUsers = users.filter(u => u.isBlocked).length;
  const activeUsers = users.filter(u => !u.isBlocked).length;

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

  const deleteUser = async (id) => {
    await fetch(`http://localhost:3000/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const deleteProduct = async (id) => {
    await fetch(`http://localhost:3000/api/products/${id}`, {
      method: "DELETE"
    });
    fetchProducts();
  };

  const getFarmerName = (farmerId) => {
    const farmer = users.find(u => String(u._id) === String(farmerId));
    return farmer ? farmer.name : "Unknown";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-green-800 text-white p-5 flex flex-col justify-between">

        <div>
          <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

          <div className="space-y-5">

         <div
    onClick={() => setActiveTab("dashboard")}
    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
      ${
        activeTab === "dashboard"
          ? "bg-green-700 shadow-lg"
          : "hover:bg-green-700"
      }`}
  >
    <LayoutDashboard size={22} />
    <span className="text-lg font-medium">Dashboard</span>
  </div>

            <div
    onClick={() => setActiveTab("users")}
    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
      ${
        activeTab === "users"
          ? "bg-green-700 shadow-lg"
          : "hover:bg-green-700"
      }`}
  >
    <Users size={22} />
    <span className="text-lg font-medium">Users</span>
  </div>

            <div
    onClick={() => setActiveTab("products")}
    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
      ${
        activeTab === "products"
          ? "bg-green-700 shadow-lg"
          : "hover:bg-green-700"
      }`}
  >
    <Package size={22} />
    <span className="text-lg font-medium">Products</span>
  </div>

          </div>
        </div>

       <div
  onClick={logout}
  className="flex items-center gap-2 cursor-pointer hover:text-red-300"
>
  <LogOut /> Logout
</div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 space-y-5">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

              <Card title="Total Users" value={totalUsers} icon={<Users />} />
              <Card title="Total Products" value={totalProducts} icon={<Package />} />
              <Card title="Active Users" value={activeUsers} icon={<UserCheck />} />
              <Card title="Blocked Users" value={blockedUsers} icon={<UserX />} />

            </div>
          </>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">

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
        {users.map(user => {

          let statusText = "Active";
          let statusStyle = "bg-green-100 text-green-700";

          if (user.isBlocked) {
            statusText = "Blocked";
            statusStyle = "bg-red-100 text-red-700";
          } else if (user.warningCount > 0) {
            statusText = `Warning (${user.warningCount})`;
            statusStyle = "bg-yellow-100 text-yellow-700";
          }

          return (
            <tr
              key={user._id}
              className="bg-gray-50 hover:bg-gray-100 transition rounded-xl shadow-sm"
            >
              <td className="px-4 py-3 font-medium text-gray-800">
                {user.name}
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
          <div className="bg-white p-6 rounded-xl shadow mt-6">

            <h2 className="text-xl font-semibold mb-4">Manage Products</h2>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th>Name</th>
                  <th>Price</th>
                  <th>Farmer</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name?.en}</td>
                    <td>৳{p.price}</td>
                    <td>{getFarmerName(p.farmerId)}</td>
                    <td>{p.district}</td>

                    <td>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

      </div>
    </div>
  );
}

// SMALL CARD COMPONENT
const Card = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow hover:scale-105 transition">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
      {icon}
    </div>
  </div>
);

export default Admin;