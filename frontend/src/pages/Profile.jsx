import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Eye, EyeOff, CheckCircle } from "lucide-react";

function Profile() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [user, setUser] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    district: "",
    area: ""
  });

  // LOAD USER
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      console.log("Invalid user");
    }
  }, []);

  // UPDATE PROFILE
  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          password: user.password,
          district: user.district,
          area: user.area
        })
      });

      const data = await res.json();

      if (data) {
        setShowModal(true);
        localStorage.setItem("user", JSON.stringify(data));
      }

    } catch (err) {
      console.log(err);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">

          {/* ICON INSTEAD OF IMAGE */}
          <div className="w-24 h-24 bg-green-200 rounded-full flex items-center justify-center">
            <User size={40} className="text-green-700" />
          </div>

          <h2 className="text-2xl font-bold mt-3">
            {user.name || "Your Profile"}
          </h2>

          <p className="text-gray-500 text-sm">
            Manage your account information
          </p>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full border rounded-lg p-2 bg-gray-100"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-600">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="w-full border rounded-lg p-2 pr-10 focus:ring-2 focus:ring-green-400 outline-none"
              />

              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          {/* DISTRICT */}
          <div>
            <label className="text-sm text-gray-600">District</label>
            <input
              value={user.district}
              onChange={(e) => setUser({ ...user, district: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* AREA */}
          <div>
            <label className="text-sm text-gray-600">Area</label>
            <input
              value={user.area}
              onChange={(e) => setUser({ ...user, area: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-6">

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-gray-200 rounded-full hover:bg-green-700 hover:text-white transition"
          >
            ← Back
          </button>

          <button
            onClick={handleUpdate}
            className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
          >
            Update Profile
          </button>

        </div>

      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="bg-white p-6 rounded-xl text-center w-80">

            <CheckCircle size={50} className="text-green-600 mx-auto mb-3" />

            <h2 className="text-lg font-bold">Update Successful</h2>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              OK
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Profile;