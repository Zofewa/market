import { useState } from "react";

const FILTERS = [
    { value: "all", label: "All", emoji: "🌍" },
    { value: "e-waste", label: "E-waste", emoji: "💻" },
    { value: "plastic", label: "Plastics", emoji: "🧴" },
    { value: "metal", label: "Metals", emoji: "🔩" },
    { value: "paper", label: "Papers", emoji: "📄" },
    { value: "organic", label: "Organic", emoji: "🍃" },
    { value: "glass", label: "Glasses", emoji: "🥃" },
];

export default function FilterBtns({ result }) {
    const [active, setActive] = useState("all");

    const handleClick = (value) => {
        setActive(value);
        result(value);
    };

    return (
        <div className="filter-btns">
            <div className="filter-btn-group">
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        className={`filter-btn${active === f.value ? " active" : ""}`}
                        onClick={() => handleClick(f.value)}
                        type="button"
                    >
                        <span className="filter-emoji">{f.emoji}</span>
                        <span>{f.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}