import React, { useContext, useState } from 'react'
import './Navbar.css'
import { Button, Container, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { House, Person, Envelope, Heart, Cart, BagCheck, Briefcase } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/storecontext';
import { assets } from '../../assets/assets'

const Navigationbar = ({ setShowLogin, onSearch }) => {
  const { token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      // ✅ Instead of navigating, call parent filter function
      if (typeof onSearch === 'function') {
        onSearch(searchQuery);
      }
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          <Briefcase size={22} className="text-primary" /> RIDWAN'S <span style={{color: "red"}}>BUSINESS</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
            
            {/* Home */}
            <Nav.Link as={Link} to="/">
              <House className="me-1" /> Home
            </Nav.Link>

            {/* Contact */}
            <Nav.Link as={Link} to="/contact">
              <Envelope className="me-1" /> Contact Us
            </Nav.Link>

            {/* Dropdown */}
            <NavDropdown title="Links" id="navbarScrollingDropdown">
              <NavDropdown.Item as={Link} to="/cart">
                <Cart className="me-1" /> Cart
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/wishlist">
                <Heart className="me-1" /> Wishlist
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/myorders" >
                <BagCheck className="me-1" /> My Orders
              </NavDropdown.Item>
            </NavDropdown>

            {/* Sign In */}
            {!token ? (
              <Nav.Link onClick={() => setShowLogin(true)}>
                <Person className="me-1" /> Sign In
              </Nav.Link>
            ) : (
              <div className='navbar-profile'>
                <img src={assets.profile_icon} alt="" />
                <ul className="nav-profile-dropdown">
                  <li onClick={() => navigate('/myorders')}>
                    <img src={assets.bag_icon} alt="" /><p>Orders</p>
                  </li>
                  <hr />
                  <li onClick={logout}>
                    <img src={assets.logout_icon} alt="" /><p>Logout</p>
                  </li>
                </ul>
              </div>
            )}
          </Nav>

          {/* ✅ Search Form */}
          <Form className="d-flex" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Search products..."
              className="me-2"
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (typeof onSearch === 'function') {
                  onSearch(e.target.value); // ✅ live filtering
                }
              }}
            />
            <Button type="submit" variant="outline-success" className="rounded-pill">
              Search
            </Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigationbar
