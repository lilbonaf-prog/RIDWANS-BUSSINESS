

import React, { useState } from "react";
import Navigationbar from "../components/navbar/Navbar";
import PhoneItem from "../PhoneItem/PhoneItem.jsx";

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Example product list (replace with your actual products)
  const products = [
    { id: 1, name: "iPhone 14", price: 1200, description: "Latest Apple smartphone", image: "iphone14.jpg" },
    { id: 2, name: "Samsung Galaxy S23", price: 1000, description: "Flagship Samsung phone", image: "galaxyS23.jpg" },
    { id: 3, name: "Infinix Note 12", price: 300, description: "Affordable smartphone", image: "infinix12.jpg" },
    { id: 4, name: "Tecno Spark 9", price: 200, description: "Budget-friendly phone", image: "tecno9.jpg" },
  ];

  // ✅ Filter products by search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Pass search handler to Navbar */}
      <Navigationbar onSearch={setSearchTerm} />

      <div className="products">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <PhoneItem
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              description={product.description}
              image={product.image}
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
