import { useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

function Cart({ cart = [], setCart }) {
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
 const [selectedFarmers, setSelectedFarmers] = useState(() => {
  return JSON.parse(localStorage.getItem("selectedFarmers")) || {};
});

  const safeCart = Array.isArray(cart) ? cart : [];

  // USER DISTRICT 
 const [userDistrict, setUserDistrict] = useState("");

useEffect(() => {
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") {
      const parsed = JSON.parse(stored);
      setUserDistrict(parsed?.district || "");
    }
  } catch {
    setUserDistrict("");
  }
}, []);

  // GROUP BY FARMER
  const groupedCart = safeCart.reduce((acc, item) => {
    if (!acc[item.farmerId]) {
      acc[item.farmerId] = [];
    }
    acc[item.farmerId].push(item);
    return acc;
  }, {});

  // DELIVERY LOGIC 
  const calculateFarmerDelivery = (items) => {
    if (!items || items.length === 0) return 0;

    const farmerDistrict = items[0].district;

    return farmerDistrict === userDistrict ? 60 : 130;
  };

  // TOTAL PRICE
  const totalKg = safeCart.reduce((sum, item) => {
  if (!selectedFarmers[item.farmerId]) return sum;
  return sum + item.qty;
}, 0);

const totalPrice = Object.entries(groupedCart).reduce((sum, [fid, items]) => {
  if (!selectedFarmers[fid]) return sum;

  return sum + items.reduce((s, i) => s + i.price * i.qty, 0);
}, 0);
  // TOTAL DELIVERY
  const totalDelivery = Object.entries(groupedCart).reduce((sum, [fid, items]) => {
    if (!selectedFarmers[fid]) return sum;

    return sum + calculateFarmerDelivery(items);
  }, 0);

const extraDelivery = totalKg > 10 ? (totalKg - 10) * 5 : 0;

const finalTotal = totalPrice + totalDelivery + extraDelivery - discount;

  // ACTIONS
  const toggleFarmer = (fid) => {
    setSelectedFarmers(prev => ({
      ...prev,
      [fid]: !prev[fid]
    }));
  };

const increaseQty = (id) => {
  const item = safeCart.find(i => i.id === id);
if (!item) return;

  const currentKg = safeCart.reduce((sum, i) => {
    if (!selectedFarmers[i.farmerId]) return sum;
    return sum + i.qty;
  }, 0);

  // check BEFORE updating
  if (selectedFarmers[item.farmerId] && currentKg + 1 > 20) {
    setShowLimitModal(true);
    return;
  }

  // update ONLY ONCE
  setCart(prev =>
    prev.map(i =>
      i.id === id ? { ...i, qty: i.qty + 1 } : i
    )
  );
};

  const decreaseQty = (id) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

 useEffect(() => {
  localStorage.removeItem("coupon");
  localStorage.removeItem("discount");

  setCoupon("");
  setDiscount(0);
}, []);

  const applyCoupon = () => {
    if (coupon === "SAVE50") {
      setDiscount(50);
      localStorage.setItem("discount", 50);
      localStorage.setItem("coupon", coupon); 
    } else {
      setDiscount(0);
      localStorage.setItem("discount", 0);
      localStorage.setItem("coupon", "");
      alert("Invalid coupon");
    }
  };
