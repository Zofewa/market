import React, { useEffect, useState } from "react";
import ProductCard from "./productcard";
import axios from "axios";

export default function Items() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);  

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/products`, {withCredentials: true});
                // Ensure products is always an array
                setProducts(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <>
            <div className="product-list">
                {loading && <div>Loading...</div>}
                {(products || []).map((product) => (
                    <ProductCard key={product.id || product.product_id} product={product} />
                ))}
            </div>
        </>
    );
}