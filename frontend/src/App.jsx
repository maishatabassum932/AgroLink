import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import { useState, useEffect } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import ProductDetails from "./pages/ProductDetails";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout"
import Farmer from "./pages/Farmer";

function App() {
 const user = JSON.parse(localStorage.getItem("user"));
  const [lang, setLang] = useState("en");
   // GLOBAL CART STATE
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });
  // SAVE CART
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  // ADD FUNCTION 
  const addToCart = (product) => {
  setCart(prev => {
    const exist = prev.find(item => item.id === product._id);

    let updatedCart;

    if (exist) {
      updatedCart = prev.map(item =>
        item.id === product._id
          ? { ...item, qty: item.qty + (product.qty || 1) }
          : item
      );
    } else {
      updatedCart = [
        ...prev,
        {
          id: product._id,
          name: product.name.en,
          price: product.price,
          qty: product.qty || 1,
          farmerId: product.farmerId?._id || product.farmerId,
          farmerName: product.farmerId?.name || "Farmer",
          district: product.district
        }
      ];
    }

    return updatedCart;
  });
};
  

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Register />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home lang={lang} setLang={setLang} cart={cart} addToCart={addToCart}  />} />
        <Route path="/products" element={<Products lang={lang} setLang={setLang} cart={cart} addToCart={addToCart}  />} />
        <Route path="/profile" element={<Profile />} />
        <Route
  path="/admin"
  element={
    user?.role?.toLowerCase() === "admin"
      ? <Admin />
      : <Navigate to="/login" />
  }
/>
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/checkout" element={<Checkout />} />
<Route path="/product/:id" element={<ProductDetails addToCart={addToCart} cart={cart} />} /> 

<Route
  path="/farmer"
  element={
    user?.role?.toLowerCase() === "farmer"
      ? <Farmer />
      : <Navigate to="/login" />
  }
/>
 </Routes>

    </BrowserRouter>
  );
}

export default App;