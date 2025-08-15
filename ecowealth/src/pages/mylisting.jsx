import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import User from "../components/user";
import VerticalBar from "../components/vertbar";
import Menu from "../components/menu";
import AppName from "../components/appname";




const MyListing = () => {
  const unit = ["kg", "litre", "tonne", "pcs","set","roll","bag"];
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/mylistings", {
        withCredentials: true,
      });
      setListings(response.data);
      console.log(response.data)
    } catch (err) {
      setError("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5001/mylistings/${id}`, {
        withCredentials: true,
      });
      setListings(listings.filter((item) => item.product_id !== id));
    } catch (err) {
      alert("Failed to delete product.");
    }

  };

  const handleEdit = (listing) => {
    // Find the category_id from the categories list using the category name
    const matchedCategory = categories.find(
      (cat) => cat.name === listing.category
    );
    setEditId(listing.product_id);
    setEditData({
      name: listing.name,
      price: listing.price,
      quantity: listing.quantity,
      unit: listing.unit,
      description: listing.description,
      status: listing.status,
      category_id: matchedCategory ? matchedCategory.category_id : "",
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (id) => {
    try {
      await axios.put(
        `http://localhost:5001/mylistings/${id}`,
        editData,
        { withCredentials: true }
      );
      setLoading(true)
      setEditId(null);
      fetchListings();
    } catch (err) {
      alert("Failed to update product.");
    }finally{
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

const [categories, setCategories] = useState([]);


useEffect(() => {
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/categorylist");
      setCategories(res.data);
    } catch (err) {
      setCategories([]);
    }
  };
  fetchCategories();
  fetchListings();
}, []);

  if (loading){
    return <div className="loading">
        <div className="container">
            <p className="loader-logo">♻</p>
            <p>Loading <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
        </div>
      </div>
  }
  if (error) return <div>{error}</div>;

  return (
    <div className="view-container">
      <div className="market">
        <div className="header">
            <div>
                <div className="app-name"><AppName /></div>
                <p><Menu /></p>
            </div>
            <User />
        </div>
        <div className="market-body">
          <VerticalBar />
          <div className="k">
            <h3 className="page-name">My Listings</h3>
            <div className="my-product-listings">
              <div className="dashboard-controls">
                <div className="filter-controls">
                  <label>Filter by status:</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <button
                  className="add-product-btn"
                  onClick={() => navigate('/newlisting')}
                >
                  + Add New Product
                </button>
              </div>

              {editId ? (
                <div className="edit-product-form">
                  <h3>Edit Product</h3>
                  <div className="form-group">
                    <label>Product Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Category:</label>
                    <select
                      name="category_id"
                      value={editData.category_id}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price:</label>
                    <input
                      type="number"
                      name="price"
                      value={editData.price}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      name="quantity"
                      value={editData.quantity}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit:</label>
                    <select
                      name="unit"
                      value={editData.unit}
                      onChange={handleEditChange}
                    >
                      {unit.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status:</label>
                    <select
                      name="status"
                      value={editData.status}
                      onChange={handleEditChange}
                    >
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button onClick={() => handleEditSubmit(editId)}>Save Changes</button>
                    <button onClick={() => setEditId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="sellers-list">
                  {filteredListings.map((listing) => (
                    <div key={listing.product_id} className="seller-listing-card">
                      <div className="listing-image-container">
                        <img
                          src={listing.image_url ? `http://localhost:5001${listing.image_url}` : "images/xx.png"}
                          alt={listing.name}
                          className="listing-image"
                          onError={(e) => {
                            e.target.src = "images/xx.png";
                          }}
                        />
                      </div>
                      <div className="listing-details">
                          <span className={`status-badge ${listing.status}`}>
                            {listing.status}
                          </span><br /><br />
                        <h4 className="listing-title">{listing.name}</h4>
                        <p className="listing-category">{listing.category}</p>
                        <p className="listing-price">MK{listing.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="listing-location">{listing.quantity} {listing.unit}</p>
                        <div className="listing-actions">
                          <button
                            onClick={() => handleEdit(listing)}
                            className="action-btn edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(listing.product_id)}
                            className="action-btn delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyListing;