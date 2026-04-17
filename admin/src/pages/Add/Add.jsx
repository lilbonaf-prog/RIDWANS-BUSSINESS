import React, { useState, useEffect } from 'react';
import "./Add.css";
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const Add = ({url}) => {

  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!data.name || !data.price || !data.description || !image) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', Number(data.price));
      formData.append('category', data.category);
      formData.append('image', image);

      const response = await axios.post(`${url}/api/product/add`, formData);

      if (response.data.success) {
        toast.success("✅ Product added successfully!");
        setData({
          name: "",
          description: "",
          price: "",
          category: ""
        });
        setImage(false);
      } else {
        toast.error("❌ Failed to add product. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      toast.error("⚠️ Something went wrong. Please check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  return (
    <div className='add'>
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
          </label>
          <input 
            onChange={(e) => setImage(e.target.files[0])} 
            type="file" 
            id="image" 
            hidden 
            required 
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input 
            onChange={onChangeHandler} 
            value={data.name} 
            type="text" 
            name='name' 
            placeholder='Type here' 
            required 
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea 
            onChange={onChangeHandler} 
            value={data.description} 
            name="description" 
            rows='6' 
            placeholder='Write content here' 
            required 
          ></textarea>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select 
              onChange={onChangeHandler} 
              name="category" 
              value={data.category} 
              required
            >
              <option value="" disabled>Select category</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Tecno">Tecno</option>
              <option value="Infinix">Infinix</option>
              <option value="Itel">Itel</option>
              <option value="Redmi">Redmi</option>
              <option value="BT Speaker">BT Speaker</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Product price</p>
            <input 
              onChange={onChangeHandler} 
              value={data.price} 
              type="number" 
              name='price' 
              placeholder='GH₵20' 
              required 
            />
          </div>
        </div>

        <button type='submit' className='add-btn' disabled={loading}>
          {loading ? "Adding..." : "ADD"}
        </button>
      </form>
    </div>
  );
};

export default Add;