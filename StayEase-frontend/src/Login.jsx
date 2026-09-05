import React, { useState } from "react";
import "./RegisterModal.css";

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState("");

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Email sau parolă incorectă!");
            }

            const data = await response.json();
            localStorage.setItem("jwtToken", data.token);

            setFormData({ email: "", password: "" });

            if (onLoginSuccess) {
                onLoginSuccess();
            }

            onClose();
        } catch (error) {
            setErrorMessage(error.message || "Eroare la conectare.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>
                <h2>Autentificare</h2>
                <p>Conectează-te la contul tău CazarePlus.</p>
                {errorMessage && (
                    <p style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
                        {errorMessage}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Parolă</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        Logează-te
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;