useEffect(() => {
  localStorage.setItem("selectedFarmers", JSON.stringify(selectedFarmers));
}, [selectedFarmers]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 p-6 pb-36">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button className="p-2 bg-white rounded-full shadow" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">My Cart</h2>
      </div>

      {/* CART CONTENT */}
<div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
<div className="md:col-span-2 space-y-6">
        {Object.entries(groupedCart).map(([fid, items]) => (
          <div
            key={fid}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-5"
          >

            {/* FARMER HEADER */}
            <div className="flex justify-between items-center mb-4">

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedFarmers[fid] || false}

disabled={
  !selectedFarmers[fid] &&
  totalKg + items.reduce((s, i) => s + i.qty, 0) > 20
}
                 onChange={() => {
  if (!selectedFarmers[fid]) {
    // trying to SELECT new farmer
    const farmerItems = groupedCart[fid] || [];

    const farmerKg = farmerItems.reduce((s, i) => s + i.qty, 0);

    if (totalKg + farmerKg > 20) {
      setShowLimitModal(true);
      return;
    }
  }

  toggleFarmer(fid);
}}
                  className="w-5 h-5 accent-green-600"
                />

                <h3 className="font-semibold text-lg text-green-700">
                  {items[0].farmerName || "Farmer"}
                </h3>

                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {items[0].district}
                </span>
              </div>

              <span className="text-sm text-gray-500">
                {items.length} items
              </span>

            </div>

            {/* PRODUCTS */}
            {items.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b py-3"
              >

                <div>
                  <h4 className="font-medium text-gray-800">
                    {item.name}
                  </h4>
                  <p className="text-green-600 font-semibold">
                    ৳{item.price}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  {/* QTY CONTROL */}
                  <div className="flex items-center border rounded-full px-2 py-1 shadow-sm">

                    <button onClick={() => decreaseQty(item.id)}>
                      <Minus size={16} />
                    </button>

                    <span className="px-3 font-semibold">
                      {item.qty}
                    </span>

                    <button onClick={() => increaseQty(item.id)}> <Plus size={16} /> </button>
                  </div>

                  {/* DELETE */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 />
                  </button>

                </div>

              </div>
            ))}

            {/* DELIVERY */}
            <div className="flex justify-between mt-4 text-sm text-gray-600 font-medium">
              <span>
                Delivery ({items[0].district} → {userDistrict})
              </span>
              <span className="text-green-700 font-semibold">
                ৳{calculateFarmerDelivery(items)}
              </span>
            </div>

          </div>
        ))}
        </div>
    <div className="bg-white p-5 rounded-2xl shadow-md h-fit sticky top-5">

        {/* COUPON */}
        <div className="flex gap-3">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 border p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
          />
          <button
            onClick={applyCoupon}
            className="bg-red-500 text-white px-6 rounded-xl hover:bg-red-600 transition"
          >
            Apply
          </button>
        </div>
        {/* SUMMARY */}
         <div className="text-black text-lg font-semibold space-y-3 mt-10">


<p className="text-sm text-gray-400">
  Total: {totalKg} kg / 20 kg
</p> 
  <div className="flex justify-between">
    <span>Subtotal:</span>
    <span>৳{totalPrice}</span>
  </div>

  <div className="flex justify-between">
    <span>Delivery:</span>
    <span>৳{totalDelivery}</span>
  </div>
 {totalKg > 10 && (
  <div className="flex justify-between text-red-500">
    <span>Extra Delivery:</span>
    <span>৳{extraDelivery}</span>
  </div>
)}
  {discount > 0 && (
    <div className="flex justify-between text-green-600">
      <span>Discount:</span>
      <span>-৳{discount}</span>
    </div>
  )}

</div>

  <h2 className="font-bold text-xl mt-2">৳{finalTotal}</h2>

  <button
    onClick={() => {
      const selectedItems = safeCart.filter(item => selectedFarmers[item.farmerId]);
      navigate("/checkout", { state: { selectedItems, selectedFarmers  } });
    }}
    className="w-full mt-4 bg-green-700 text-white py-3 rounded-xl hover:bg-green-600 transition-colors hover: shadow-lg hover:-translate-y-1 hover:text-md hover:font-semibold"
  >
    Proceed to Checkout
  </button>

      </div>

      
      </div>
      {showLimitModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl">

      <h2 className="text-xl font-bold text-red-500 mb-2">
        Limit Reached
      </h2>

      <p className="text-gray-600 text-sm mb-4">
        You have reached the maximum order limit of 20 kg.  
        Please complete this order before placing a new one.
      </p>

      <button
        onClick={() => setShowLimitModal(false)}
        className="bg-green-700 text-white px-6 py-2 rounded-xl hover:bg-green-600 transition hover: shadow-lg"
      >
        OK
      </button>

    </div>

  </div>
)}

    </div>
  );
}
export default Cart;