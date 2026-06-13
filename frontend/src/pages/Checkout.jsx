import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { initSocket } from "../utils/socket";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import jsPDF from "jspdf";
import bkashLogo from "../assets/payments/bkash.png";
import nagadLogo from "../assets/payments/nagad.png";
import visaLogo from "../assets/payments/visa.png";
import masterLogo from "../assets/payments/mastercard.png";

function Checkout({ setCart }) {
  const navigate = useNavigate();
  const location = useLocation();

  const cart = location.state?.selectedItems || [];
  const selectedFarmers = location.state?.selectedFarmers || {};

  const user = JSON.parse(localStorage.getItem("user"));
  const userDistrict = user?.district || "";

  const savedDiscount = Number(localStorage.getItem("discount")) || 0;

  const [payment, setPayment] = useState("cod");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);



  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.farmerId]) acc[item.farmerId] = [];
    acc[item.farmerId].push(item);
    return acc;
  }, {});

  const calculateFarmerDelivery = (items) => {
    const farmerDistrict = items[0].district;
    return farmerDistrict === userDistrict ? 60 : 130;
  };

  const totalKg = cart.reduce((sum, i) => sum + i.qty, 0);

  const totalPrice = Object.entries(groupedCart).reduce((sum, [fid, items]) => {
    if (!selectedFarmers[fid]) return sum;
    return sum + items.reduce((s, i) => s + i.price * i.qty, 0);
  }, 0);

  const totalDelivery = Object.entries(groupedCart).reduce((sum, [fid, items]) => {
    if (!selectedFarmers[fid]) return sum;
    return sum + calculateFarmerDelivery(items);
  }, 0);

  const extraDelivery = totalKg > 10 ? (totalKg - 10) * 5 : 0;

  const finalTotal = totalPrice + totalDelivery + extraDelivery - savedDiscount;


  //Card Data
const [cardData, setCardData] = useState({
  number: "",
  expiry: "",
  cvv: "",
  name: ""
});
const handleCardChange = (e) => {
  setCardData({
    ...cardData,
    [e.target.name]: e.target.value
  });
};
const isCardValid =
  /^\d{16}$/.test(cardData.number) &&
  /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardData.expiry) &&
  /^\d{3}$/.test(cardData.cvv) &&
  /^[A-Za-z ]{3,}$/.test(cardData.name.trim());

  //bkash/nagad data 
  const [mobileData, setMobileData] = useState({
  phone: "",
  pin: ""
});

const [showPin, setShowPin] = useState(false);
const handleMobileChange = (e) => {
  setMobileData({
    ...mobileData,
    [e.target.name]: e.target.value
  });
};
const isMobileValid =
 /^01[3-9]\d{8}$/.test(mobileData.phone) &&
  /^\d{4,}$/.test(mobileData.pin);
  // PLACE ORDER

const canPlaceOrder =
  payment &&
  (
    (payment === "visa" || payment === "master")
      ? isCardValid
      : (payment === "bkash" || payment === "nagad")
      ? isMobileValid
      : true
  );
const removeOrderedItemsFromCart = () => {
  const orderedIds = new Set(
    cart.map(item => String(item.id || item._id))
  );

  const filterOrderedItems = items =>
    (items || []).filter(item => !orderedIds.has(String(item.id || item._id)));

  const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
  const updatedCart = filterOrderedItems(existingCart);
  localStorage.setItem("cart", JSON.stringify(updatedCart));

  if (setCart) {
    setCart(prev => filterOrderedItems(prev));
  }

  const existingSelectedFarmers =
    JSON.parse(localStorage.getItem("selectedFarmers")) || {};
  const remainingFarmerIds = new Set(updatedCart.map(item => String(item.farmerId)));
  const updatedSelectedFarmers = Object.fromEntries(
    Object.entries(existingSelectedFarmers).filter(([farmerId]) =>
      remainingFarmerIds.has(String(farmerId))
    )
  );

  localStorage.setItem("selectedFarmers", JSON.stringify(updatedSelectedFarmers));
};

