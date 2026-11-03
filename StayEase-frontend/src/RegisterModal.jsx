import React, { useState } from "react";
import "./RegisterModal.css";
import { API_BASE_URL } from './config';

function RegisterModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        passwordhash: ""
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Date trimise pentru înregistrare:", formData);

        try {
            const response = await fetch(`${API_BASE_URL}/api/register/owner`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const message = await response.text();
                alert(message);

                setFormData({ nume: "", prenume: "", email: "", parola: "" });

                onClose();
            } else {
                const errorData = await response.text();
                alert("Eroare: " + errorData);
            }
        } catch (error) {
            console.error("Eroare la conexiune:", error);
            alert("Nu ne-am putut conecta la server. Verifică dacă backend-ul este pornit.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>X</button>

                <h2>Devino Gazdă pe CazarePlus</h2>
                <p>Creează un cont pentru a-ți publica proprietățile.</p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="input-group">
                        <label>Nume</label>
                        <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Prenume</label>
                        <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label>Parolă</label>
                        <input type="password" name="passwordhash" value={formData.passwordhash} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="submit-btn">Creează Cont</button>
                </form>
            </div>
        </div>
    );
}

export default RegisterModal;