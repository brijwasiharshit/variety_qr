import React from "react";

export default function FoodList({ foodItems, searchQuery }) {
  const filteredItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="food-list">
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <div key={item.id} className="food-card">
            <h3>{item.name}</h3>
          </div>
        ))
      ) : (
        <h3>No results found</h3>
      )}
    </div>
  );
}
