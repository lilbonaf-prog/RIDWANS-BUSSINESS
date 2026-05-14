import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext.jsx";
import PhoneItem from "../../PhoneItem/PhoneItem";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const { phone_list, url, addToCart } = useContext(StoreContext);
  const navigate = useNavigate();

  const product = phone_list.find(p => p._id === id);

  if (!product) return <p>Product not found</p>;

  // 🔹 Related products: same category, exclude current product
  const relatedProducts = phone_list.filter(
    p => p.category === product.category && p._id !== product._id
  );

  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <img
        src={product.image}
        alt={product.name}
      />
      <p>{product.description}</p>
      <p className="price">GH₵{product.price}</p>
      <div className="product-detail-actions">
        <button onClick={() => addToCart(product._id)}>Add to Cart</button>
        <button className="back-btn" onClick={() => navigate(-1)}>Back to Products</button>
      </div>

      {/* 🔹 Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h3>Related Products</h3>
          <div className="related-products-list">
            {relatedProducts.map(item => (
              <PhoneItem
                key={item._id}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
