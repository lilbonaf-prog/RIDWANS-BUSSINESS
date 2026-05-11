import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/product/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("❌ Failed to fetch products.");
      }
    } catch (error) {
      console.error("Error fetching product list:", error);
      toast.error("⚠️ Server error while fetching products.");
    }
  };

  const removeProduct = async (productId) => {
    try {
      const response = await axios.post(`${url}/api/product/remove`, { id: productId });
      if (response.data.success) {
        toast.success(response.data.message || "✅ Product removed successfully!");
        setList(list.filter((p) => p._id !== productId)); // update state instantly
      } else {
        toast.error("❌ Failed to remove product.");
      }
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("⚠️ Server error while removing product.");
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormData(item);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const saveUpdate = async () => {
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      const response = await axios.put(`${url}/api/product/update/${editingId}`, form);

      if (response.data.success) {
        toast.success("✅ Product updated successfully!");
        // update local state instantly
        setList(list.map((p) => p._id === editingId ? response.data.data : p));
        setEditingId(null);
      } else {
        toast.error("❌ Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("⚠️ Server error while updating product.");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='list add flex-col'>
      <p>All Products List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => (
          <div key={index} className='list-table-format'>
            {editingId === item._id ? (
              <>
                <input name="name" value={formData.name} onChange={handleChange} />
                <input name="category" value={formData.category} onChange={handleChange} />
                <input name="price" type="number" value={formData.price} onChange={handleChange} />
                <input name="image" type="file" onChange={handleChange} />
                <div className="actions">
                  <button onClick={saveUpdate}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>GH₵{item.price}</p>
                <div className="actions">
                  <button onClick={() => startEdit(item)}>✏️ Edit</button>
                  <button onClick={() => removeProduct(item._id)}>❌ Remove</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
