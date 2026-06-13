import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { initSocket } from "../utils/socket";
import { Menu, ShoppingCart, Bell, User, Wheat, Leaf, Apple, Bean, Flower2, ChevronRight, Truck, ShieldCheck, Headphones, CreditCard, Search, X} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";

function Home({ lang, setLang, cart, addToCart }) {

    //Navbar 1 states
      const navigate = useNavigate();
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

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
const categoryFromURL = queryParams.get("category");




// Hero section states

const [currentSlide, setCurrentSlide] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  }, 3000);

  return () => clearInterval(interval);
}, []);

//recommended product section
const [products, setProducts] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [submittedSearch, setSubmittedSearch] = useState("");
const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;
useEffect(() => {
  console.log("cart updated:", cart);
}, [cart]);

useEffect(() => {
  fetch("http://localhost:3000/api/products/approved/all")
    .then(res => res.json())
   .then(data => {
  if (!Array.isArray(data)) return;
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  setProducts(shuffled);
})
.catch(err => console.error(err));

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

const [addedId, setAddedId] = useState(null);

 const currentLang = lang || "en";
 const normalizedSearch = searchTerm.trim().toLowerCase();
 const submittedSearchText = submittedSearch.trim().toLowerCase();
 const productMatchesSearch = (product, term) => {
  const nameEn = product.name?.en?.toLowerCase() || "";
  const nameBn = product.name?.bn?.toLowerCase() || "";
  const categoryEn = product.category?.en?.toLowerCase() || "";
  const categoryBn = product.category?.bn?.toLowerCase() || "";

  return (
    nameEn.includes(term) ||
    nameBn.includes(term) ||
    categoryEn.includes(term) ||
    categoryBn.includes(term)
  );
 };
 const searchSuggestions = normalizedSearch
  ? products
      .filter(product => productMatchesSearch(product, normalizedSearch))
      .slice(0, 6)
  : [];
 const searchResults = submittedSearchText
  ? products.filter(product => productMatchesSearch(product, submittedSearchText))
  : [];
 const handleSearchSubmit = (event) => {
  event.preventDefault();
  const term = searchTerm.trim();
  if (!term) return;
  navigate(`/products?search=${encodeURIComponent(term)}`);
  setSubmittedSearch(term);
  setShowSearchSuggestions(false);
 };
 const handleSuggestionSelect = (product) => {
  const productName = product.name?.[currentLang] || product.name?.en || "";
  setSearchTerm(productName);
  setSubmittedSearch(productName);
  setShowSearchSuggestions(false);
  navigate(`/products?search=${encodeURIComponent(productName)}`);
 };
 const clearSearch = () => {
  setSearchTerm("");
  setSubmittedSearch("");
  setShowSearchSuggestions(false);
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

  // fetch every 2 seconds while panel is open
  const interval = setInterval(fetchNotifications, 2000);

  return () => clearInterval(interval);

}, [user, showNotifications]);

  return (
    <div>
      {/* Navbar 1 */}
    <div className="w-full bg-gradient-to-b from-green-200 to-green-50 shadow-sm px-2 sm:px-4 md:px-6 py-2 flex items-center justify-between md:justify-around gap-2 md:gap-4 flex-wrap md:flex-nowrap">

      {/* LEFT - LOGO */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="logo" className="h-12 sm:h-16 md:h-20 rounded-xl" />
      </div>

      {/* CENTER - SEARCH */}
      <div className="w-full md:w-1/2 relative order-3 md:order-2 md:mt-0 mt-2">
        <form onSubmit={handleSearchSubmit} className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSearchSuggestions(true);
          }}
          onFocus={() => setShowSearchSuggestions(true)}
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
          {lang === "en" ? "Search" : "অনুসন্ধান"}
        </button>
        </form>

        {showSearchSuggestions && normalizedSearch && (
          <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden z-50">
            {searchSuggestions.length > 0 ? (
              searchSuggestions.map(product => (
                <button
                  key={product._id}
                  type="button"
                  onMouseDown={() => handleSuggestionSelect(product)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-left transition"
                >
                  <img
                    src={product.image}
                    alt={product.name?.en}
                    className="w-12 h-12 object-contain rounded-lg bg-green-50"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {product.name?.[currentLang] || product.name?.en}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.category?.[currentLang] || product.category?.en}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="px-4 py-4 text-sm text-gray-500">
                {lang === "en" ? "No suggestions found" : "কোনো প্রস্তাবনা পাওয়া যায়নি"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* RIGHT - ICONS + LANGUAGE */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5 order-2 md:order-3">

        {/* LANGUAGE SWITCH */}
        <div className="flex gap-1 sm:gap-2 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setLang("en")}
            className={lang === "en" ? "text-green-700" : "text-gray-600"}
          >
            EN
          </button>
          |
          <button
            onClick={() => setLang("bn")}
            className={lang === "bn" ? "text-green-700" : "text-gray-600"}
          >
            বাংলা
          </button>
        </div>

      <div 
  className="relative cursor-pointer"
  onClick={() => navigate("/cart")}
>
  <ShoppingCart size={20} className="sm:w-6 md:w-6 text-gray-700" />

  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
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
         {/* USER SECTION */}
{user ? (

  // IF LOGGED IN
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
            window.location.reload();
          }}
          className="px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
        >
          {currentLang === "en" ? "Logout" : "লগআউট"}
        </div>

      </div>
    )}

  </div>

) : (

  // IF NOT LOGGED IN
  <div className="flex ">

    <button
      onClick={() => navigate("/login")}
      className="font-semibold hover:bg-green-700 hover:text-white px-3 py-1 rounded-xl"
    >
      {lang === "en" ? "Login" : "লগইন"}
    </button>

    <button
      onClick={() => navigate("/register")}
      className="font-semibold hover:bg-green-700 hover:text-white px-3 py-1 rounded-xl"
    >
      {lang === "en" ? "Register" : "রেজিস্টার"}
    </button>

  </div>

)}
      </div>

    </div>

   
    
      {/* Hero section*/}
    <div className="flex flex-col md:flex-row w-full h-auto md:h-[400px] mt-8 gap-3 md:gap-5 mx-auto px-3 sm:px-6 md:px-20 ">

      {/* LEFT SIDEBAR (1/4) */}
      <div className="w-full md:w-1/4 bg-green-50 shadow-md rounded-lg p-3 md:p-5 flex flex-row md:flex-col gap-2 md:gap-6 overflow-x-auto md:overflow-x-visible">

        <Link to="/" className="flex-1 md:flex-auto hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white text-xs md:text-base whitespace-nowrap md:whitespace-normal">
          {lang === "en" ? "Home" : "হোম"}
        </Link>

        <Link to="/products" className="flex-1 md:flex-auto hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white text-xs md:text-base whitespace-nowrap md:whitespace-normal">
          {lang === "en" ? "All Products" : "সব পণ্য"}
        </Link>

        <a
  href="#offers"
  className="flex-1 md:flex-auto hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white text-xs md:text-base whitespace-nowrap md:whitespace-normal"
>
  Offers
</a>

        <Link
  to="/about"
  className="flex-1 md:flex-auto hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white text-xs md:text-base whitespace-nowrap md:whitespace-normal"
>
  {lang === "en"
    ? "About Us"
    : "আমাদের সম্পর্কে"}
</Link>

        <a
  href="#contact"
  className="flex-1 md:flex-auto hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white text-xs md:text-base whitespace-nowrap md:whitespace-normal"
>
  {lang === "en"
    ? "Contact Us"
    : "যোগাযোগ"}
</a>
      </div>
      {/* right SIDEBAR (3/4) */}
      <div className="w-full md:w-3/4 bg-green-50 rounded-lg pb-5 shadow-md">
        <div className="w-full h-64 sm:h-80 md:h-[400px] relative overflow-hidden">

  {/* Slides */}
  <div className="absolute inset-0 flex transition-all duration-1000"
    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
  >

    {/* Slide 1 */}
    <div className="w-full flex-shrink-0 bg-[url('/hero1.jpg')] bg-contain bg-no-repeat bg-center flex items-center justify-center">
      <div className="bg-black/30 p-6 rounded text-center text-white">
        <h1 className="text-3xl font-bold mb-2">
          {lang === "en" ? "Fresh Products from Farmers" : "কৃষকদের থেকে তাজা পণ্য"}
        </h1>
        <p>
          {lang === "en" ? "Buy directly from local farms" : "স্থানীয় খামার থেকে সরাসরি কিনুন"}
        </p>
      </div>
    </div>

    {/* Slide 2 */}
    <div className="w-full flex-shrink-0 bg-[url('/hero2.webp')] bg-contain bg-no-repeat bg-center flex items-center justify-center">
      <div className="bg-black/30 p-6 rounded text-center text-white">
        <h1 className="text-3xl font-bold mb-2">
          {lang === "en" ? "Healthy & Organic" : "স্বাস্থ্যকর ও অর্গানিক"}
        </h1>
        <p>
          {lang === "en" ? "No middleman, better price" : "মধ্যস্বত্বভোগী নেই, ভালো দাম"}
        </p>
      </div>
    </div>

    {/* Slide 3 */}
    <div className="w-full flex-shrink-0 bg-[url('/hero3.avif')]  bg-contain bg-no-repeat bg-center flex items-center justify-center">
      <div className="bg-black/30 p-6 rounded text-center text-white">
        <h1 className="text-3xl font-bold mb-2">
          {lang === "en" ? "Support Local Farmers" : "স্থানীয় কৃষকদের সমর্থন করুন"}
        </h1>
        <p>
          {lang === "en" ? "Empowering agriculture" : "কৃষিকে শক্তিশালী করা"}
        </p>
      </div>
    </div>

  </div>
</div>
      </div>      
    </div>

      {/* Services section */}
<div className="w-full px-10 py-6 bg-white mt-10">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

    {/* CARD 1 */}
    <div className=" flex lg:flex-col md:flex-col items-center gap-2  bg-green-50 p-4 rounded-xl shadow hover:shadow-lg transition">
      <div className="text-green-600">
        <Truck size={40} />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">
          {lang === "en" ? "Quick Delivery" : "দ্রুত ডেলিভারি"}
        </h3>
        <p className="text-sm text-gray-500">
          {lang === "en" ? "Fast & reliable service" : "দ্রুত ও নির্ভরযোগ্য সেবা"}
        </p>
      </div>
    </div>

    {/* CARD 2 */}
    <div className="flex lg:flex-col md:flex-col items-center gap-2 bg-green-50 p-4 rounded-xl shadow hover:shadow-lg transition">
      <div className="text-green-600">
        <ShieldCheck size={40} />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">
          {lang === "en" ? "Authorized Products" : "নির্ভরযোগ্য পণ্য"}
        </h3>
        <p className="text-sm text-gray-500">
          {lang === "en" ? "100% fresh guarantee" : "১০০% তাজা পণ্যের নিশ্চয়তা"}
        </p>
      </div>
    </div>

    {/* CARD 3 */}
    <div className="flex lg:flex-col md:flex-col items-center gap-2 bg-green-50 p-4 rounded-xl shadow hover:shadow-lg transition">
      <div className="text-green-600">
        <Headphones size={40} />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">
          {lang === "en" ? "Customer Support" : "গ্রাহক সহায়তা"}
        </h3>
        <p className="text-sm text-gray-500">
          {lang === "en" ? "Available anytime" : "যেকোনো সময় সহায়তা"}
        </p>
      </div>
    </div>

    {/* CARD 4 */}
    <div className="flex lg:flex-col md:flex-col items-center gap-2 bg-green-50 p-4 rounded-xl shadow hover:shadow-lg transition">
      <div className="text-green-600">
        <CreditCard size={40} />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">
          {lang === "en" ? "Flexible Payments" : "সহজ পেমেন্ট"}
        </h3>
        <p className="text-sm text-gray-500">
          {lang === "en" ? "Multiple payment methods" : "বিভিন্ন পেমেন্ট পদ্ধতি"}
        </p>
      </div>
    </div>

  </div>
</div>

{submittedSearch && (
<div className="px-6 py-8 bg-green-50/60">

  <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
    <div>
      <h2 className="text-2xl font-bold text-green-700">
        {lang === "en" ? "Search Results" : "সার্চ ফলাফল"}
      </h2>
      <p className="text-gray-500">
        {searchResults.length} {lang === "en" ? `products found for "${submittedSearch}"` : `পণ্য পাওয়া গেছে "${submittedSearch}"`}
      </p>
    </div>

    <button
      onClick={clearSearch}
      className="px-5 py-2 rounded-full bg-white border border-green-200 text-green-700 hover:bg-green-700 hover:text-white transition font-semibold"
    >
      {lang === "en" ? "Clear Search" : "সার্চ মুছে ফেলুন"}
    </button>
  </div>

  {searchResults.length > 0 ? (
    <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-1 gap-5">
      {searchResults.map(p => (
        <div key={p._id} className="bg-white p-4 rounded-xl shadow-md border border-transparent transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-green-700">
          <Link to={`/product/${p._id}`}>
            <img src={p.image} alt={p.name?.en} className="h-32 mx-auto object-contain rounded-lg" />
            <h3 className="mt-5 px-3 font-semibold text-lg">
              {p.name?.[lang] || p.name?.en}
            </h3>
          </Link>
          <span className="text-gray-500 mt-3 px-3">
            {p.category?.[lang] || p.category?.en}
          </span>
          <br />
          
          {/* Stock Quantity Display */}
          <span className="text-sm font-semibold text-gray-400 mt-2 px-3 block">
            {lang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (lang === "en" ? "kg" : "কেজি") : (lang === "en" ? "units" : "ইউনিট")}
          </span>

          
          <span className="text-md font-semibold mt-3 px-3">
            <span className="bdt-symbol">{"৳"}</span>{p.price} {lang === "en" ? `/ ${p.unit}` : (p.unit === "kg" ? "/ কেজি" : "/ পিস")}
          </span>

          <button
            onClick={() => {
              addToCart(p);
              setAddedId(p._id);

              setTimeout(() => {
                setAddedId(null);
              }, 2000);
            }}
            disabled={p.quantity === 0}
            className={`mt-4 w-full font-medium py-2 rounded-full transition 
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
    <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
      {lang === "en" ? "No products matched your search." : "আপনার অনুসন্ধানের সাথে মেলানো কোনো পণ্য পাওয়া যায়নি।"}
    </div>
  )}

</div>
)}

{/* Recommended product section */}
<div className="px-6 py-8">

  <h2 className="text-2xl font-bold mb-10 text-center text-green-700">
    {lang === "en" ? "Recommended for You" : "আপনার জন্য প্রস্তাবিত"}
  </h2>

  <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-1 gap-5">

    {products.slice(0, 5).map(p => (
  <div key={p._id} className="bg-white p-4 rounded-xl shadow-md border border-transparent 
               transition-all duration-300 ease-in-out 
               hover:shadow-xl hover:-translate-y-1 hover:border-green-700">

    {/* CLICK → DETAILS */}
    <Link to={`/product/${p._id}`}>
      <img src={p.image} className="h-32 mx-auto object-contain rounded-lg" />
      <h3 className="mt-5 px-3 font-semibold text-lg">{p.name?.[lang] || p.name?.en}</h3> 
    </Link>
      <span className="text-gray-500 mt-3 px-3">{p.category?.[lang] || p.category?.en}</span>
      <br></br>
      
      {/* Stock Quantity Display */}
      <span className="text-sm font-semibold text-gray-400 mt-2 px-3 block">
        {lang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (lang === "en" ? "kg" : "কেজি") : (lang === "en" ? "units" : "ইউনিট")}
      </span>
      
    {/* PRICE + UNIT */}
    <span className="text-md font-semibold mt-3 px-3">
    <span className="bdt-symbol">{"৳"}</span>{p.price} {lang === "en" ? `/ ${p.unit}` : (p.unit === "kg" ? "/কেজি" : "/ পিস")}
    </span>

    <button
  onClick={() => {
    addToCart(p);
    setAddedId(p._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  disabled={p.quantity === 0}
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
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

  {/* SEE MORE */}
  <div className="text-center mt-10">
    <Link to="/products">
      <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-medium hover:scale-105 hover:shadow-green-400/50 transition duration-300">
        {lang === "en" ? "See More" : "আরও দেখুন"}
      </button>
    </Link>
  </div>

</div>
{/* DEALS / PROMO BANNER */}
<div className="w-full px-6 mb-8 mt-6 mx-auto">

  <div className="relative rounded-3xl overflow-hidden shadow-2xl group">

    {/* Background Image */}
    <img
      src="https://images.unsplash.com/photo-1542838132-92c53300491e"
      alt="Fresh Food"
      className="w-full h-[200px] object-cover group-hover:scale-105 transition duration-500"
    />

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-center px-10">

      <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
         {lang === "en" ? "Best Deals This Week" : "এই সপ্তাহের সেরা অফার"}
      </h2>

      <p className="text-white/90 mt-2 text-lg md:text-xl">
       {lang === "en" ? "Fresh From Farm " : "খামার থেকে সরাসরি "}
      </p>

      {/* Button */}
      <button onClick={() => navigate("/products")}className="mt-5 w-fit bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 hover:shadow-green-400/50 transition duration-300">
        {lang === "en" ? "Shop Now" : "এখনই কিনুন"}
      </button>

    </div>

  </div>

</div>

{/* Products (grains) */}

  <div className="px-6 py-8">

  {/* TITLE */}
  <h2 className="text-3xl font-bold mb-2 text-center text-green-700">
    {lang === "en" ? "Grains & Cereals" : "শস্য ও খাদ্যশস্য"}
  </h2>

  <p className="text-center text-gray-500 mb-8 text-lg">
    {lang === "en"
      ? "Fuel Your Day with Pure Natural Energy"
      : "প্রাকৃতিক শক্তিতে ভরপুর প্রতিদিন"}
  </p>

  {/* PRODUCTS */}
  <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-1 gap-5">

    {(products || [])
.filter(p =>
  p?.category?.en === "grains" &&
  (!categoryFromURL || p?.category?.en === categoryFromURL)
)
      .slice(0, 5)
      .map(p => (

        <div
          key={p._id}
          className="bg-white p-4 rounded-xl shadow-md border border-transparent 
          transition-all duration-300 ease-in-out 
          hover:shadow-xl hover:-translate-y-1 hover:border-green-700"
        >

          <Link to={`/product/${p._id}`}>
            <img
              src={p.image}
              alt={p.name?.en}
              className="h-32 mx-auto object-contain rounded-lg"
            />

            <h3 className="mt-5 px-3 font-semibold text-lg">
              {p.name?.[lang] || p.name?.en}
            </h3>
          </Link>

          <span className="text-gray-500  px-3 block">
            {p.category?.[lang] || p.category?.en}
          </span>

          {/* Stock Quantity Display */}
          <span className="text-sm font-semibold text-gray-400 mt-2 px-3 block">
            {lang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (lang === "en" ? "kg" : "কেজি") : (lang === "en" ? "units" : "ইউনিট")}
          </span>

          <span className="text-md font-semibold mt-2 px-3 block">
            <span className="bdt-symbol">{"৳"}</span>{p.price}{" "}
            {lang === "en"
              ? `/ ${p.unit}`
              : p.unit === "kg"
              ? "/কেজি"
              : "/ পিস"}
          </span>

          <button
  onClick={() => {
    addToCart(p);
    setAddedId(p._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  disabled={p.quantity === 0}
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
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

  {/* EMPTY STATE (VERY IMPORTANT) */}
  {(products || []).filter(p =>
  p?.category?.en === "grains" &&
  (!categoryFromURL || p?.category?.en === categoryFromURL)
).length === 0 && (
    <p className="text-center text-gray-400 mt-6">
      {lang === "en" ? "No grains available" : "কোনো শস্য পাওয়া যায়নি"}
    </p>
  )}

  {/* SEE MORE */}
  <div className="text-center mt-10">
    <Link to="/products?category=grains">
      <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-medium hover:scale-105 hover:shadow-green-400/50 transition duration-300">
        {lang === "en" ? "See More" : "আরও দেখুন"}
      </button>
    </Link>
  </div>

</div>


{/* Products (vegetable) */}

  <div className="px-6 py-8">

  {/* TITLE */}
  <h2 className="text-3xl font-bold mb-2 text-center text-green-700">
  {lang === "en" ? "Veggie Vibes " : "সবজির মজা "}
</h2>

<p className="text-center text-gray-500 mb-8 text-lg">
  {lang === "en"
    ? "Handpicked Freshness for Healthier Meals"
    : "স্বাস্থ্যকর খাবারের জন্য বাছাইকৃত তাজা সবজি"}
</p>

  {/* PRODUCTS */}
  <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-1 gap-5">

    {(products || [])
.filter(p =>
  p?.category?.en === "vegetables" &&
  (!categoryFromURL || p?.category?.en === categoryFromURL)
)      .slice(0, 5)
      .map(p => (

        <div
          key={p._id}
          className="bg-white p-4 rounded-xl shadow-md border border-transparent 
          transition-all duration-300 ease-in-out 
          hover:shadow-xl hover:-translate-y-1 hover:border-green-700"
        >

          <Link to={`/product/${p._id}`}>
            <img
              src={p.image}
              alt={p.name?.en}
              className="h-32 mx-auto object-contain rounded-lg"
            />

            <h3 className="mt-5 px-3 font-semibold text-lg">
              {p.name?.[lang] || p.name?.en}
            </h3>
          </Link>

          <span className="text-gray-500  px-3 block">
            {p.category?.[lang] || p.category?.en}
          </span>

          {/* Stock Quantity Display */}
          <span className="text-sm font-semibold text-gray-400 mt-2 px-3 block">
            {lang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (lang === "en" ? "kg" : "কেজি") : (lang === "en" ? "units" : "ইউনিট")}
          </span>


          <span className="text-md font-semibold mt-2 px-3 block">
            <span className="bdt-symbol">{"৳"}</span>{p.price}{" "}
            {lang === "en"
              ? `/ ${p.unit}`
              : p.unit === "kg"
              ? "/কেজি"
              : "/ পিস"}
          </span>

          <button
  onClick={() => {
    addToCart(p);
    setAddedId(p._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  disabled={p.quantity === 0}
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
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

  {/* EMPTY STATE  */}
  {(products || []).filter(p =>
    p?.category?.en === "vegetables" &&
    (!categoryFromURL || p?.category?.en === categoryFromURL)
  ).length === 0 && (
    <p className="text-center text-gray-400 mt-6">
      {lang === "en" ? "No vegetables available" : "কোনো সবজি পাওয়া যায়নি"}
    </p>
  )}

  {/* SEE MORE */}
  <div className="text-center mt-10">
    <Link to="/products?category=vegetables">
      <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-medium hover:scale-105 hover:shadow-green-400/50 transition duration-300">
        {lang === "en" ? "See More" : "আরও দেখুন"}
      </button>
    </Link>
  </div>

</div>

{/* Products (fruits) */}

  <div className="px-6 py-8">

  {/* TITLE */}
<h2 className="text-3xl font-bold mb-2 text-center text-green-700">
  {lang === "en" ? "Fruity Fiesta" : "ফলের উৎসব"}
</h2>

<p className="text-center text-gray-500 mb-8 text-lg">
  {lang === "en"
    ? "Sweet, Juicy & Full of Freshness!"
    : "মিষ্টি, রসালো আর একদম টাটকা!"}
</p>

  {/* PRODUCTS */}
  <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-1 gap-5">

    {(products || [])
.filter(p =>
  p?.category?.en === "fruits" &&
  (!categoryFromURL || p?.category?.en === categoryFromURL)
)      .slice(0, 5)
      .map(p => (

        <div
          key={p._id}
          className="bg-white p-4 rounded-xl shadow-md border border-transparent 
          transition-all duration-300 ease-in-out 
          hover:shadow-xl hover:-translate-y-1 hover:border-green-700"
        >

          <Link to={`/product/${p._id}`}>
            <img
              src={p.image}
              alt={p.name?.en}
              className="h-32 mx-auto object-contain rounded-lg"
            />

            <h3 className="mt-5 px-3 font-semibold text-lg">
              {p.name?.[lang] || p.name?.en}
            </h3>
          </Link>

          <span className="text-gray-500  px-3 block">
            {p.category?.[lang] || p.category?.en}
          </span>

          {/* Stock Quantity Display */}
          <span className="text-sm font-semibold text-gray-400 mt-2 px-3 block">
            {lang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (lang === "en" ? "kg" : "কেজি") : (lang === "en" ? "units" : "ইউনিট")}
          </span>

        
          <span className="text-md font-semibold mt-2 px-3 block">
            <span className="bdt-symbol">{"৳"}</span>{p.price}{" "}
            {lang === "en"
              ? `/ ${p.unit}`
              : p.unit === "kg"
              ? "/কেজি"
              : "/ পিস"}
          </span>

          <button
  onClick={() => {
    addToCart(p);
    setAddedId(p._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  disabled={p.quantity === 0}
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
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

  {/* EMPTY STATE (VERY IMPORTANT) */}
  {(products || []).filter(p =>
    p?.category?.en === "fruits" &&
    (!categoryFromURL || p?.category?.en === categoryFromURL)
  ).length === 0 && (
    <p className="text-center text-gray-400 mt-6">
      {lang === "en" ? "No fruits available" : "কোনো ফল পাওয়া যায়নি"}
    </p>
  )}

  {/* SEE MORE */}
  <div className="text-center mt-10">
    <Link to="/products?category=fruits">
      <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-medium hover:scale-105 hover:shadow-green-400/50 transition duration-300">
        {lang === "en" ? "See More" : "আরও দেখুন"}
      </button>
    </Link>
  </div>

</div>

{/* Products (pulses) */}

  <div className="px-6 py-8">

  {/* TITLE */}
<h2 className="text-3xl font-bold mb-2 text-center text-green-700">
  {lang === "en" ? "Protein Power" : "প্রোটিন পাওয়ার "}
</h2>

<p className="text-center text-gray-500 mb-8 text-lg">
  {lang === "en"
    ? "Strong, Healthy & Full of Nutrition!"
    : "পুষ্টিতে ভরপুর, শক্তি আর স্বাস্থ্যের জন্য!"}
</p>

  {/* PRODUCTS */}
  <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-1 gap-5">

    {(products || [])
.filter(p =>
  p?.category?.en === "pulses" &&
  (!categoryFromURL || p?.category?.en === categoryFromURL)
)      .slice(0, 5)
      .map(p => (

        <div
          key={p._id}
          className="bg-white p-4 rounded-xl shadow-md border border-transparent 
          transition-all duration-300 ease-in-out 
          hover:shadow-xl hover:-translate-y-1 hover:border-green-700"
        >

          <Link to={`/product/${p._id}`}>
            <img
              src={p.image}
              alt={p.name?.en}
              className="h-32 mx-auto object-contain rounded-lg"
            />

            <h3 className="mt-5 px-3 font-semibold text-lg">
              {p.name?.[lang] || p.name?.en}
            </h3>
          </Link>

          <span className="text-gray-500  px-3 block">
            {p.category?.[lang] || p.category?.en}
          </span>

          {/* Stock Quantity Display */}
          <span className="text-sm font-semibold text-gray-400 mt-2 px-3 block">
            {lang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (lang === "en" ? "kg" : "কেজি") : (lang === "en" ? "units" : "ইউনিট")}
          </span>

          
          <span className="text-md font-semibold mt-2 px-3 block">
            <span className="bdt-symbol">{"৳"}</span>{p.price}{" "}
            {lang === "en"
              ? `/ ${p.unit}`
              : p.unit === "kg"
              ? "/কেজি"
              : "/ পিস"}
          </span>

          <button
            onClick={() => {
              addToCart(p);
              setAddedId(p._id);

              setTimeout(() => {
                setAddedId(null);
              }, 2000);
            }}
            disabled={p.quantity === 0}
            className={`mt-4 w-full font-medium py-2 rounded-full transition 
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

  {/* EMPTY STATE  */}
  {(products || []).filter(p =>
    p?.category?.en === "pulses" &&
    (!categoryFromURL || p?.category?.en === categoryFromURL)
  ).length === 0 && (
    <p className="text-center text-gray-400 mt-6">
      {lang === "en" ? "No pulses available" : "কোনো পাঁচা পাওয়া যায়নি"}
    </p>
  )}

  {/* SEE MORE */}
  <div className="text-center mt-10">
    <Link to="/products?category=pulses">
      <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-medium hover:scale-105 hover:shadow-green-400/50 transition duration-300">
        {lang === "en" ? "See More" : "আরও দেখুন"}
      </button>
    </Link>
  </div>

</div>

{/* Products (oilseed) */}

  <div className="px-6 py-8">

  {/* TITLE */}
<h2 className="text-3xl font-bold mb-2 text-center text-green-700">
  {lang === "en" ? "Golden Oils & Seeds" : "সোনালি তেলবীজ"}
</h2>

<p className="text-center text-gray-500 mb-8 text-lg">
  {lang === "en"
    ? "Pure, Healthy & Packed with Goodness!"
    : "বিশুদ্ধ, স্বাস্থ্যকর আর পুষ্টিতে ভরপুর!"}
</p>
  {/* PRODUCTS */}
  <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-1 gap-5">

    {(products || [])
.filter(p =>
  p?.category?.en === "oilseed" &&
  (!categoryFromURL || p?.category?.en === categoryFromURL)
)      .slice(0, 5)
      .map(p => (

        <div
          key={p._id}
          className="bg-white p-4 rounded-xl shadow-md border border-transparent 
          transition-all duration-300 ease-in-out 
          hover:shadow-xl hover:-translate-y-1 hover:border-green-700"
        >

          <Link to={`/product/${p._id}`}>
            <img
              src={p.image}
              alt={p.name?.en}
              className="h-32 mx-auto object-contain rounded-lg"
            />

            <h3 className="mt-5 px-3 font-semibold text-lg">
              {p.name?.[lang] || p.name?.en}
            </h3>
          </Link>

          <span className="text-gray-500  px-3 block">
            {p.category?.[lang] || p.category?.en}
          </span>

          {/* Stock Quantity Display */}
          <span className="text-sm font-semibold text-gray-400 mt-2 px-3 block">
            {lang === "en" ? "In Stock: " : "স্টকে: "}{p.quantity || 0} {p.unit === "kg" ? (lang === "en" ? "kg" : "কেজি") : (lang === "en" ? "units" : "ইউনিট")}
          </span>

          <span className="text-md font-semibold mt-2 px-3 block">
            <span className="bdt-symbol">{"৳"}</span>{p.price}{" "}
            {lang === "en"
              ? `/ ${p.unit}`
              : p.unit === "kg"
              ? "/কেজি"
              : "/ পিস"}
          </span>
<button
  onClick={() => {
    addToCart(p);
    setAddedId(p._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  disabled={p.quantity === 0}
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
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

  {/* EMPTY STATE (VERY IMPORTANT) */}
  {(products || []).filter(p =>
    p?.category?.en === "oilseed" &&
    (!categoryFromURL || p?.category?.en === categoryFromURL)
  ).length === 0 && (
    <p className="text-center text-gray-400 mt-6">
      {lang === "en" ? "No oilseed available" : "কোনো তেলবীজ পাওয়া যায়নি"}
    </p>
  )}

  {/* SEE MORE */}
  <div className="text-center mt-10">
    <Link to="/products?category=oilseed">
      <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-medium hover:scale-105 hover:shadow-green-400/50 transition duration-300">
        {lang === "en" ? "See More" : "আরও দেখুন"}
      </button>
    </Link>
  </div>

</div>

{/* CATEGORY BANNER PERFECT LAYOUT */}
<div className="px-6 py-10">

  <div className="grid grid-cols-3 grid-rows-2 gap-5 h-[400px]">

    {/* LEFT TOP */}
    <div
      onClick={() => window.location.href="/products?category=vegetables"}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      <img src="/veg.jpg" className="w-full h-full object-cover group-hover:scale-105 transition"/>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <h3 className="text-white text-xl font-bold">
          {lang === "en" ? "Vegetables" : "সবজি"}
        </h3>
      </div>
    </div>

    {/* MIDDLE BIG (2 ROWS) */}
    <div
      onClick={() => window.location.href="/products?category=grains"}
      className="row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      <img src="/grains.jpg" className="w-full h-full object-cover group-hover:scale-105 transition"/>
      <div className="absolute inset-0 bg-green-900/40 flex flex-col items-center justify-center">
        <h3 className="text-white text-2xl font-bold mb-3 text-center px-2">
          {lang === "en" ? "Stock Up Essentials" : "প্রয়োজনীয় পণ্য"}
        </h3>
        <Link to="/products">
  <button className="bg-green-700 px-4 py-2 rounded text-white">
    {lang === "en" ? "Shop Now" : "এখনই কিনুন"}
  </button>
</Link>
      </div>
    </div>

    {/* RIGHT TOP */}
    <div
      onClick={() => window.location.href="/products?category=fruits"}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      <img src="/fruits.jpg" className="w-full h-full object-cover group-hover:scale-105 transition"/>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <h3 className="text-white text-xl font-bold">
          {lang === "en" ? "Fruits" : "ফল"}
        </h3>
      </div>
    </div>

    {/* LEFT BOTTOM */}
    <div
      onClick={() => window.location.href="/products?category=pulses"}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      <img src="/pulses.jpg" className="w-full h-full object-cover group-hover:scale-105 transition"/>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <h3 className="text-white text-xl font-bold">
          {lang === "en" ? "Pulses" : "ডাল"}
        </h3>
      </div>
    </div>

    {/* RIGHT BOTTOM */}
    <div
      onClick={() => window.location.href="/products?category=oilseed"}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      <img src="/oil.jpg" className="w-full h-full object-cover group-hover:scale-105 transition"/>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <h3 className="text-white text-xl font-bold">
          {lang === "en" ? "Oilseed" : "তেলবীজ"}
        </h3>
      </div>
    </div>

  </div>
</div>

{/*  OFFERS / FLASH DEAL SECTION */}
<div className="px-6 py-5">
  <h2 className="text-3xl font-bold mb-10 text-center text-green-700">
  {lang === "en" ? "All Hot Deals" : "সব হট অফার"}
</h2>
  {/* TOP BANNER + COVERAGE */}
  <div className="grid md:grid-cols-3 gap-5 mb-8">

    {/* LEFT BIG BANNER */}
    <div className="col-span-2 relative rounded-2xl overflow-hidden">
      <img
        src="/offer-banner.png"
        className="w-full h-48 object-cover"
      />

      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-10">
        <h2 className="text-white text-3xl font-bold mb-2">
          {lang === "en" ? "Monthly Grocery Deals!" : "মাসিক গ্রোসারি অফার!"}
        </h2>
        <p className="text-white">
          {lang === "en"
            ? "Save more with exciting discounts"
            : "দারুণ ডিসকাউন্টে আরও সাশ্রয় করুন"}
        </p>
      </div>
    </div>

    {/* RIGHT COVERAGE */}
    <div className="bg-gray-100 rounded-2xl p-5">
      <h3 className="font-bold mb-3 text-center">
        {lang === "en" ? "Coverage Area" : "সার্ভিস এলাকা"}
      </h3>

      <div className="grid grid-cols-2 text-md gap-2">
        <span>Dhaka</span><span className="text-green-700"> 3</span>
        <span>Gazipur</span><span className="text-green-700">3</span>
        <span>Comilla</span><span className="text-green-700">3</span>
        <span>Jamalpur</span><span className="text-green-700">3</span>
      </div>
    </div>

  </div>

  {/* PROMO CARDS SCROLL */}
 {/* PREMIUM OFFERS SECTION */}
<div
  id="offers"
  className="flex gap-6 overflow-x-auto pb-4 px-1 scroll-smooth"
>

  {/* CARD 1 */}
  <div className="min-w-[280px] bg-gradient-to-br from-green-600 via-green-700 to-green-900 text-white p-6 rounded-[30px] shadow-2xl hover:scale-105 transition relative overflow-hidden">

    {/* Glow */}
    <div className="absolute w-40 h-40 bg-white/10 rounded-full -top-10 -right-10"></div>

    <h3 className="text-2xl font-extrabold mb-2">
      SAVE50
    </h3>

    <p className="text-lg font-semibold">
      Flat <span className="bdt-symbol">৳</span>50 OFF
    </p>

    <p className="text-sm text-green-100 mt-3 leading-6">
      Use promo code <span className="font-bold">SAVE50</span>
      during checkout and get instant discount.
    </p>

    <button className="mt-5 bg-white text-green-700 px-5 py-2 rounded-full font-bold hover:bg-green-100 transition">
      Use Now
    </button>

  </div>

  {/* CARD 2 */}
  <div className="min-w-[280px] bg-gradient-to-br from-green-600 via-green-700 to-green-900 text-white p-6 rounded-[30px] shadow-2xl hover:scale-105 transition relative overflow-hidden">

    <div className="absolute w-40 h-40 bg-white/10 rounded-full -bottom-10 -left-10"></div>

    <h3 className="text-2xl font-extrabold mb-2">
      Free Delivery
    </h3>

    <p className="text-lg font-semibold">
      Orders Above TK 2500
    </p>

    <p className="text-sm text-green-100 mt-3 leading-6">
      Enjoy free delivery on selected
      fresh farm products across your district.
    </p>

    <button className="mt-5 bg-white text-green-700 px-5 py-2 rounded-full font-bold hover:bg-green-100 transition">
      Shop Now
    </button>

  </div>

  {/* CARD 3 */}
  <div className="min-w-[280px] bg-gradient-to-br from-green-600 via-green-700 to-green-900 text-white p-6 rounded-[30px] shadow-2xl hover:scale-105 transition relative overflow-hidden">

    <div className="absolute w-40 h-40 bg-white/10 rounded-full top-0 right-0"></div>

    <h3 className="text-2xl font-extrabold mb-2">
      Fresh Harvest
    </h3>

    <p className="text-lg font-semibold">
      Daily Farm Collection
    </p>

    <p className="text-sm text-blue-100 mt-3 leading-6">
      Get newly harvested vegetables
      and fruits directly from verified farmers.
    </p>

    <button className="mt-5 bg-white text-indigo-700 px-5 py-2 rounded-full font-bold hover:bg-indigo-100 transition">
      Explore
    </button>

  </div>

</div>

</div>


{/* FOOTER */}
<footer id="contact" className="bg-gradient-to-t from-green-200 to-green-50 text-black px-6 py-10 mt-10">

  <div className="grid md:grid-cols-4 gap-8">

    {/* LOGO + ABOUT */}
    <div>
      <h2 className="text-2xl font-bold mb-3">AgroLink</h2>
      <p className="text-md text-gray-500">
        {lang === "en"
          ? "Connecting farmers with customers for fresh and healthy food."
          : "তাজা ও স্বাস্থ্যকর খাবারের জন্য কৃষক ও গ্রাহকদের সংযোগ স্থাপন।"}
      </p>
    </div>

    {/* QUICK LINKS */}
    <div>
      <h3 className="font-semibold mb-3">
        {lang === "en" ? "Quick Links" : "দ্রুত লিংক"}
      </h3>
      <ul className="space-y-2 text-md text-gray-500">
        <li><a href="/" className="hover:text-white">Home</a></li>
        <li><a href="/products" className="hover:text-white">Products</a></li>
        <li><a href="/login" className="hover:text-white">Login</a></li>
      </ul>
    </div>

    {/* CONTACT */}
    <div>
      <h3 className="font-semibold mb-3">
        {lang === "en" ? "Contact" : "যোগাযোগ"}
      </h3>
      <p className="text-sm text-gray-500 mb-2"> Dhaka, Bangladesh</p>
      <p className="text-sm text-gray-500 mb-2"> 0193430313</p>
      <p className="text-sm text-gray-500"> support@agrolink.com</p>
    </div>

    {/* SOCIAL */}
    <div>
      <h3 className="font-semibold mb-3">
        {lang === "en" ? "Follow Us" : "আমাদের অনুসরণ করুন"}
      </h3>

      <div className="flex gap-4 text-2xl">

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
  <div className="border-t border-green-700 mt-8 pt-4 text-center text-sm text-gray-700">
    © 2026 AgroLink. {lang === "en" ? "All rights reserved." : "সর্বস্বত্ব সংরক্ষিত।"}
  </div>

</footer>
    </div>
  );
}

export default Home;
