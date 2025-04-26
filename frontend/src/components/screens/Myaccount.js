import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Myaccount.css"; // Add styles if needed

export default function MyAccount() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async() => {
            try {
                const token = localStorage.getItem("authToken");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get("https://variety-food-upxc.onrender.com/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data);
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <h2 className = "loading-text" > Loading user details... < /h2>;
    if (error) return <h2 className = "error-text" > { error } < /h2>;

    return ( <
            div className = "account-container" >
            <
            h2 className = "account-title" > My Account < /h2> {
            user ? ( <
                div className = "user-details" >
                <
                p > < strong > Name: < /strong> {user.name}</p >
                <
                p > < strong > Email: < /strong> {user.email}</p >
                <
                p > < strong > Phone: < /strong> {user.phone || "Not Provided"}</p >
                <
                p > < strong > Address: < /strong> {user.address || "Not Provided"}</p >
                <
                /div>
            ) : ( <
                p > User data not available < /p>
            )
        } <
        /div>
);
}