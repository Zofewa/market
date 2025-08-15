import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LocationIcon from '..assets/marker.svg';
import Seller from '../assets/user.svg';

const ItemDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch all products and find the one with the matching id
        const res = await axios.get("http://localhost:5001/api/products");
        const found = res.data.find(item => item.id === parseInt(id));
        console.log(res.data)
        setProduct(found);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Start or get conversation and send "Hi" if new
  const handleTalkToSeller = async () => {
    if (!product || !product.seller_id) {
      alert("Seller information not available.");
      return;
    }
    try {
      // Start or get chat thread with seller
      const threadRes = await axios.post(
        "http://localhost:5001/api/chat-threads",
        { recipient_id: product.seller_id },
        { withCredentials: true }
      );
      const threadId = threadRes.data.thread_id;
      console.log(threadRes.data.thread_id)

      // Check if there are messages in this thread
      const messagesRes = await axios.get(
        `http://localhost:5001/api/messages/${threadId}`,
        { withCredentials: true }
      );
      if (!messagesRes.data || messagesRes.data.length === 0) {
        // Send "Hi" to start the conversation
        await axios.post(
          `http://localhost:5001/api/messages/${threadId}`,
          { text: `Is this available? ${product.product_name}` },
          { withCredentials: true }
        );
      }

      await axios.post(
          `http://localhost:5001/api/messages/${threadId}`,
          { text: `Is this available? ${product.product_name}` },
          { withCredentials: true }
        );
      // Navigate to chat page
      navigate(`/chat?thread=${threadId}`);
        
    } catch (err) {
      console.log()
      if(err.response.data.error === "Unauthorized"){
        navigate("/signin");
      }
      else{
        alert("Could not start conversation.");
      }
    }
  };

  if (loading) {
    return (
      <div>
        <p className="back-btn">
          <button onClick={() => navigate(-1)}>&larr; Go Back</button>
        </p>
        <br />
        <div>Loading.........</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <p className="back-btn">
          <button onClick={() => navigate(-1)}>&larr; Go Back</button>
        </p>
        <br />
        <div>Product not found.</div>
      </div>
    );
  }

  const discountedPrice = (Number(product.price) + Number(product.price) * 0.2).toLocaleString('en-US',{minimumFractionDigits: 2, maximumFractionDigits: 2});

  return (
    <div className="product-container">
      <div className="back-link">
        <Link to={-1}>&larr; Go Back</Link>
      </div>
      <br />
      <div className="product-details">
        <div className="product-image">
          <img
            src={product.image_url?`http://localhost:5001${product.image_url}`: null}
            alt={product.product_name}
          />
        </div>

        <div className="product-info">
          <h4 className="category">{product.category}</h4>
          <h2 className="name">{product.product_name}</h2>

          <div className="seller">
            <strong>Seller</strong>
            <p>
              <img src={Seller} alt="seller icon" width="15" height="15" /> {product.seller}
            </p>
          </div>

          <div className="description">
            <h4>Description</h4>
            <p>{product.description}</p>
          </div>
          
          <div className="quantity">
            <h4>
              Quantity:
            </h4>
            <p>{product.quantity}({product.unit})</p>
          </div>

          <div className="price">
            <h3>MK{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="old-price">
              <strike>MK{discountedPrice}</strike>
            </span>
          </div>

          <p className="location">
            <img src={LocationIcon} alt="location icon" width="15" height="15" /> {product.city},
            {product.district}
          </p>
          <button className="contact-button" onClick={handleTalkToSeller}>Talk to Seller</button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;