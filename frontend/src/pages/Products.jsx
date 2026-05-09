import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import { ShoppingCart, Bell, User, Menu, Wheat, Leaf, Apple, Bean, Flower2, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";

function Products({ lang, setLang,  cart, addToCart  }) {

  const navigate = useNavigate();
  const location = useLocation();
  const [addedId, setAddedId] = useState(null);
  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;
  useEffect(() => {
  console.log("cart updated:", cart);
}, [cart]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const categoryFromURL = queryParams.get("category");
  
  const [products, setProducts] = useState([]);

  const [showCategory, setShowCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
  { en: "Grains", bn: "শস্য", icon: <Wheat size={20} /> },
  { en: "Vegetables", bn: "সবজি", icon: <Leaf size={20} /> },
  { en: "Fruits", bn: "ফল", icon: <Apple size={20} /> },
  { en: "Pulses", bn: "ডাল", icon: <Bean size={20} /> },
  { en: "Oilseed", bn: "তেলশস্য", icon: <Flower2 size={20} /> }
];

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

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setProducts(shuffled);
      });
  }, []);

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
          {selectedCategory && (
            <span>
              {lang === "en" ? "Category" : "ক্যাটাগরি"}: {selectedCategory}
            </span>
          )}
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
{/*  ALL products.. */}
      {/* TITLE */}
      <h2 className="text-3xl text-center font-bold text-green-700 mt-8 mb-6">
        {currentLang === "en" ? "All Products" : "সব পণ্য"}
      </h2>

      {/* PRODUCTS */}
      <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-5 px-10">

        {products
.filter(p =>
  (!selectedCategory || p.category?.en === selectedCategory) &&
  (!categoryFromURL || p.category?.en === categoryFromURL)
)          .filter(p => !area || p.area === area)
          .map(p => (

            <div key={p._id} className="bg-white p-4 rounded-xl shadow hover:shadow-xl">

              <Link to={`/product/${p._id}`}>
                <img src={p.image} className="h-32 mx-auto object-contain" />
                <h3 className="mt-3 font-semibold">
                  {p.name?.[currentLang] || p.name?.en}
                </h3>
              </Link>

              <p className="text-gray-500">
                {p.category?.[currentLang] || p.category?.en}
              </p>

              <p className="font-bold text-green-700">
                ৳{p.price} {currentLang==="en"?`/ ${p.unit}`:(p.unit==="kg"?"/কেজি":"/ পিস")}
              </p>

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

      {/*  BACK + CART BUTTON */}
      <div className="flex justify-center px-6 mt-10 gap-5">

        <Link to="/home">
          <button className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-full text-black font-semibold text-lg hover:bg-green-700 hover:text-white ">
            <ArrowLeft size={22}/> {currentLang==="en"?"Back":"পেছনে"}
          </button>
        </Link>

        <button onClick={()=>navigate("/cart")} className="flex items-center gap-2 bg-gray-200 text-black font-semibold text-lg px-4 py-2 rounded-full hover:bg-green-700 hover:text-white">
          {currentLang==="en"?"Cart":"কার্ট"} <ArrowRight size={22}/>
        </button>

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

export default Products;