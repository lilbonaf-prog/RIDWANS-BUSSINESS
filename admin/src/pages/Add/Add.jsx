import React, { useState } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Add = ({ url }) => {

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: ""
  });


  // Input change
  const onChangeHandler = (event) => {
    const { name, value } = event.target;

    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  // Image select
  const imageHandler = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImage(file);
  };


  // Submit
  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (
      !data.name ||
      !data.description ||
      !data.price ||
      !data.category ||
      !image
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("category", data.category);

      // IMPORTANT
      formData.append("image", image);

      console.log("Sending product...");

      const response = await axios.post(
        `${url}/api/product/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("SERVER RESPONSE:", response.data);

      if (response.data.success) {

        toast.success("Product added successfully");

        // Reset form
        setData({
          name: "",
          description: "",
          price: "",
          category: ""
        });

        setImage(null);

      } else {

        toast.error(
          response.data.message || "Upload failed"
        );
      }

    } catch (error) {

      console.log(
        "UPLOAD ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        "Upload failed"
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="add">

      <form
        className="flex-col"
        onSubmit={onSubmitHandler}
      >

        {/* Image */}
        <div className="add-img-upload flex-col">

          <p>Upload Image</p>

          <label htmlFor="image">

            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : assets.upload_area
              }
              alt="upload"
            />

          </label>

          <input
            type="file"
            id="image"
            hidden
            accept="image/*"
            onChange={imageHandler}
          />

        </div>


        {/* Name */}
        <div className="add-product-name flex-col">

          <p>Product name</p>

          <input
            type="text"
            name="name"
            placeholder="Type here"
            value={data.name}
            onChange={onChangeHandler}
          />

        </div>


        {/* Description */}
        <div className="add-product-description flex-col">

          <p>Product description</p>

          <textarea
            rows="6"
            name="description"
            placeholder="Write content here"
            value={data.description}
            onChange={onChangeHandler}
          />

        </div>


        {/* Category + Price */}
        <div className="add-category-price">

          <div className="add-category flex-col">

            <p>Product category</p>

            <select
              name="category"
              value={data.category}
              onChange={onChangeHandler}
            >
              <option value="">Select category</option>

              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Tecno">Tecno</option>
              <option value="Infinix">Infinix</option>
              <option value="Itel">Itel</option>
              <option value="Redmi">Redmi</option>
              <option value="Accessories">Accessories</option>

            </select>

          </div>


          <div className="add-price flex-col">

            <p>Product price</p>

            <input
              type="number"
              name="price"
              placeholder="GH₵20"
              value={data.price}
              onChange={onChangeHandler}
            />

          </div>

        </div>


        {/* Submit */}
        <button
          type="submit"
          className="add-btn"
          disabled={loading}
        >
          {loading ? "Adding..." : "ADD PRODUCT"}
        </button>

      </form>

    </div>
  );
};

export default Add;