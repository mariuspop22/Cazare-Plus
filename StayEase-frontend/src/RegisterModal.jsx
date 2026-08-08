import React, { useState } from "react";
import "./RegisterModal.css";

function RegisterModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        passwordhash: "" // Am schimbat din "parola"
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Previne reîncărcarea paginii la submit
        console.log("Date trimise pentru înregistrare:", formData);

        try {
            // Facem request-ul către backend-ul nostru (recepționerul)
            const response = await fetch("http://localhost:8080/api/register/owner", {
                method: "POST", // Trebuie să fie POST, exact cum am definit în Controller
                headers: {
                    "Content-Type": "application/json" // Îi spunem backend-ului că trimitem date în format JSON
                },
                body: JSON.stringify(formData) // Transformăm obiectul nostru în text JSON (cutia de care vorbeam)
            });

            // Verificăm dacă răspunsul este cu succes (ex: 200 OK)
            if (response.ok) {
                const message = await response.text();
                alert(message); // Afișează: "Contul de gazdă a fost creat cu succes!"

                // Opțional: Curățăm formularul după succes
                setFormData({ nume: "", prenume: "", email: "", parola: "" });

                // Închidem modalul
                onClose();
            } else {
                // Dacă backend-ul a returnat o eroare (ex: email-ul există deja)
                const errorData = await response.text();
                alert("Eroare: " + errorData);
            }
        } catch (error) {
            // Această eroare apare dacă backend-ul este oprit complet sau pică rețeaua
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