import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import { initSocket } from "../utils/socket";
import { ShoppingCart, Bell, User, Menu, Wheat, Leaf, Apple, Bean, Flower2, ChevronRight, ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";

function Products({ lang, setLang,  cart, addToCart  }) {

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [notifications, setNotifications] = useState([]);
const [showNotifications, setShowNotifications] = useState(false);
const [notificationPage, setNotificationPage] = useState(1);
const unreadCount = notifications.filter(
  n => !n.isRead
).length;
const notificationsPerPage = 5;

const startIndex =
  (notificationPage - 1) * notificationsPerPage;

const visibleNotifications =
  notifications.slice(
    startIndex,
    startIndex + notificationsPerPage
  );
  
  //mark as read
  const handleNotificationClick = async () => {
    const isOpening = !showNotifications;
    setShowNotifications(!showNotifications);

    if (isOpening && unreadCount > 0) {
      try {
        await fetch(
          `http://localhost:3000/api/notifications/read/${user._id}`,
          {
            method: "PUT"
          }
        );

        setNotifications(prev =>
          prev.map(n => 
            !n.isRead ? { ...n, isRead: true } : n
          )
        );
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  };

  const [addedId, setAddedId] = useState(null);
  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;
  useEffect(() => {
  console.log("cart updated:", cart);
}, [cart]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get("category");
  const searchFromURL = queryParams.get("search") || "";
  
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchFromURL);

  const [showCategory, setShowCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
  { en: "Grains", bn: "শস্য", icon: <Wheat size={20} /> },
  { en: "Vegetables", bn: "সবজি", icon: <Leaf size={20} /> },
  { en: "Fruits", bn: "ফল", icon: <Apple size={20} /> },
  { en: "Pulses", bn: "ডাল", icon: <Bean size={20} /> },
  { en: "Oilseed", bn: "তেলশস্য", icon: <Flower2 size={20} /> }
];

   const [district, setDistrict] = useState(() => {
  return localStorage.getItem("district") || "";
});
   const [area, setArea] = useState(() => {
  return localStorage.getItem("area") || "";
});
   
const areaData = {
  Dhaka: ["Uttara", "Mirpur", "Dhanmondi"],
  Gazipur: ["Tongi", "Sreepur", "Kaliakair"],
  Comilla: ["Daudkandi", "Debidwar", "Laksam"],
  Jamalpur: ["Jamalpur Sadar", "Islampur", "Sarishabari"]
};

  useEffect(() => {
    fetch("http://localhost:3000/api/products/approved/all")
      .then(res => res.json())
      .then(data => {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setProducts(shuffled);
      });

    // Initialize socket for real-time product updates
    const socket = initSocket();

    // Listen for product updates
    socket.on("product:added", (newProduct) => {
      if (newProduct.isApproved) {
        setProducts(prev => [newProduct, ...prev]);
      }
    });

    socket.on("product:approved", (approvedProduct) => {
      setProducts(prev => {
        if (!prev.find(p => p._id === approvedProduct._id)) {
          return [approvedProduct, ...prev];
        }
        return prev;
      });
    });

    socket.on("product:deleted", (deletedProduct) => {
      setProducts(prev => prev.filter(p => p._id !== deletedProduct._id));
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

    return () => {
      socket.off("product:added");
      socket.off("product:approved");
      socket.off("product:deleted");
      socket.off("product:updated");
      socket.off("product:quantityChanged");
    };
  }, []);

  const currentLang = lang || "en";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const productMatchesSearch = (product, term) => {
    const nameEn = product.name?.en?.toLowerCase() || "";
    const nameBn = product.name?.bn?.toLowerCase() || "";
    const categoryEn = product.category?.en?.toLowerCase() || "";
    const categoryBn = product.category?.bn?.toLowerCase() || "";

    return (
      !term ||
      nameEn.includes(term) ||
      nameBn.includes(term) ||
      categoryEn.includes(term) ||
      categoryBn.includes(term)
    );
  };
  const filteredProducts = products
    .filter(p =>
      (!selectedCategory || p.category?.en === selectedCategory) &&
      (!categoryFromURL || p.category?.en === categoryFromURL)
    )
    .filter(p => !district || p.district === district)
    .filter(p => !area || p.area === area)
    .filter(p => productMatchesSearch(p, normalizedSearch));

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    const params = new URLSearchParams(location.search);

    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    navigate(`/products?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(location.search);
    params.delete("search");
    setSearchTerm("");
    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  //notifications - Initial fetch
useEffect(() => {

  if (!user) return;

  const fetchNotifications = async () => {

    try {

      const res = await fetch(
        `http://localhost:3000/api/notifications/${user._id}`
      );

      const data = await res.json();

      setNotifications(data);

    } catch (err) {

      console.log(err);

    }

  };

  fetchNotifications();

}, [user]);

// Polling - Refetch notifications when panel is open
useEffect(() => {

  if (!user || !showNotifications) return;

  const fetchNotifications = async () => {

    try {

      const res = await fetch(
        `http://localhost:3000/api/notifications/${user._id}`
      );

      const data = await res.json();

      setNotifications(data);

    } catch (err) {

      console.log(err);

    }

  };

  // Fetch immediately
  fetchNotifications();

  // Then fetch every 2 seconds while panel is open
  const interval = setInterval(fetchNotifications, 2000);

  return () => clearInterval(interval);

}, [user, showNotifications]);
  return (
    <div>
        {/* Navbar 1 */}
         <div className="w-full bg-gradient-to-b from-green-200 to-green-50 shadow-md px-6 py-2 flex items-center justify-around">
     
           {/* LEFT - LOGO */}
           <div className="flex items-center gap-2">
             <img src={logo} alt="logo" className=" h-20 rounded-xl" />
           </div>
     
           {/* CENTER - SEARCH */}
           <div className="w-1/2">
            <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
               placeholder={lang === "en" ? "Search products...." : "পণ্য খুঁজুন...."}
              className="w-full pl-11 pr-24 py-2 border border-green-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-font-semibold"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <X size={17} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-full text-sm font-semibold"
            >
              {lang === "en" ? "Search" : "à¦–à§à¦à¦œà§à¦¨"}
            </button>
            </form>
           </div>
     
           {/* RIGHT - ICONS + LANGUAGE */}
           <div className="flex items-center gap-5">
     
             {/* LANGUAGE SWITCH */}
             <div className="flex gap-2 text-sm font-semibold">
               <button
                 onClick={() => setLang && setLang("en")}
                 className={lang === "en" ? "text-green-700" : "text-gray-600"}
               >
                 EN
               </button>
               |
               <button
                 onClick={() => setLang && setLang("bn")}
                 className={lang === "bn" ? "text-green-700" : "text-gray-600"}
               >
                 বাংলা
               </button>
             </div>
     
            <div 
  className="relative cursor-pointer"
  onClick={() => navigate("/cart")}
>
  <ShoppingCart size={26} className="text-gray-700" />

  <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
    {cartCount}
  </span>
</div>     
{user && (

  <div className="relative">

    {/* BELL ICON */}
    <div
      onClick={handleNotificationClick}
      className="relative cursor-pointer"
    >

      <Bell className="text-gray-700 hover:text-green-700" />

      {unreadCount > 0 && (

        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
          {unreadCount}
        </span>

      )}

    </div>

    {/* PANEL */}
    {showNotifications && (

      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">

        {/* HEADER */}
        <div className="p-4 border-b font-bold text-green-700">
          Notifications
        </div>

        {/* BODY */}
        <div className="max-h-[400px] overflow-y-auto">

          {visibleNotifications.length > 0 ? (

            visibleNotifications.map(notification => (

              <div
                key={notification._id}
                className={`p-4 border-b hover:bg-green-50 transition ${
                  !notification.isRead
                    ? "bg-green-50"
                    : ""
                }`}
              >

                <h3 className="font-semibold text-gray-800">
                  {notification.title}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </p>

              </div>

            ))

          ) : (

            <div className="p-5 text-center text-gray-400">
              No notifications
            </div>

          )}

        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center p-3 border-t">

          <button
            disabled={notificationPage === 1}
            onClick={() =>
              setNotificationPage(prev => prev - 1)
            }
            className="text-sm px-3 py-1 rounded bg-gray-100 disabled:opacity-40"
          >
            Previous
          </button>

          <button
            disabled={
              startIndex + notificationsPerPage >=
              notifications.length
            }
            onClick={() =>
              setNotificationPage(prev => prev + 1)
            }
            className="text-sm px-3 py-1 rounded bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>

        </div>

      </div>

    )}

  </div>

)}     
  <div className="relative">

  {/* PROFILE ICON */}
  <div
    onClick={() => setShowProfileMenu(!showProfileMenu)}
    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
  >
    <User />
  </div>

  {/* DROPDOWN */}
  {showProfileMenu && (
    <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg z-50">

      {/* PROFILE */}
      <div
        onClick={() => navigate("/profile")}
        className="px-4 py-2 hover:bg-green-100 cursor-pointer"
      >
        {currentLang === "en" ? "Profile" : "প্রোফাইল"}
      </div>

      {/* ORDER HISTORY */}
      <div
        onClick={() => navigate("/order-history")}
        className="px-4 py-2 hover:bg-green-100 cursor-pointer"
      >
        Order History
      </div>

      {/* LOGOUT */}
      <div
        onClick={() => {
          localStorage.removeItem("user"); 
          navigate("/login");
        }}
        className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
      >
        {currentLang === "en" ? "Logout" : "লগআউট"}
      </div>

    </div>
  )}

</div>
     
           </div>
     
         </div>

      {/* NAVBAR 2 */}
      <div className="w-full bg-green-50 shadow-sm px-2 sm:px-4 md:px-6 py-2 flex items-center justify-between md:justify-around relative flex-wrap md:flex-nowrap gap-2 md:gap-0">

        {/* LEFT - CATEGORY */}
        <div className="relative">
          <button
            onClick={() => setShowCategory(!showCategory)}
            className="flex items-center gap-2 md:gap-8 font-semibold text-xs md:text-base"
          >
            <Menu size={20} />
            <span className="hidden sm:inline">{lang === "en" ? "Select Categories" : "ক্যাটাগরি নির্বাচন"}</span>
          </button>

          {showCategory && (
  <div className="absolute top-12 left-0 bg-white shadow-xl rounded-xl p-2 md:p-3 w-56 md:w-64 z-50">

    {categories.map((cat) => (
      <div
        key={cat.en}
        onClick={() => {
        setSelectedCategory(cat.en.toLowerCase())
          setShowCategory(false);
        }}
        className="flex items-center justify-between px-2 md:px-3 py-2 md:py-3 rounded-lg cursor-pointer hover:bg-green-100 transition text-sm md:text-base"
      >

        {/* LEFT SIDE */}
        <div className="flex items-center gap-2 md:gap-3 font-medium text-gray-700">
          <span className="text-green-600">{cat.icon}</span>
          <span>{lang === "en" ? cat.en : cat.bn}</span>
        </div>

        {/* RIGHT ARROW */}
        <ChevronRight size={18} className="text-gray-400" />

      </div>
    ))}

  </div>
          )}
</div>

        {/* CENTER */}
        <div className="text-xs md:text-sm text-gray-600 hidden md:block">
          {selectedCategory && (
            <span>
              {lang === "en" ? "Category" : "ক্যাটাগরি"}: {selectedCategory}
            </span>
          )}
        </div>

        {/* RIGHT - LOCATION */}
        <div className="flex gap-1 md:gap-2 text-xs md:text-sm">
{/* DISTRICT */}
<select
  value={district}
  onChange={(e) => {
  const value = e.target.value;
  setDistrict(value);
  setArea("");

  localStorage.setItem("district", value);
  localStorage.setItem("area", "");
}}
  className="border p-1 md:p-2 rounded text-xs md:text-sm"
>
  <option value="">
    {lang === "en" ? "District" : "জেলা"}
  </option>

  {Object.keys(areaData).map((d) => (
    <option key={d} value={d}>
      {d}
    </option>
  ))}
</select>

{/* AREA (dynamic) */}
<select
  value={area}
  onChange={(e) => {
  const value = e.target.value;
  setArea(value);

  localStorage.setItem("area", value);
}}
  disabled={!district}
  className="border p-1 md:p-2 rounded text-xs md:text-sm"
>
  <option value="">
    {lang === "en" ? "Area" : "এলাকা"}
  </option>

  {areaData[district]?.map((a) => (
    <option key={a} value={a}>
      {a}
    </option>
  ))}
</select>

        </div>

      </div>
{/*  ALL products.. */}
      {/* TITLE */}
      <h2 className="text-2xl md:text-3xl text-center font-bold text-green-700 mt-6 md:mt-8 mb-4 md:mb-6">
        {currentLang === "en" ? "All Products" : "সব পণ্য"}
      </h2>

      {/* PRODUCTS */}
      {filteredProducts.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-5 px-3 sm:px-6 md:px-10">

        {filteredProducts.map(p => (

            <div key={p._id} className="bg-white p-2 md:p-4 rounded-xl shadow hover:shadow-xl">

              <Link to={`/product/${p._id}`}>
                <img src={p.image} className="h-20 md:h-32 mx-auto object-contain" />
                <h3 className="mt-2 md:mt-3 font-semibold text-xs md:text-base">
                  {p.name?.[currentLang] || p.name?.en}
                </h3>
              </Link>

              <p className="text-xs md:text-sm text-gray-500">
                {p.category?.[currentLang] || p.category?.en}
              </p>

              {/* Stock Quantity Display */}
              <p className="text-xs md:text-sm font-semibold text-gray-400 mt-1">
                {currentLang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (currentLang === "en" ? "kg" : "কেজি") : (currentLang === "en" ? "units" : "ইউনিট")}
              </p>


              <p className="font-bold text-sm md:text-base text-green-700">
                <span className="bdt-symbol">৳</span>{p.price} {currentLang==="en"?`/ ${p.unit}`:(p.unit==="kg"?"/কেজি":"/ পিস")}
              </p>

             <button
  onClick={() => {
    addToCart(p);
    setAddedId(p._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  disabled={p.quantity === 0}
  className={`mt-2 md:mt-4 w-full font-medium py-1 md:py-2 text-xs md:text-base rounded-full transition 
    ${p.quantity === 0
      ? "bg-gray-400 text-white cursor-not-allowed"
      : addedId === p._id 
      ? "bg-green-500 text-white" 
      : "bg-green-700 text-white hover:bg-green-800"}
  `}
>
  {p.quantity === 0
    ? (lang === "en" ? "Out of Stock" : "স্টক শেষ")
    : addedId === p._id
    ? (lang === "en" ? "Added" : "যোগ হয়েছে")
    : (lang === "en" ? "Add to Cart" : "কার্টে যোগ করুন")}
</button>

          

            </div>

        ))}

      </div>
      ) : (
        <div className="mx-3 sm:mx-6 md:mx-10 bg-white rounded-2xl shadow p-6 md:p-10 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {currentLang === "en" ? "No product found" : "কোনো পণ্য পাওয়া যায়নি"}
          </h3>
          
        </div>
      )}

      {/*  BACK + CART BUTTON */}
      <div className="flex flex-col sm:flex-row justify-center px-3 sm:px-6 md:px-12 mt-8 md:mt-10 gap-3 md:gap-5">

        <Link to="/home" className="w-full sm:w-auto">
          <button className="w-full flex items-center justify-center gap-2 bg-gray-200 px-4 py-2 rounded-full text-black font-semibold text-sm md:text-lg hover:bg-green-700 hover:text-white transition">
            <ArrowLeft size={18} className="md:w-5 md:h-5"/> {currentLang==="en"?"Back":"পেছনে"}
          </button>
        </Link>

        <button onClick={()=>navigate("/cart")} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-200 text-black font-semibold text-sm md:text-lg px-4 py-2 rounded-full hover:bg-green-700 hover:text-white transition">
          {currentLang==="en"?"Cart":"কার্ট"} <ArrowRight size={18} className="md:w-5 md:h-5"/>
        </button>

      </div>

   {/* FOOTER */}
<footer className="bg-gradient-to-t from-green-200 to-green-50 text-black px-3 sm:px-6 py-6 md:py-10 mt-8 md:mt-10">

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">

    {/* LOGO + ABOUT */}
    <div>
      <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">AgroLink</h2>
      <p className="text-xs md:text-md text-gray-500">
        {lang === "en"
          ? "Connecting farmers with customers for fresh and healthy food."
          : "তাজা ও স্বাস্থ্যকর খাবারের জন্য কৃষক ও গ্রাহকদের সংযোগ স্থাপন।"}
      </p>
    </div>

    {/* QUICK LINKS */}
    <div>
      <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-3">
        {lang === "en" ? "Quick Links" : "দ্রুত লিংক"}
      </h3>
      <ul className="space-y-1 md:space-y-2 text-xs md:text-md text-gray-500">
        <li><a href="/" className="hover:text-white">Home</a></li>
        <li><a href="/products" className="hover:text-white">Products</a></li>
        <li><a href="/login" className="hover:text-white">Login</a></li>
      </ul>
    </div>

    {/* CONTACT */}
    <div>
      <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-3">
        {lang === "en" ? "Contact" : "যোগাযোগ"}
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2"> Dhaka, Bangladesh</p>
      <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2"> 01934370313</p>
      <p className="text-xs md:text-sm text-gray-500"> support@agrolink.com</p>
    </div>

    {/* SOCIAL */}
    <div>
      <h3 className="font-semibold text-sm md:text-base mb-2 md:mb-3">
        {lang === "en" ? "Follow Us" : "আমাদের অনুসরণ করুন"}
      </h3>

      <div className="flex gap-3 md:gap-4 text-lg md:text-2xl">

        <a href="https://facebook.com" target="_blank"><FaFacebook /></a>

        <a href="https://instagram.com" target="_blank">
          <FaInstagram />
        </a>

        <a href="https://youtube.com" target="_blank">
          <FaYoutube />
        </a>

      </div>
    </div>

  </div>

  {/* BOTTOM */}
  <div className="border-t border-green-700 mt-6 md:mt-8 pt-3 md:pt-4 text-center text-xs md:text-sm text-gray-700">
    © 2026 AgroLink. {lang === "en" ? "All rights reserved." : "সর্বস্বত্ব সংরক্ষিত।"}
  </div>

</footer>

    </div>
  );
}

export default Products;
