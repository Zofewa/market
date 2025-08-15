import { useNavigate } from "react-router-dom";
import LocationIcon from '../assets/marker.svg';

export default function ProductCard({ product }) {
    const navigate = useNavigate();

    return (
        <div className="product-card-modern" onClick={() => navigate(`/itemDetails/${product.id}`)}>
            <div className="product-image-wrapper">
                <img
                    className="product-image"
                    src={product.image_url ? `http://localhost:5001${product.image_url}` : "/placeholder.png"}
                    alt="product"
                />
                <span className="product-category-badge">{product.category}</span>
            </div>
            <div className="product-info">
                <h2 className="product-name">{product.product_name}</h2>
                <p className="seller">By: <b>{product.seller}</b></p>
                <div className="product-meta">
                    <span className="product-price">
                        MK{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span><br />
                    <h5 className="location">
                        <img src={LocationIcon} alt="location" width="14" height="14" />
                        {product.city}, {product.district}
                    </h5>
                </div>
                <button
                    className="see-details-modern"
                    onClick={e => {
                        e.stopPropagation();
                        navigate(`/itemDetails/${product.id}`);
                    }}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}