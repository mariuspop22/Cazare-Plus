import React from "react";
import "./Header.css";
import logo from "./assets/logo.png";

const Header = ({ onOpenRegister, onOpenLogin, isLoggedIn, onLogout, onAddProperty }) => {
    return (
        <header className="header">
            <div className="header-content">
                <img src={logo} alt="Logo" className="logo" />
            </div>

            <div className="header-links">
                {isLoggedIn ? (
                    <>
                        <a
                            className="nav-link add-property"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (onAddProperty) onAddProperty();
                            }}
                        >
                            Adaugă proprietate
                        </a>
                        <a
                            className="nav-link logout"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onLogout();
                            }}
                        >
                            Deconectare
                        </a>
                    </>
                ) : (
                    <>
                        <a
                            className="nav-link login"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onOpenLogin();
                            }}
                        >
                            Autentificare
                        </a>
                        <a
                            className="nav-link register"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onOpenRegister();
                            }}
                        >
                            Devino Partener
                        </a>
                    </>
                )}
            </div>
        </header>
    );
};
export default Header;