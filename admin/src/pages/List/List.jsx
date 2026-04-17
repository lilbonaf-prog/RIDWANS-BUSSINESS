import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = ({url}) => {
  const [list, setList] = useState([]);

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
        fetchList(); // refresh list after removal
      } else {
        toast.error("❌ Failed to remove product.");
      }
    } catch (error) {
      console.error("Error removing product:", error);
      toast.error("⚠️ Server error while removing product.");
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
            <img src={`${url}/images/${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>GH₵{item.price}</p>
            <p onClick={() => removeProduct(item._id)} className='cursor'>❌</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;