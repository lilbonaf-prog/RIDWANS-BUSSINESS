import React, { useState } from 'react';
import Navigationbar from "./components/navbar/Navbar";
import { Route, Routes } from 'react-router-dom';

// Pages
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess';
// import Contact from './pages/Contact/Contact';
// import Wishlist from './pages/Wishlist/Wishlist';

// Components
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import MyOrders from './pages/MyOrders/MyOrders';
import PhoneDisplay from './components/PhoneDisplay/PhoneDisplay';
// import Verify from './pages/Verify/Verify';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* Popup controlled only by state */}
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

      <div className='app'>
        <Navigationbar setShowLogin={setShowLogin} />

        <Routes>
          {/* Main Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path='/myorders' element={<MyOrders/>} />
          <Route path="/products" element={<PhoneDisplay category="All" />} />
          


          {/* Extra Routes for Navbar
          <Route path='/contact' element={<Contact />} />
          <Route path='/wishlist' element={<Wishlist />} />
          */}
        </Routes>
      </div>

      <Footer />
    </>
  );
};

export default App;