import React, { useState } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreProducts from '../../components/ExploreProducts/ExploreProducts';
import PhoneDisplay from '../../components/PhoneDisplay/PhoneDisplay';
import AppDownload from '../../components/AppDownload/AppDownload';
import HeroCarousel from '../../components/Header/Carousel';

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <div>
      <Header />
      <br />
      <div className="hero-info">
        <p>
          Secure payments, fast delivery, and top‑quality electronics — shop with confidence.
        </p>
      </div>

      <HeroCarousel />
      {/* Pass the correct prop name */}
      <br />
      <ExploreProducts category={category} setCategory={setCategory} />
      <PhoneDisplay category={category} />
      <AppDownload />
    </div>
  );
};

export default Home;