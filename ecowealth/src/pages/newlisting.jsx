import React, { useState, useCallback } from "react";
import axios from "axios";
import User from "../components/user";
import VerticalBar from "../components/vertbar";
import MalawiLocationInput from "../components/MalawiLocationInput";
import Menu from "../components/menu";
import { useNavigate } from "react-router-dom";
import AppName from "../components/appname";




const NewListing = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    
  ]);

  const categories = ["E-Waste", "Plastic", "Paper", "Metal", "Glass", "Organic"];
  const unit = ["kg", "litre", "tonne", "pcs","set","roll","bag"];
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    category: "",
    price: "",
    location: "",
    coordinates: { lat: null, lng: null }, // Added
    quantity: "",
    unit: "kg",
    description: "",
    image: null,
    preview: ""
  });

  
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  // Add a loading state for UX
  const [loading, setLoading] = useState(false);

  const validateForm = (product) => {
    const newErrors = {};
    if (!product.product_name.trim()) {
      newErrors.product_name = "Product name is required";
    }
    if (!product.category) {
      newErrors.category = "Category is required";
    }
    if (!product.price || product.price < 50) {
      newErrors.price = "Price must be at least MK50";
    }
    if (!product.quantity || product.quantity <= 0) {
      newErrors.quantity = "Quantity must be positive";
    }
    if (!product.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!product.coordinates.lat || !product.coordinates.lng) {
      newErrors.coordinates = "Valid coordinates are required";
    }
    if (!product.image) {
      newErrors.image = "Image is required";
    }
    return newErrors;
  };

  // Helper to upload image and return image URL or image_id
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios.post("http://localhost:5001/api/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    return res.data;
  };

  
  // Helper to get category_id from name (assuming categories are predefined)
  const getCategoryId = async (categoryName) => {
    const res = await axios.get(`http://localhost:5001/api/categories?name=${encodeURIComponent(categoryName)}`, {
      withCredentials: true,
    });
    return res.data.category_id;
  };

  // Helper to insert product and return product_id (handled in /newlisting API)
  const insertProduct = async (payload) => {
    const res = await axios.post("http://localhost:5001/newlisting", payload, { withCredentials: true });
    return res.data;
  };

  const handleAddProduct = async () => {
    const validationErrors = validateForm(newProduct);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      // 1. Upload image
      const imageData = await uploadImage(newProduct.image);

      // 2. Get category_id
      const category_id = await getCategoryId(newProduct.category);

      // 3. Parse location string
      // Example: "Chilomoni Central, Blantyre, Southern Region, Malawi, Malawi"
      const locationParts = newProduct.location.split(",").map(s => s.trim());
      const city = locationParts[0] || "";
      const district = locationParts[1] || "";
      const country = locationParts[locationParts.length - 1] || "";

      // 4. Prepare payload for /newlisting
      const productPayload = {
        category_id,
        location: {
          city,
          district,
          country,
          latitude: newProduct.coordinates.lat,
          longitude: newProduct.coordinates.lng,
        },
        name: newProduct.product_name,
        price: newProduct.price,
        quantity: newProduct.quantity,
        unit: newProduct.unit,
        description: newProduct.description, // <-- now included
        status: "draft",
        image_url: imageData.image_url,
      };

      // 5. Insert product (location and image handled in backend)
      const { product_id } = await insertProduct(productPayload);

      // 6. Reset form and state
      setProducts([
        ...products,
        {
          id: product_id,
          ...newProduct,
          seller: "Current Seller",
          status: "draft",
        },
      ]);
      setNewProduct({
        product_name: "",
        category: "",
        price: "",
        location: "",
        coordinates: { lat: null, lng: null },
        quantity: "",
        unit: "kg",
        description: "",
        image: null,
        preview: ""
      });
      setErrors({});
      alert("Product added successfully!");
    } catch (error) {
      setErrors({ submit: "Failed to add product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleLocationChange = ({ location, coordinates }) => {
    setNewProduct({
      ...newProduct,
      location,
      coordinates
    });
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.match("image.*")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setNewProduct({
              ...newProduct,
              image: file,
              preview: event.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [newProduct]
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewProduct({
          ...newProduct,
          image: file,
          preview: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
          <h3 className="page-name">New Listing</h3>
          <div className="add-product-form-modern">
            <div className="form-card">
              <h2>Add New Product</h2>
              {errors.submit && <span className="error-message">{errors.submit}</span>}
              {loading && <div className="saving-message">Saving...</div>}

              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  value={newProduct.product_name}
                  onChange={handleNewProductChange}
                  placeholder="e.g. Scrap Metal, Used Bottles"
                />
                {errors.product_name && <span className="error">{errors.product_name}</span>}
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleNewProductChange}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error">{errors.category}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (MK)</label>
                  <input
                    type="number"
                    name="price"
                    min="50"
                    value={newProduct.price}
                    onChange={handleNewProductChange}
                    placeholder="Minimum 50"
                  />
                  {errors.price && <span className="error">{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <div className="quantity-input">
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={newProduct.quantity}
                      onChange={handleNewProductChange}
                      placeholder="e.g. 10"
                    />
                    <select
                      name="unit"
                      value={newProduct.unit}
                      onChange={handleNewProductChange}
                    >
                      {unit.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  {errors.quantity && <span className="error">{errors.quantity}</span>}
                </div>
              </div>

              <MalawiLocationInput
                value={{ location: newProduct.location, coordinates: newProduct.coordinates }}
                onChange={handleLocationChange}
                error={errors.location || errors.coordinates}
              />

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleNewProductChange}
                  rows={3}
                  placeholder="Describe your product, condition, etc."
                />
                {errors.description && <span className="error">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div
                  className={`dropzone-modern ${dragActive ? "active" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {newProduct.preview ? (
                    <div className="image-preview">
                      <img src={newProduct.preview} alt="Preview" />
                      <button
                        type="button"
                        className="change-img-btn"
                        onClick={() =>
                          setNewProduct({
                            ...newProduct,
                            image: null,
                            preview: ""
                          })
                        }
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>Drag & drop an image here, or</p>
                      <label className="file-input-label-modern">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </label>
                    </>
                  )}
                </div>
                {errors.image && <span className="error">{errors.image}</span>}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={loading}
                  className="publish-btn"
                >
                  {loading ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default NewListing;