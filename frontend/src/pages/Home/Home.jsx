import React, { useState } from "react";
import "./Home.css";

// Components
import Header from "../../components/Header/Header";
import ExploreProducts from "../../components/ExploreProducts/ExploreProducts";
import PhoneDisplay from "../../components/PhoneDisplay/PhoneDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import HeroCarousel from "../../components/Header/Carousel";

// Icons
import {
  ShieldCheck,
  Truck,
  Headset,
} from "react-bootstrap-icons";

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <main className="home-page">

      {/* HERO BANNER */}
      <Header />

      {/* CUSTOMER TRUST SECTION */}
      <section className="home-trust-section">

        <div className="home-trust-item">
          <div className="home-trust-icon">
            <ShieldCheck size={26} />
          </div>

          <div>
            <h4>Secure Shopping</h4>
            <p>Shop with confidence</p>
          </div>
        </div>

        <div className="home-trust-item">
          <div className="home-trust-icon">
            <Truck size={26} />
          </div>

          <div>
            <h4>Fast Delivery</h4>
            <p>Convenient delivery service</p>
          </div>
        </div>

        <div className="home-trust-item">
          <div className="home-trust-icon">
            <Headset size={26} />
          </div>

          <div>
            <h4>Customer Support</h4>
            <p>Here to assist you</p>
          </div>
        </div>

      </section>

      {/* PROMOTIONAL CAROUSEL */}
      <section className="home-promotion">
        <HeroCarousel />
      </section>

      {/* SHOPPING SECTION */}
      <section
        className="home-shopping-section"
        id="shop-products"
      >

        <div className="home-section-heading">

          <span className="home-section-label">
            DISCOVER OUR COLLECTION
          </span>

          <h2>Explore Our Products</h2>

          <p>
            Discover smartphones, laptops, accessories,
            and more at Ridwan Business.
          </p>

        </div>

        {/* PRODUCT CATEGORIES */}
        <ExploreProducts
          category={category}
          setCategory={setCategory}
        />

        {/* PRODUCT LIST */}
        <PhoneDisplay category={category} />

      </section>

      {/* APP PROMOTION */}
      <section className="home-app-section">
        <AppDownload />
      </section>

    </main>
  );
};

export default Home;