const confirmOrder = async () => {

  setShowConfirmModal(false);
  const orderSaved = await saveOrder();

  if (orderSaved) {
    setShowDownloadModal(true);
  }
};


//otp 
const [showOtpModal, setShowOtpModal] = useState(false);
const [generatedOtp, setGeneratedOtp] = useState("");
const [enteredOtp, setEnteredOtp] = useState("");
const [otpTimer, setOtpTimer] = useState(60);
const [isVerifying, setIsVerifying] = useState(false); // loading

const handleOrder = () => {
  if (!canPlaceOrder) return;
  if (payment === "cod") {
    setShowConfirmModal(true);
    return; 
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  setGeneratedOtp(otp);

  console.log("OTP:", otp); // demo

  setShowOtpModal(true);
  setOtpTimer(60);
};

useEffect(() => {
  if (!showOtpModal || otpTimer === 0) return;

  const interval = setInterval(() => {
    setOtpTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [showOtpModal, otpTimer]);

useEffect(() => {
  // Initialize socket for real-time order updates
  const socket = initSocket();

  // Listen for order placement confirmations
  socket.on("order:placed", (newOrder) => {
    console.log("Order placed successfully:", newOrder);
  });

  socket.on("order:statusUpdated", (updatedOrder) => {
    console.log("Order status updated:", updatedOrder);
  });

  return () => {
    socket.off("order:placed");
    socket.off("order:statusUpdated");
  };
}, []);

const handleVerifyOtp = () => {
  if (enteredOtp !== generatedOtp) {
    alert("Invalid OTP");
    return;
  }

  // start loading
  setIsVerifying(true);

  setTimeout(async () => {
    setIsVerifying(false);
    setShowOtpModal(false);
    const orderSaved = await saveOrder();

    if (orderSaved) {
      setShowDownloadModal(true);
    }
  }, 3000); // 3 sec
};

const saveOrder = async () => {
  if (isPlacingOrder) return false;

  try {
    setIsPlacingOrder(true);

    const orderData = {
      customerId: user?._id,

      items: cart.map(item => ({

  productId: item.id,

  name: item.name,

  price: item.price,

  qty: item.qty,

  farmerId: item.farmerId

})),

      address: {
        name: user?.name,
        phone: user?.phone,
        district: user?.district,
        area: user?.area
      },

      paymentMethod: payment,

      totalPrice,
      deliveryCharge: totalDelivery + extraDelivery,
      finalTotal
    };

    const res = await fetch(
      "http://localhost:3000/api/orders/place",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(orderData)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Order failed");
    }

    console.log("Order saved to DB ", data);
    removeOrderedItemsFromCart();
    return true;
  } catch (err) {

    console.error("DB save failed ", err);
    alert("Order could not be placed. Please try again.");
    return false;

  } finally {
    setIsPlacingOrder(false);
  }
};

const downloadPDF = () => {
  const doc = new jsPDF();
  const user = JSON.parse(localStorage.getItem("user"));

  let y = 20;
  let paymentText = "";


  // TITLE
  doc.setFontSize(18);
  doc.text("AgroLink", 20, y);

  y += 10;

  doc.setFontSize(12);
  doc.text(`Name: ${user?.name}`, 20, y);
  y += 8;
  doc.text(`Phone: ${user?.phone}`, 20, y);
  y += 8;
  doc.text(`District: ${user?.district}`, 20, y);
  y += 8;
  doc.text(`Area: ${user?.area}`, 20, y);

  y += 15;

  // TABLE HEADER
  doc.setFontSize(13);
  doc.text("Product", 20, y);
  doc.text("Qty", 100, y);
  doc.text("Price", 130, y);
  doc.text("Total", 160, y);

  y += 5;
  doc.line(20, y, 190, y); // line

  y += 8;

  // PRODUCTS LOOP
  cart.forEach((item) => {
    const total = item.qty * item.price;

    doc.setFontSize(11);
    doc.text(item.name, 20, y);
    doc.text(String(item.qty), 100, y);
    doc.text(`TK ${item.price}`, 130, y);
    doc.text(`TK ${total}`, 160, y);

    y += 8;
  });

  y += 5;
  doc.line(20, y, 190, y);

  y += 10;

  // TOTAL
  doc.setFontSize(14);
  doc.text(`Final Total: TK ${finalTotal}`, 20, y);

  y += 10;

  if (payment === "cod") {
  paymentText = "Cash on Delivery";
} else {
  paymentText = "Paid";
}

  doc.setFontSize(12);
  doc.text(`Payment: ${paymentText}`, 20, 100);

  doc.save("invoice.pdf");

  // cleanup
  localStorage.removeItem("discount");

  setShowDownloadModal(false);
  navigate("/home");
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 p-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow">
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold">Checkout</h2>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

        {/* ================= LEFT SIDE ================= */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

          {/* PRODUCTS */}
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span>{item.name} × {item.qty}</span>
              <span><span className="bdt-symbol">৳</span>{item.price * item.qty}</span>
            </div>
          ))}

          <hr className="my-4"/>

          

          {/* SUMMARY */}
          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span><span className="bdt-symbol">৳</span>{totalPrice}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span><span className="bdt-symbol">৳</span>{totalDelivery}</span>
            </div>

            {extraDelivery > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Extra Delivery</span>
                <span><span className="bdt-symbol">৳</span>{extraDelivery}</span>
              </div>
            )}

            {savedDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-<span className="bdt-symbol">৳</span>{savedDiscount}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span><span className="bdt-symbol">৳</span>{finalTotal}</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="bg-white p-6 rounded-2xl shadow">

          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>

          <div className="space-y-3">

            {/* COD */}
            <div
              onClick={() => setPayment("cod")}
              className={`p-4 border rounded-xl cursor-pointer text-center text-lg font-medium
              ${payment === "cod" ? "border-green-600 bg-green-50" : ""}`}
            >
              Cash on Delivery
            </div>

            <div className="grid grid-cols-4 gap-3">

    {/* BKASH */}
    <div
      onClick={() => setPayment("bkash")}
      className={`p-2 border rounded-xl cursor-pointer flex items-center justify-center
      ${payment === "bkash" ? "border-pink-500 bg-pink-50" : ""}`}
    >
      <img src={bkashLogo} className="h-10" />
    </div>

    {/* NAGAD */}
    <div
      onClick={() => setPayment("nagad")}
      className={`p-3 border rounded-xl cursor-pointer flex items-center justify-center
      ${payment === "nagad" ? "border-orange-500 bg-orange-50" : ""}`}
    >
      <img src={nagadLogo} className="h-14" />
    </div>
    

    {/* VISA */}
    <div
      onClick={() => setPayment("visa")}
      className={`p-3 border rounded-xl cursor-pointer flex items-center justify-center
      ${payment === "visa" ? "border-blue-500 bg-blue-50" : ""}`}
    >
      <img src={visaLogo} className="h-8" />
    </div>

    {/* MASTERCARD */}
    <div
      onClick={() => setPayment("master")}
      className={`p-3 border rounded-xl cursor-pointer flex items-center justify-center
      ${payment === "master" ? "border-yellow-500 bg-yellow-50" : ""}`}
    >
      <img src={masterLogo} className="h-8" />
    </div>
    </div>
    {(payment === "bkash" || payment === "nagad") && (
  <div className="mt-4 p-4 border rounded-xl bg-gray-50 space-y-3">

    {/* PHONE */}
    <input
      name="phone"
      placeholder="Enter mobile number (11 digits)"
      value={mobileData.phone}
      onChange={handleMobileChange}
      className="w-full p-2 border rounded"
    />

    {/* PIN */}
    <div className="relative">
      <input
        name="pin"
        type={showPin ? "text" : "password"}
        placeholder="Enter PIN"
        value={mobileData.pin}
        onChange={handleMobileChange}
        className="w-full p-2 border rounded pr-10"
      />

      {/* EYE ICON */}
      <div
  onClick={() => setShowPin(!showPin)}
  className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
>
  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
</div>
    </div>

  </div>
)}
    {(payment === "visa" || payment === "master") && (
  <div className="mt-4 p-4 border rounded-xl bg-gray-50 space-y-3">

    <input
      name="number"
      placeholder="Card Number"
      value={cardData.number}
      onChange={handleCardChange}
      className="w-full p-2 border rounded"
    />

    <div className="flex gap-2">
      <input
        name="expiry"
        placeholder="MM/YY"
        value={cardData.expiry}
        onChange={handleCardChange}
        className="w-1/2 p-2 border rounded"
      />

      <input
        name="cvv"
        placeholder="CVV"
        value={cardData.cvv}
        onChange={handleCardChange}
        className="w-1/2 p-2 border rounded"
      />
    </div>

    <input
      name="name"
      placeholder="Card Holder Name"
      value={cardData.name}
      onChange={handleCardChange}
      className="w-full p-2 border rounded"
    />

  </div>
)}

          </div>

         <button
  onClick={handleOrder}
  disabled={!canPlaceOrder || isPlacingOrder}
  className={`w-full mt-6 py-3 rounded-xl text-white text-lg 
  ${canPlaceOrder && !isPlacingOrder ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
>
  {isPlacingOrder ? "Placing Order..." : "Place Order"}
</button>
          {showConfirmModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-2xl shadow-xl w-[350px] text-center">

      <h2 className="text-xl font-bold mb-2">
        Confirm Order
      </h2>

      <p className="text-gray-600 mb-4">
        Do you want to confirm this order?
      </p>

      <div className="flex justify-center gap-4">

        {/* CANCEL */}
        <button
          onClick={() => setShowConfirmModal(false)}
          className="px-4 py-2 bg-gray-300 rounded-lg cursor-pointer hover:bg-green-700 hover:text-white "
        >
          Cancel
        </button>

        {/* CONFIRM */}
        <button
          onClick={confirmOrder}
          disabled={isPlacingOrder}
          className="px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-700 hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPlacingOrder ? "Placing..." : "Confirm"}
        </button>
      </div>

    </div>

  </div>
)}
{showDownloadModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-2xl shadow-xl w-[360px] text-center">

      <h2 className="text-xl font-bold mb-2">
        Order Confirmed
      </h2>

      <p className="text-gray-600 mb-4">
        Your order has been placed successfully.  
      </p>

      <button
        onClick={downloadPDF}
        className="w-2/4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
      >
        Download PDF
      </button>

    </div>

  </div>
)}
        </div>

      </div>

      {showOtpModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-xl w-[350px] text-center">

      <h2 className="text-xl font-semibold mb-2">Verify Payment</h2>

      <p className="text-gray-700 mb-3">
        Enter OTP sent to your phone
      </p>

      {/* DEMO OTP */}
      <p className="text-sm text-gray-300 mb-2">
        Demo OTP: <b>{generatedOtp}</b>
      </p>

      <input
        value={enteredOtp}
        onChange={(e) => setEnteredOtp(e.target.value)}
        className="w-full p-2 border rounded mb-3 text-center text-lg"
        placeholder="Enter OTP"
      />

      {/* TIMER */}
      <p className="text-sm text-gray-500 mb-3">
        Time left: {otpTimer}s
      </p>

      {/* VERIFY BUTTON */}
      <button
        onClick={handleVerifyOtp}
        disabled={!enteredOtp}
        className="w-full bg-green-600 text-white py-2 rounded cursor-pointer hover:bg-green-700 hover:scale-y-1"
      >
        Verify
      </button>

      {/* LOADING */}
      {isVerifying && (
        <div className="mt-5 text-blue-600 animate-pulse">
          Processing Payment...
        </div>
      )}

    </div>
  </div>
)}

    </div>
  );
}

export default Checkout;
