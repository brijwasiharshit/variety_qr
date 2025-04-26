import React, { useState } from "react";

export default function AddItem() {
    const host = process.env.REACT_APP_HOST;
    const [item, setItem] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: ""
    });

    const handleChange = (e) => {
        setItem({...item, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        const response = await fetch(`${host}/api/addfooditem`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });

        const data = await response.json();
        if (data.success) {
            alert("Item added successfully!");
        } else {
            alert("Failed to add item.");
        }
    };

    return ( <
        div className = "container mt-4" >
        <
        h2 > Add New Food Item < /h2> <
        form onSubmit = { handleSubmit } >
        <
        input type = "text"
        name = "name"
        placeholder = "Item Name"
        className = "form-control mb-2"
        onChange = { handleChange }
        required / >
        <
        input type = "text"
        name = "description"
        placeholder = "Description"
        className = "form-control mb-2"
        onChange = { handleChange }
        required / >
        <
        input type = "number"
        name = "price"
        placeholder = "Price"
        className = "form-control mb-2"
        onChange = { handleChange }
        required / >
        <
        input type = "text"
        name = "category"
        placeholder = "Category"
        className = "form-control mb-2"
        onChange = { handleChange }
        required / >
        <
        input type = "text"
        name = "imageUrl"
        placeholder = "Image URL"
        className = "form-control mb-2"
        onChange = { handleChange }
        required / >
        <
        button type = "submit"
        className = "btn btn-success" > Add Item < /button> < /
        form > <
        /div>
    );
}