import { useState } from "react";
import bg from "../assets/reg-bg.png";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: ""
  });
  
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
  setError("");

  try {
    const res = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    const data = await res.json(); // 

    console.log("LOGIN USER:", data.user);

    if (data.user) {
  localStorage.setItem("user", JSON.stringify(data.user));
setShowModal(true);

     } else {
      setError(data.message);
    }

  } catch (err) {
    console.log(err);
    setError("Server error");
  }
};
  return (
    <div className="relative min-h-screen w-full">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      ></div>

      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/80 p-6 rounded-2xl w-[450px] shadow-2xl">

          <h2 className="text-2xl font-semibold text-center mb-4">
            Log into AgroLink
          </h2>

          {/* Inputs */}
          <div className="space-y-3">

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Email (optional)"
            />

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Phone"
            />

            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              type="password"
              placeholder="Password"
              required
            />

          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full mt-4 bg-green-700 text-white py-2 rounded hover:bg-green-600"
          >
            Login
          </button>

          {/* Register link */}
          <p className="text-center mt-3 text-md">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-green-700 hover:text-green-500 font-medium hover:underline"
            >
              Register
            </Link>
          </p>

        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="bg-white p-6 rounded-xl shadow-2xl w-[350px] text-center">

            {/* Icon */}
            <div className="flex justify-center mb-3 text-green-600">
              <CheckCircle size={50} />
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Login Successful
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-4">
              Welcome to AgroLink
            </p>

            {/* Button */}
            <button
              onClick={() => {
                setShowModal(false);
                const user = JSON.parse(localStorage.getItem("user"));
                console.log(user);
                if (user?.role?.toLowerCase() === "admin") {
    window.location.href = "/admin";
  } 
  else if (user?.role?.toLowerCase() === "farmer") {
    window.location.href = "/farmer";
  } 
  else {
    window.location.href = "/home";
  }
              }}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Continue
            </button>

          </div>

        </div>
      )}
    </div>
  );
}

export default Login;