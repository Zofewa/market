import { useState, useEffect } from "react";
import VerticalBar from "../components/vertbar";
import User from "../components/user";
import Menu from "../components/menu";
import FilterBtns from "../components/filterbtns";
import ProductCard from "../components/productcard";
import axios from "axios";
import AppName from "../components/appname";


const MarketPlace = () =>{
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const numberOfItemsPerPage = 24;
    const [currentPage, setCurrentPage] = useState(1);

    const handleData = (data) => {
        setFilter(data);
    };

    const startIndex = (currentPage - 1) * numberOfItemsPerPage;
    const endIndex = startIndex + numberOfItemsPerPage;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/products`, {withCredentials: true});

                // Ensures products is always an array
                setProducts(Array.isArray(res.data) ? (res.data): []);
            } catch (err) {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);


    let items = products.slice(startIndex, endIndex);

    const filteredProducts = items.filter((product) => {
        if (filter === "all") return true;
        return product.category.toLowerCase() === filter;
    });

    const handleNext = () => {
        if(endIndex < products.length){
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    }

    const handlePrev = () => {
        if(currentPage > 1){
            setCurrentPage(currentPage - 1);
        }
    }


    return(
        <>
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
                            <h3 className="page-name">MarketPlace</h3>
                                <div className="search">
                                    <input 
                                    type="text" 
                                    name="find-product" 
                                    id="find" 
                                    placeholder="Find What you want"
                                    onChange={e => setSearch(e.target.value)} />
                                </div><br />
                            <div className="marketlist">
                                <div className="product-list">
                                    {loading && <div className="loading">
                                        <div className="container">
                                            <p className="loader-logo">♻</p>
                                            <p>Loading <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
                                        </div>
                                    </div>}
                                    {(filteredProducts || [])
                                    .filter(products => products.product_name.toLowerCase().includes(search.toLowerCase()))
                                    .map((product) => (
                                        <ProductCard key={product.id || product.product_id} product={product} />
                                    ))}
                                </div>

                                <div className="pag-nav">
                                    <p>Page <b>{currentPage}</b> of <b>{Math.ceil(products.length / numberOfItemsPerPage)}</b></p>
                                    <button 
                                    onClick={handlePrev}
                                    disabled = {currentPage === 1}>
                                        Prev
                                    </button>
                                    <button
                                    onClick={handleNext}
                                    disabled = {endIndex >= products.length}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MarketPlace;