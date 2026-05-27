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
import About from "./pages/About";
import OrderHistory from "./pages/OrderHistory";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const getCartKey = (user) =>
  user?._id ? `cart_${user._id}` : "guest_cart";

const getStoredCart = (cartKey) => {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    localStorage.removeItem(cartKey);
    return [];
  }
};

function App() {
 const [user, setUser] = useState(getStoredUser);

  // UNIQUE CART KEY
  const cartKey = getCartKey(user);

  const [lang, setLang] = useState("en");

  // CART STATE
  const [cart, setCart] = useState(() =>
    getStoredCart(getCartKey(getStoredUser()))
  );

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCart(getStoredCart(getCartKey(loggedInUser)));
  };

// SAVE CART
useEffect(() => {

  localStorage.setItem(
    cartKey,
    JSON.stringify(cart)
  );

}, [cart, cartKey]);

  // ADD FUNCTION 
  const addToCart = (product) => {

  // LOGIN CHECK
  if (!user) {

    alert(
      "Please login first to add products to cart"
    );

    window.location.href = "/login";

    return;
  }

  setCart(prev => {

    const exist = prev.find(
      item => item.id === product._id
    );

    let updatedCart;

    if (exist) {

      updatedCart = prev.map(item =>
        item.id === product._id
          ? {
              ...item,
              qty:
                item.qty + (product.qty || 1)
            }
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
          farmerId:
            product.farmerId?._id ||
            product.farmerId,
          farmerName:
            product.farmerId?.name ||
            "Farmer",
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
        <Route path="/" element={<Home lang={lang} setLang={setLang} cart={cart} addToCart={addToCart} />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/home" element={<Home lang={lang} setLang={setLang} cart={cart} addToCart={addToCart}  />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products lang={lang} setLang={setLang} cart={cart} addToCart={addToCart}  />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/order-history"
          element={user ? <OrderHistory /> : <Navigate to="/login" />}
        />
        <Route
  path="/admin"
  element={
    user?.role?.toLowerCase() === "admin"
      ? <Admin />
      : <Navigate to="/login" />
  }
/>
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
        <Route path="/checkout" element={<Checkout setCart={setCart} />} />
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
