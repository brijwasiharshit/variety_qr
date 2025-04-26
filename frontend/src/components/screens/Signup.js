import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
    const [credentials, setCredentials] = useState({ email: "", name: "", password: "", geolocation: "" });
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        const response = await fetch("https://variety-food-upxc.onrender.com/api/createuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: credentials.email,
                name: credentials.name,
                password: credentials.password,
                location: credentials.geolocation
            })
        });

        const json = await response.json();
        console.log(json);

        if (!json.success) {
            alert("❌ Signup Failed! Please check your details.");
        } else {
            localStorage.setItem("authToken", json.authToken); // Save token
            alert("✅ Signup Successful! Redirecting to Home...");
            navigate("/"); // Redirect to Home
        }
    };

    const onChange = (event) => {
        setCredentials({...credentials, [event.target.name]: event.target.value });
    };

    return ( <
        div className = "container-fluid d-flex justify-content-center align-items-center vh-100"
        style = {
            { backgroundColor: "#FF6F00" }
        } >
        <
        div className = "card border-warning shadow-lg p-4 bg-light text-dark"
        style = {
            { width: "400px" }
        } >
        <
        h2 className = "text-center text-warning mb-4" > 🚀Variety Signup < /h2> <
        form onSubmit = { handleSubmit } >
        <
        div className = "mb-3" >
        <
        label htmlFor = "email"
        className = "form-label" > Email address < /label> <
        input type = "email"
        className = "form-control bg-light text-dark border-warning"
        name = "email"
        value = { credentials.email }
        onChange = { onChange }
        required / >
        <
        div className = "form-text text-secondary" > We 'll never share your email.</div> < /
        div >

        <
        div className = "mb-3" >
        <
        label htmlFor = "name"
        className = "form-label" > Name < /label> <
        input type = "text"
        className = "form-control bg-light text-dark border-warning"
        name = "name"
        value = { credentials.name }
        onChange = { onChange }
        required / >
        <
        /div>

        <
        div className = "mb-3" >
        <
        label htmlFor = "password"
        className = "form-label" > Password < /label> <
        input type = "password"
        className = "form-control bg-light text-dark border-warning"
        name = "password"
        value = { credentials.password }
        onChange = { onChange }
        required / >
        <
        /div>

        <
        div className = "mb-3" >
        <
        label htmlFor = "address"
        className = "form-label" > Address < /label> <
        input type = "text"
        className = "form-control bg-light text-dark border-warning"
        name = "geolocation"
        value = { credentials.geolocation }
        onChange = { onChange }
        required / >
        <
        /div>

        <
        button type = "submit"
        className = "btn btn-warning w-100 fw-bold" > Sign Up < /button> <
        Link to = "/login"
        className = "btn btn-outline-dark w-100 mt-3" > Already a user ? Login < /Link> < /
        form > <
        /div> < /
        div >
    );
}