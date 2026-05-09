import { useParams,useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";

function ProductDetails({ addToCart, cart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
   const [addedId, setAddedId] = useState(null);
  const cartCount = cart?.reduce((sum, item) => sum + item.qty, 0) || 0;
  useEffect(() => {
  console.log("cart updated:", cart);
}, [cart]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.log(err));
  }, [id]);

  if (!product) {
    return <div className="text-center mt-10">Loading...</div>;
  }

 return (
  <div className="min-h-screen bg-green-50 flex flex-col items-center p-6">

    
   <div className="w-full max-w-5xl flex justify-between items-center mb-6">

  {/* BACK */}
  <div className="flex items-center gap-2 text-lg font-semibold">
    <button
      onClick={() => navigate(-1)}
      className="p-2 bg-white rounded-full shadow hover:bg-green-700 hover:text-white"
    >
      <ArrowLeft />
    </button>
    Back
  </div>

  {/* CART */}
  <div
    onClick={() => navigate("/cart")}
    className="relative cursor-pointer"
  >
    <ShoppingCart size={26} className="text-gray-700" />

    <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
      {cartCount}
    </span>
  </div>

</div>

    <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full grid md:grid-cols-2 gap-6 p-6">

      {/* LEFT IMAGE */}
      <div>
        <img
          src={product.image}
          alt={product.name?.en}
          className="w-full h-[350px] object-cover rounded-xl"
        />
      </div>

      {/* RIGHT DETAILS */}
      <div className="flex flex-col justify-between">

        <div>
          <h2 className="text-3xl font-bold mb-2">
            {product.name?.en}
          </h2>

          <p className=" text-xl font-semibold mb-2">
            TK {product.price} / {product.unit}
          </p>

          {/*  HARVEST INDICATOR */}
          {product.harvestDate && (
            <p className="text-sm text-green-600 mb-3">
              Harvested {Math.floor((Date.now() - new Date(product.harvestDate)) / (1000*60*60*24))} days ago
            </p>
          )}

          {/* STOCK */}
          <p className="text-sm text-gray-500 mb-3">
            Available: {product.quantity} {product.unit}
          </p>


          {/* FARMER INFO */}
          <div className="bg-green-50 p-4 rounded-xl mb-4">
            <p><b>Farmer:</b> {product.farmerId?.name}</p>
            <p><b>District:</b> {product.district}</p>
            <p><b>Area:</b> {product.area}</p>
          </div>
        </div>

        {/* QUANTITY */}
        <div>
          <div className="flex items-center gap-3 mb-4">

            {/* MINUS */}
            <button
              onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              -
            </button>

            <span className="text-lg font-semibold">{qty}</span>

            {/* PLUS WITH LIMIT */}
            <button
  onClick={() => {
    if (qty < product.quantity && qty < 20) {
      setQty(qty + 1);
    }
  }}
className="px-3 py-1 bg-gray-200 rounded"> 
  +
</button>

          </div>

          {/* ADD TO CART */}
       <button
  onClick={() => {
    const currentKg =
      cart?.reduce((sum, item) => sum + item.qty, 0) || 0;

    if (currentKg + qty > 20) {
      alert("Max 20kg allowed");
      return;
    }

    addToCart({
      ...product,
      qty: qty
    });

    setAddedId(product._id);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  }}
  disabled={addedId === product._id}
  className={`mt-4 w-full font-medium py-2 rounded-full transition 
    ${
      addedId === product._id
        ? "bg-green-500 text-white"
        : "bg-green-700 text-white hover:bg-green-800"
    }`}
>
  {addedId === product._id ? "Added " : "Add to Cart"}
</button>

        </div>

      </div>

    </div>
  </div>
);
}

export default ProductDetails;