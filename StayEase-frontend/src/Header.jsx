import React from "react";
import "./Header.css";
import logo from "./assets/logo.png"; // pune calea corectă către imaginea ta

// 1. Am adăugat { onOpenRegister } ca să prindem comanda trimisă din App.jsx
const Header = ({ onOpenRegister }) => {
    return (
        <header className="header">
            <div className="header-content">
                <img src={logo} alt="Logo" className="logo" />
            </div>

            {/* 2. Am legat evenimentul onClick de link-ul tău */}
            <a  class="register"
                href="#"
                onClick={(e) => {
                    e.preventDefault(); // Împiedică link-ul să dea scroll în susul paginii
                    onOpenRegister();   // Activează "telecomanda" care deschide popup-ul
                }}
            >
                Devino Partener
            </a>
        </header>
    );
};

export default Header;