import React, { useContext, useState } from 'react'
import './Navbar.css'
import { Button, Container, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { House, Person, Heart, Cart, BagCheck, InfoCircle, Envelope } from 'react-bootstrap-icons'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
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
    if (searchQuery.trim() !== "" && typeof onSearch === 'function') {
      onSearch(searchQuery);
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
           RIDWAN'S <span style={{color: "red"}}>BUSINESS</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
            
            {/* Home */}
            <Nav.Link as={Link} to="/">
              <House className="me-1" /> Home
            </Nav.Link>

            {/* Cart - always visible */}
            <Nav.Link as={Link} to="/cart">
              <Cart className="me-1" /> Cart
            </Nav.Link>

            {/* My Orders - always visible */}
            <Nav.Link as={Link} to="/myorders">
              <BagCheck className="me-1" /> My Orders
            </Nav.Link>

            {/* Dropdown for less urgent links */}
            <NavDropdown title="More" id="navbarScrollingDropdown">
              <NavDropdown.Item as={Link} to="/wishlist">
                <Heart className="me-1" /> Wishlist
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/about">
                <InfoCircle className="me-1" /> About Us
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contact">
                <Envelope className="me-1" /> Contact Us
              </NavDropdown.Item>
            </NavDropdown>

            {/* Sign In / Profile */}
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

          {/* Search Form */}
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
                  onSearch(e.target.value); // live filtering
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
