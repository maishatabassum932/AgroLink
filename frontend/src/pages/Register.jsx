import { useState } from "react";
import bg from "../assets/reg-bg.png";
import { Link } from "react-router-dom";
import { Tractor, ShoppingBasket, CheckCircle } from "lucide-react";

const areaData = {
 Dhaka: ["Uttara", "Mirpur", "Dhanmondi"],
  Gazipur: ["Tongi", "Sreepur", "Kaliakair"],
  Comilla: ["Daudkandi", "Debidwar", "Laksam"],
  Jamalpur: ["Jamalpur Sadar", "Islampur", "Sarishabari"]
};

function Register() {
  const [role, setRole] = useState("farmer");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
   name: "",
  email: "",
  phone: "",
  password: "",
  nidNumber: "",
  district: "",
  area: "",
  nidImage: null
  });

  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "district") {
    setForm({
      ...form,
      district: value,
      area: ""
    });
  } else {
    setForm({
      ...form,
      [name]: value
    });
  }
};
const handleSubmit = async () => {

  setError("");

  // NID VALIDATION
  if (
    form.nidNumber.length !== 10 &&
    form.nidNumber.length !== 13 &&
    form.nidNumber.length !== 17
  ) {
    setError("Invalid NID number");
    return;
  }

  try {

  const formData = new FormData();

  formData.append("name", form.name);
  formData.append("email", form.email);
  formData.append("phone", form.phone);
  formData.append("password", form.password);
  formData.append("nidNumber", form.nidNumber);
  formData.append("district", form.district);
  formData.append("area", form.area);
  formData.append("role", role);

  if (form.nidImage) {

    formData.append(
      "nidImage",
      form.nidImage
    );

  }

  const res = await fetch(
    "http://localhost:3000/api/users/register",
    {
      method: "POST",
      body: formData
    }
  );
    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Registration failed");
      return;
    }

    if (data.message === "User registered successfully") {
      setShowModal(true);
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
        <div className="bg-white/85 backdrop-blur-xl p-8 rounded-3xl max-w-[480px] w-full shadow-2xl border border-white/40">

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-2 rounded-xl">

            <button
              onClick={() => setRole("farmer")}
              className={`flex-1 flex flex-col items-center py-3 rounded-lg ${
                role === "farmer"
                  ? "bg-green-200 text-green-700"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Tractor size={40} />
              Farmer
            </button>

            <button
              onClick={() => setRole("customer")}
              className={`flex-1 flex flex-col items-center py-3 rounded-lg ${
                role === "customer"
                  ? "bg-green-200 text-green-700"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ShoppingBasket size={40} />
              Customer
            </button>

          </div>

          <div className="text-center mb-6">

  <h2 className="text-3xl font-bold">
    Create Account
  </h2>

</div>

          {/* Form */}
          <div className="space-y-4">

  {/* NAME + EMAIL */}
  <div className="grid grid-cols-2 gap-3">

    <input
      name="name"
      value={form.name}
      onChange={handleChange}
      className="p-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Full Name"
    />

    <input
      name="email"
      value={form.email}
      onChange={handleChange}
      className="p-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Email"
    />

  </div>

  {/* PHONE + PASSWORD */}
  <div className="grid grid-cols-2 gap-3">

    <input
      name="phone"
      value={form.phone}
      onChange={handleChange}
      className="p-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Phone"
    />

    <input
      name="password"
      value={form.password}
      onChange={handleChange}
      type="password"
      className="p-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Password"
    />

  </div>

  {/* NID */}
  <input
    name="nidNumber"
    value={form.nidNumber}
    onChange={handleChange}
    className="w-full p-2 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
    placeholder="NID Number"
  />

  {/* FILE */}
  <div className="border-2 border-dashed border-green-300 rounded-2xl p-2 bg-green-50">

    <p className="text-sm text-gray-600 mb-2 font-medium">
      Upload NID Image / PDF
    </p>

    <input
      type="file"
      accept="image/*,.pdf"
      onChange={(e) =>
        setForm({
          ...form,
          nidImage: e.target.files[0]
        })
      }
      className="w-full"
    />

  </div>

  {/* DISTRICT + AREA */}
  <div className="grid grid-cols-2 gap-3">

    <select
      name="district"
      value={form.district}
      onChange={handleChange}
      className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="">Select District</option>

      {Object.keys(areaData).map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}

    </select>

    <select
      name="area"
      value={form.area}
      onChange={handleChange}
      className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
      disabled={!form.district}
    >
      <option value="">Select Area</option>

      {form.district &&
        areaData[form.district].map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}

    </select>

  </div>

</div>
          {error && (
  <p className="text-red-500 text-sm mt-2 text-center">
    {error}
  </p>
)}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-800 text-white py-3 rounded-2xl font-semibold shadow-lg hover:scale-[1.02] transition duration-300"
          >
            Register
          </button>

          {/* Login */}
          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-green-700 font-medium">
              Login
            </Link>
          </p>

        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="bg-white p-6 rounded-xl text-center w-[350px]">
            <CheckCircle className="mx-auto text-green-600 mb-2" size={50} />

            <h2 className="text-lg font-bold">Success</h2>
            <p className="text-gray-600 mt-3">

  Your account has been registered successfully. Please wait 10 minutes for admin verification.

</p>

            <button
              onClick={() => {
                setShowModal(false);

                // RESET
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  nidNumber: "",
                  district: "",
                  area: ""
                });
              }}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default Register;