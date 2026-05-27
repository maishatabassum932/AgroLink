import { useNavigate } from "react-router-dom";

import {
  Leaf,
  Truck,
  ShieldCheck,
  Users,
  ArrowLeft,
  Sprout,
  ShoppingBasket,
  BadgeCheck
} from "lucide-react";

function About() {

  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100 overflow-hidden">

      {/* TOP BAR */}
      <div className="fixed top-5 left-5 z-50">

        <button
          onClick={() => navigate("/home")}
          className="bg-white shadow-xl p-3 rounded-full hover:bg-green-700 hover:text-white transition"
        >
          <ArrowLeft size={24} />
        </button>

      </div>

      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white py-32 px-6 text-center overflow-hidden">

        {/* Floating Circles */}
        <div className="absolute w-72 h-72 bg-white/10 rounded-full -top-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-white/5 rounded-full bottom-0 right-0"></div>

        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
          AgroLink
        </h1>

        <p className="max-w-3xl mx-auto text-xl md:text-2xl text-green-100 leading-9">

          Connecting Farmers Directly With Consumers
          Through Smart Agricultural Technology.

        </p>

        <button
          onClick={() => navigate("/products")}
          className="mt-10 bg-white text-green-700 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 hover:bg-green-100 transition shadow-2xl"
        >
          Explore Marketplace
        </button>

      </div>

      {/* WHO WE ARE */}
      <div className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid md:grid-cols-2 gap-16 items-center">

          <div className="relative">

            <img
              src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6"
              alt="Farm"
              className="rounded-[40px] shadow-2xl"
            />

            <div className="absolute -bottom-6 -right-6 bg-green-700 text-white px-6 py-4 rounded-3xl shadow-xl">

              <p className="text-3xl font-bold">
                100%
              </p>

              <p className="text-sm">
                Fresh Harvest
              </p>

            </div>

          </div>

          <div>

            <h2 className="text-5xl font-extrabold text-green-700 mb-8 leading-tight">
              Who We Are
            </h2>

            <p className="text-gray-600 text-xl leading-10">

              AgroLink is a modern agricultural marketplace
              designed to empower local farmers and provide
              customers with direct access to fresh, healthy,
              and affordable farm products.

              <br /><br />

              We eliminate unnecessary middlemen and create
              a transparent ecosystem where farmers earn fairly
              and customers receive quality products quickly.

            </p>

          </div>

        </div>

      </div>

      {/* FEATURES */}
      <div className="bg-green-50 py-24 px-6">

        <h2 className="text-5xl font-extrabold text-center text-green-700 mb-20">
          Why Choose AgroLink
        </h2>

        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">

          {/* CARD */}
          <div className="bg-white p-10 rounded-[35px] shadow-xl hover:-translate-y-3 hover:shadow-2xl transition text-center">

            <Leaf
              size={60}
              className="mx-auto text-green-600 mb-6"
            />

            <h3 className="text-2xl font-bold mb-4">
              Fresh Products
            </h3>

            <p className="text-gray-600 leading-7">
              Directly harvested products delivered
              from verified farmers.
            </p>

          </div>

          {/* CARD */}
          <div className="bg-white p-10 rounded-[35px] shadow-xl hover:-translate-y-3 hover:shadow-2xl transition text-center">

            <Truck
              size={60}
              className="mx-auto text-green-600 mb-6"
            />

            <h3 className="text-2xl font-bold mb-4">
              Smart Delivery
            </h3>

            <p className="text-gray-600 leading-7">
              Efficient delivery system based on
              location and distance.
            </p>

          </div>

          {/* CARD */}
          <div className="bg-white p-10 rounded-[35px] shadow-xl hover:-translate-y-3 hover:shadow-2xl transition text-center">

            <BadgeCheck
              size={60}
              className="mx-auto text-green-600 mb-6"
            />

            <h3 className="text-2xl font-bold mb-4">
              Verified Farmers
            </h3>

            <p className="text-gray-600 leading-7">
              Products are approved and verified
              by AgroLink admins.
            </p>

          </div>

          {/* CARD */}
          <div className="bg-white p-10 rounded-[35px] shadow-xl hover:-translate-y-3 hover:shadow-2xl transition text-center">

            <ShoppingBasket
              size={60}
              className="mx-auto text-green-600 mb-6"
            />

            <h3 className="text-2xl font-bold mb-4">
              Easy Ordering
            </h3>

            <p className="text-gray-600 leading-7">
              Smooth shopping experience with
              secure checkout system.
            </p>

          </div>

        </div>

      </div>

      {/* MISSION */}
      <div className="py-24 px-6">

        <div className="max-w-5xl mx-auto text-center">

          <Sprout
            size={70}
            className="mx-auto text-green-700 mb-6"
          />

          <h2 className="text-5xl font-extrabold text-green-700 mb-8">
            Our Mission
          </h2>

          <p className="text-xl text-gray-600 leading-10">

            Our mission is to create a sustainable
            digital agriculture ecosystem where
            technology helps farmers grow financially
            while customers enjoy healthy and fresh food
            at fair prices.

          </p>

        </div>

      </div>

      {/* DEVELOPER SECTION */}
      <div className="bg-green-700 text-white py-24 px-6">

        <div className="max-w-4xl mx-auto text-center">

          <Users
            size={70}
            className="mx-auto mb-6"
          />

          <h2 className="text-5xl font-extrabold mb-8">
            Developed By
          </h2>

          <p className="text-xl leading-10 text-green-100">

            Developed as an academic project to modernize
            agricultural product management using smart
            web technologies and improve direct farmer-to-customer communication.

          </p>

        </div>

      </div>

    </div>

  );

}

export default About;