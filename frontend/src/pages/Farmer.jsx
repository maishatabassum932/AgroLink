import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  ShoppingCart,
  BarChart3,
  User,
  LogOut
} from "lucide-react";
function Farmer() {

  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activities, setActivities] = useState([]);
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
        method: "DELETE"
      }
    );

    const user = JSON.parse(localStorage.getItem("user"));

    const updated = await fetch(
      `http://localhost:3000/api/products/farmer/${user._id}`
    );

    const data = await updated.json();

    setMyProducts(data);

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
  useEffect(() => {

  setActivities([
    {
      text: "Tomato product added",
      time: "Today"
    },
    {
      text: "Customer ordered Potato",
      time: "1 hour ago"
    },
    {
      text: "Admin approved Mango",
      time: "Yesterday"
    }
  ]);

}, []);

const [farmerData, setFarmerData] = useState({
  name: "",
  email: "",
  phone: "",
  password: "",
  district: "",
  area: "",
  nidNumber: ""
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

  const user = JSON.parse(localStorage.getItem("user"));

  let categoryBn = "";

  if (form.category === "vegetables") categoryBn = "সবজি";
  if (form.category === "fruits") categoryBn = "ফল";
  if (form.category === "grains") categoryBn = "শস্য";
  if (form.category === "pulses") categoryBn = "ডাল";
  if (form.category === "oilseed") categoryBn = "তেলশস্য";

  try {

    const res = await fetch("http://localhost:3000/api/products/add", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        name: {
          en: form.nameEn,
          bn: form.nameBn
        },

        category: {
          en: form.category,
          bn: categoryBn
        },

        price: Number(form.price),
        quantity: Number(form.quantity),
        unit: form.unit,

        district: form.district,
        area: form.area,

        image: form.image,
        harvestDate: form.harvestDate,

        farmerId: user._id
      })
    });

    const data = await res.json();

    console.log(data);

    setShowConfirm(false);

alert("Product Added Successfully");
const updated = await fetch(
  `http://localhost:3000/api/products/farmer/${user._id}`
);

const updatedData = await updated.json();

setMyProducts(updatedData);
/* FORM RESET */
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

  const user = JSON.parse(localStorage.getItem("user"));

  setFarmerData({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    password: user.password || "",
    district: user.district || "",
    area: user.area || "",
    nidNumber: user.nidNumber || ""
  });

}, []);
useEffect(() => {

  const fetchMyProducts = async () => {

    const user = JSON.parse(localStorage.getItem("user"));

    try {

      const res = await fetch(
        `http://localhost:3000/api/products/farmer/${user._id}`
      );

      const data = await res.json();

      setMyProducts(data);

    } catch (err) {
      console.log(err);
    }
  };

  fetchMyProducts();

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
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-green-800 text-white p-5 flex flex-col justify-between">

        <div>

          <h2 className="text-2xl font-bold mb-10">
            Farmer Panel
          </h2>

          <div className="space-y-5">

            {/* DASHBOARD */}
            <div
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 cursor-pointer  p-2 rounded-xl transition-all duration-200
                ${activeTab === "dashboard"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <LayoutDashboard size={22} />
              <span className="text-lg">Dashboard</span>
            </div>

            {/* MY PRODUCTS */}
            <div
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
                ${activeTab === "products"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <Package size={22} />
              <span className="text-lg">My Products</span>
            </div>

            {/* ADD PRODUCT */}
            <div
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
                ${activeTab === "add"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <PlusSquare size={22} />
              <span className="text-lg">Add Product</span>
            </div>

            {/* ORDERS */}
            <div
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
                ${activeTab === "orders"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <ShoppingCart size={22} />
              <span className="text-lg">Orders</span>
            </div>

            {/* ANALYTICS */}
            <div
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
                ${activeTab === "analytics"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <BarChart3 size={22} />
              <span className="text-lg">Analytics</span>
            </div>

            {/* PROFILE */}
            <div
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all duration-200
                ${activeTab === "profile"
                  ? "bg-green-700"
                  : "hover:bg-green-700 hover:shadow-md"}
              `}
            >
              <User size={22} />
              <span className="text-lg">Profile</span>
            </div>

          </div>
        </div>

        {/* LOGOUT */}
        <div
          onClick={logout}
          className="flex items-center gap-3 cursor-pointer hover:text-red-300"
        >
          <LogOut size={22} />
          <span className="text-lg">Logout</span>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <h1 className="text-3xl font-bold mb-8">
              Welcome Farmer
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

  <Card
  title="Total Products"
  value={myProducts.length}
  onClick={() => setActiveTab("products")}
/>
<Card
  title="Pending Products"
  value={
    myProducts.filter(
      product => product.isApproved === false
    ).length
  }
/>

  <Card
    title="Orders"
    value="0"
  />

  <Card
    title="Sales"
    value="৳0"
    
  />

</div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white p-6 rounded-2xl shadow-md mt-8">

  <h2 className="text-2xl font-bold mb-5">
    Recent Activity
  </h2>

  <div className="space-y-4">

    {activities.map((activity, index) => (

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

</div>
          </>
        )}

        {/* MY PRODUCTS */}
{activeTab === "products" && (

  <div className=" p-6 ">

    <h2 className="text-2xl font-bold mb-6">
      My Products
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {myProducts.map(product => (

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
              ৳ {product.price} / {product.unit}
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
        name="image"
        value={form.image}
        onChange={handleChange}
        placeholder="Image URL"
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
          <div className="bg-white p-6 rounded-2xl shadow">

            <h2 className="text-2xl font-bold mb-6">
              Orders
            </h2>

            <p className="text-gray-500">
              Customer orders will appear here.
            </p>

          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="bg-white p-6 rounded-2xl shadow">

            <h2 className="text-2xl font-bold mb-6">
              Analytics
            </h2>

            <p className="text-gray-500">
              Charts and growth analytics will appear here.
            </p>

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
      </div>
    </div>
  );
}

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