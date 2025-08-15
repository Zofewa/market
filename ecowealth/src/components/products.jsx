import Filters from "./filter";
import Items from "./allproducts";

export default function ProductsContainer(){
    return (
        <div className="products">
            <div className="right-side-container">
                <Filters />
                <div className="marketlist">
                    <Items />
                </div>
            </div>
        </div>
    )
}