import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, Bell, User, Wheat, Leaf, Apple, Bean, Flower2, ChevronRight, Truck, ShieldCheck, Headphones, CreditCard} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";

function Home({ lang, setLang, cart, addToCart }) {

    //Navbar 1 states
      const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
   // Navbar 2 states
  const [showCategory, setShowCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
  { en: "Grains", bn: "শস্য", icon: <Wheat size={20} /> },
  { en: "Vegetables", bn: "সবজি", icon: <Leaf size={20} /> },
  { en: "Fruits", bn: "ফল", icon: <Apple size={20} /> },
  { en: "Pulses", bn: "ডাল", icon: <Bean size={20} /> },
  { en: "Oilseed", bn: "তেলশস্য", icon: <Flower2 size={20} /> }
];
const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
const categoryFromURL = queryParams.get("category");

useEffect(() => {
  if (categoryFromURL) {
    setSelectedCategory(categoryFromURL);
  }
}, [categoryFromURL]);


const [district, setDistrict] = useState("");
         const [area, setArea] = useState("");
         useEffect(() => {
  const savedDistrict = localStorage.getItem("district");
  const savedArea = localStorage.getItem("area");

  if (savedDistrict) setDistrict(savedDistrict);
  if (savedArea) setArea(savedArea);
}, []);
   
const areaData = {
  Dhaka: ["Uttara", "Mirpur", "Dhanmondi"],
  Gazipur: ["Tongi", "Sreepur", "Kaliakair"],
  Comilla: ["Daudkandi", "Debidwar", "Laksam"],
  Jamalpur: ["Jamalpur Sadar", "Islampur", "Sarishabari"]
};
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
const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;
useEffect(() => {
  console.log("cart updated:", cart);
}, [cart]);

useEffect(() => {
  fetch("http://localhost:3000/api/products")
    .then(res => res.json())
   .then(data => {
  if (!Array.isArray(data)) return;
  const shuffled = [...data].sort(() => 0.5 - Math.random());
  setProducts(shuffled);
})
.catch(err => console.error(err));
}, []);

const [addedId, setAddedId] = useState(null);

 const currentLang = lang || "en";

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
        <input
          type="text"
          placeholder={lang === "en" ? "Search products...." : "পণ্য খুঁজুন...."}
          className="w-full px-4 py-2 border border-green-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-font-semibold"
        />
      </div>

      {/* RIGHT - ICONS + LANGUAGE */}
      <div className="flex items-center gap-5">

        {/* LANGUAGE SWITCH */}
        <div className="flex gap-2 text-sm font-semibold">
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
  <ShoppingCart size={26} className="text-gray-700" />

  <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
    {cartCount}
  </span>
</div>

        <Bell className="cursor-pointer text-gray-700 hover:text-green-700" />

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
    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50">

      {/* PROFILE */}
      <div
        onClick={() => navigate("/profile")}
        className="px-4 py-2 hover:bg-green-100 cursor-pointer"
      >
        {currentLang === "en" ? "Profile" : "প্রোফাইল"}
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
      <div className="w-full bg-green-50 shadow-sm px-6 py-2 flex items-center justify-around relative">

        {/* LEFT - CATEGORY */}
        <div className="relative">
          <button
            onClick={() => setShowCategory(!showCategory)}
            className="flex items-center gap-8 font-semibold"
          >
            <Menu />
            {lang === "en" ? "Select Categories" : "ক্যাটাগরি নির্বাচন"}
          </button>

          {showCategory && (
  <div className="absolute top-12 left-0 bg-white shadow-xl rounded-xl p-3 w-64 z-50">

    {categories.map((cat) => (
      <div
        key={cat.en}
        onClick={() => {
          setSelectedCategory(cat.en.toLowerCase())
          setShowCategory(false);
        }}
        className="flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer hover:bg-green-100 transition"
      >

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3 text-lg font-medium text-gray-700">
          <span className="text-green-600">{cat.icon}</span>
          <span>{lang === "en" ? cat.en : cat.bn}</span>
        </div>

        {/* RIGHT ARROW */}
        <ChevronRight className="text-gray-400" />

      </div>
    ))}

  </div>
          )}
</div>

        {/* CENTER */}
        <div className="text-sm text-gray-600">
          {selectedCategory && selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
        </div>

        {/* RIGHT - LOCATION */}
        <div className="flex gap-2">

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
  className="border p-1 rounded"
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
  className="border p-1 rounded"
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
    
      {/* Hero section*/}
    <div className="flex w-full h-[400px] mt-8 gap-5 mx-auto px-20 ">

      {/* LEFT SIDEBAR (1/4) */}
      <div className="w-1/4 bg-green-50 shadow-md rounded-lg p-5 flex flex-col gap-6">

        <Link to="/" className="hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white">
          {lang === "en" ? "Home" : "হোম"}
        </Link>

        <Link to="/products" className="hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white">
          {lang === "en" ? "All Products" : "সব পণ্য"}
        </Link>

        <Link to="/offers" className="hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white">
          {lang === "en" ? "Offers" : "অফার"}
        </Link>

        <Link to="/about" className="hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white">
          {lang === "en" ? "About Us" : "আমাদের সম্পর্কে"}
        </Link>

        <Link to="/contact" className="hover:bg-green-500 font-medium bg-green-700 p-2 rounded-lg text-center text-white">
          {lang === "en" ? "Contact Us" : "যোগাযোগ"}
        </Link>
      </div>
      {/* 🔹 right SIDEBAR (3/4) */}
      <div className="w-3/4 bg-green-50 rounded-lg pb-5 shadow-md">
        <div className="w-full h-[400px] relative overflow-hidden">

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
          {lang === "en" ? "60 Minutes Delivery" : "৬০ মিনিটে ডেলিভারি"}
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
    {/* PRICE + UNIT */}
    <span className="text-md font-semibold mt-3 px-3">
    {"৳" + p.price} {lang === "en" ? `/ ${p.unit}` : (p.unit === "kg" ? "/কেজি" : "/ পিস")}
    </span>

    <button
  onClick={() => {
    addToCart(p);
    setAddedId(p._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
    ${addedId === p._id 
      ? "bg-green-500 text-white" 
      : "bg-green-700 text-white hover:bg-green-800"}
  `}
>
  {addedId === p._id
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
      <button className="mt-5 w-fit bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:scale-105 hover:shadow-green-400/50 transition duration-300">
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

          <span className="text-md font-semibold mt-2 px-3 block">
            {"৳" + p.price}{" "}
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
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
    ${addedId === p._id 
      ? "bg-green-500 text-white" 
      : "bg-green-700 text-white hover:bg-green-800"}
  `}
>
  {addedId === p._id
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

          <span className="text-md font-semibold mt-2 px-3 block">
            {"৳" + p.price}{" "}
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
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
    ${addedId === p._id 
      ? "bg-green-500 text-white" 
      : "bg-green-700 text-white hover:bg-green-800"}
  `}
>
  {addedId === p._id
    ? (lang === "en" ? "Added" : "যোগ হয়েছে")
    : (lang === "en" ? "Add to Cart" : "কার্টে যোগ করুন")}
</button>

        </div>

      ))}

  </div>

  {/* EMPTY STATE (VERY IMPORTANT) */}
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

          <span className="text-md font-semibold mt-2 px-3 block">
            {"৳" + p.price}{" "}
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
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
    ${addedId === p._id 
      ? "bg-green-500 text-white" 
      : "bg-green-700 text-white hover:bg-green-800"}
  `}
>
  {addedId === p._id
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

          <span className="text-md font-semibold mt-2 px-3 block">
            {"৳" + p.price}{" "}
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
            className={`mt-4 w-full font-medium py-2 rounded-full transition 
              ${addedId === p._id 
                ? "bg-green-500 text-white" 
                : "bg-green-700 text-white hover:bg-green-800"}
            `}
          >
            {addedId === p._id
              ? (lang === "en" ? "Added" : "যোগ হয়েছে")
              : (lang === "en" ? "Add to Cart" : "কার্টে যোগ করুন")}
          </button>

        </div>

      ))}

  </div>

  {/* EMPTY STATE (VERY IMPORTANT) */}
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

          <span className="text-md font-semibold mt-2 px-3 block">
            {"৳" + p.price}{" "}
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
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
    ${addedId === p._id 
      ? "bg-green-500 text-white" 
      : "bg-green-700 text-white hover:bg-green-800"}
  `}
>
  {addedId === p._id
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
        <span>Dhaka</span><span className="text-green-700">38 outlets</span>
        <span>Gazipur</span><span className="text-green-700">12 outlets</span>
        <span>Comilla</span><span className="text-green-700">9 outlets</span>
        <span>Sylhet</span><span className="text-green-700">10 outlets</span>
      </div>
    </div>

  </div>

  {/* PROMO CARDS SCROLL */}
  <div className="flex gap-4 overflow-x-auto pb-2">

    {/* CARD 1 - BKASH */}
    <div className="min-w-[200px] bg-gradient-to-br from-pink-500 to-red-800 text-white p-4 rounded-2xl shadow-lg">
      <h3 className="font-bold text-lg">bKash Offer</h3>
      <p className="text-sm">7% Discount</p>
      <p className="text-xs mt-2">Use code: BKASH7</p>
    </div>

    {/* CARD 2 - NAGAD */}
    <div className="min-w-[200px] bg-gradient-to-br from-orange-500 to-orange-800 text-white p-4 rounded-2xl shadow-lg">
      <h3 className="font-bold text-lg">Nagad</h3>
      <p className="text-sm">10% Cashback</p>
      <p className="text-xs mt-2">Min ৳1000</p>
    </div>

    {/* CARD 3 - CARD PAYMENT */}
    <div className="min-w-[200px] bg-gradient-to-br from-blue-500 to-blue-800 text-white p-4 rounded-2xl shadow-lg">
      <h3 className="font-bold text-lg">Card Offer</h3>
      <p className="text-sm">10% OFF</p>
      <p className="text-xs mt-2">On ৳2000+</p>
    </div>

    {/* CARD 4 - PROMO CODE */}
    <div className="min-w-[200px] bg-gradient-to-br from-green-500 to-green-800 text-white p-4 rounded-2xl shadow-lg">
      <h3 className="font-bold text-lg">Promo Code</h3>
      <p className="text-sm">Flat ৳100 OFF</p>
      <p className="text-xs mt-2">Use: SAVE100</p>
    </div>

  </div>

</div>


{/* FOOTER */}
<footer className="bg-gradient-to-t from-green-200 to-green-50 text-black px-6 py-10 mt-10">

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
      <p className="text-sm text-gray-500 mb-2"> 017XXXXXXXX</p>
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