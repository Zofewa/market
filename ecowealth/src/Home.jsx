import { useState, useEffect } from 'react';
import HeroSection from './components/hero-section';
import NavBar from "./components/navbar";
import FilterBtns from './components/filterbtns';
import ProductCard from './components/productcard';
import axios from 'axios';
import StatsCounters from './components/statscounters';
import Testimonials from './components/testimonials';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const numberOfItemsPerPage = 25;
    const [currentPage, setCurrentPage] = useState(1);

    const handleData = (data) => setFilter(data);

    const startIndex = (currentPage - 1) * numberOfItemsPerPage;
    const endIndex = startIndex + numberOfItemsPerPage;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/products`, { withCredentials: true });
                setProducts(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter and paginate
    const filteredProducts = products
        .filter(product => filter === "all" ? true : product.category.toLowerCase() === filter)
        .slice(startIndex, endIndex);

    const handleNext = () => {
        if (endIndex < products.length) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="container">
                    <p className="loader-logo">♻</p>
                    <p>Loading <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavBar />
            <HeroSection />

            {/* Animated stats below hero */}
            <div className="stats-section">
                <StatsCounters stats={[
                    { label: "Items Recycled", value: 1240 },
                    { label: "CO₂ Saved (kg)", value: 3200 },
                    { label: "Active Users", value: 87 },
                ]} />
            </div>

            <div className="products-display">
                <h2 className='subheading'>Featured Items</h2>
                <div className="find sticky-filter">
                    <FilterBtns result={handleData} />
                </div>
                <div className="marketlist">
                        <div className="product-list">
                            {filteredProducts.length === 0 && (
                                <div className="empty-state">
                                    <p>No products found for this category.</p>
                                </div>
                            )}
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id || product.product_id} product={product} />
                            ))}
                        </div>
                        <div className="pag-nav">
                            <p>Page <b>{currentPage}</b> of <b>{Math.ceil(products.length / numberOfItemsPerPage)}</b></p>
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}>
                                Prev
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={endIndex >= products.length}>
                                Next
                            </button>
                        </div>
                </div>
            </div>

            {/* Testimonials at the bottom */}
            <Testimonials testimonials={[
                { name: "Jane", text: "I sold my old laptop and helped the planet!" },
                { name: "Ali", text: "Great platform for eco-friendly trading." },
            ]} />
        </>
    );
}