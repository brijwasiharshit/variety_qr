import React, { useEffect, useState } from "react";
import Card from "../components/Card";

export default function FoodList({ foodCat, foodItems, searchQuery }) {
    const [visibleItems, setVisibleItems] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        const initialVisible = {};
        foodCat.forEach(category => {
            initialVisible[category._id] = 10;
        });
        setVisibleItems(initialVisible);
        
        if (foodCat.length > 0 && !activeCategory) {
            setActiveCategory(foodCat[0]._id);
        }
    }, [foodCat]);

    const handleLoadMore = (categoryId) => {
        setVisibleItems(prev => ({
            ...prev,
            [categoryId]: prev[categoryId] + 10
        }));
    };

    const getFilteredItems = (category) => {
        return foodItems.filter(item => {
            const matchesSearch = searchQuery !== "" && 
                item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = item.category === category.CategoryName;
            
            return searchQuery !== "" ? matchesSearch : matchesCategory;
        });
    };

    return (
        <div className="container mx-auto px-2 sm:px-4 mt-4">
            {/* Category Tabs */}
            <div className="mb-4 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar text-center">
                {foodCat.map((category) => (
                    <button
                        key={category._id}
                        onClick={() => setActiveCategory(category._id)}
                        className={`inline-block mx-1 ${
                            activeCategory === category._id 
                                ? 'active-category' 
                                : 'inactive-category'
                        }`}
                        style={{
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            minWidth: '120px',
                            borderRadius: '25px',
                            padding: '12px 20px',
                            letterSpacing: '0.5px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            ...(activeCategory === category._id 
                                ? { 
                                    background: 'linear-gradient(135deg, #FF8C00, #FF5E00)',
                                    color: 'white',
                                    border: '2px solid #FFD700',
                                    transform: 'scale(1.05)'
                                } 
                                : { 
                                    background: 'linear-gradient(135deg, #FFD700, #FFAA00)',
                                    color: '#7B3F00',
                                }),
                        }}
                    >
                        {category?.CategoryName === 'DISH' ? 'DISHES' : category.CategoryName}
                    </button>
                ))}
            </div>

            {foodCat.length > 0 ? (
                foodCat
                    .filter(category => activeCategory === category._id)
                    .map((category) => {
                        const categoryItems = getFilteredItems(category);
                        const itemsToShow = categoryItems.slice(0, visibleItems[category._id] || 10);

                        return (
                            <div key={category._id} className="my-4">
                                {searchQuery === "" && (
                                    <h2 className="text-center p-2 mb-3 mx-auto" style={{
                                        backgroundColor: "#FF4500",
                                        color: "white",
                                        borderRadius: "10px",
                                        fontSize: "clamp(18px, 4vw, 22px)",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                                        width: "fit-content",
                                        minWidth: "60%",
                                        maxWidth: "90%",
                                        padding: "0.5rem 1rem"
                                    }}>
                                        {category?.CategoryName}
                                    </h2>
                                )}

                                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {itemsToShow.map((item) => (
                                        <Card key={item._id} item={item} />
                                    ))}
                                </div>

                                {categoryItems.length > (visibleItems[category._id] || 10) && (
                                    <div className="text-center mt-3">
                                        <button
                                            onClick={() => handleLoadMore(category._id)}
                                            className="btn"
                                            style={{
                                                backgroundColor: '#FF4500',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                padding: '8px 25px',
                                                borderRadius: '20px',
                                                border: 'none'
                                            }}
                                        >
                                            Load More {category.CategoryName}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
            ) : (
                <p className="text-center fs-4 text-muted">No categories available</p>
            )}
        </div>
    );
}