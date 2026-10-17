import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from "./assets/logo.png";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="footer-container">

                <div className="footer-column brand-column">
                    <h3>CazarePlus</h3>
                    <p className="footer-description">
                        Platforma ta de încredere pentru gestionarea și rezervarea proprietăților. Simplu, rapid și sigur.
                    </p>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                    </div>
                </div>



                <div className="footer-column">
                    <h4>Informații Legale</h4>
                    <ul className="footer-links">
                        <li><Link to="/terms">Termeni și Condiții</Link></li>
                        <li><Link to="/privacy">Politica de Confidențialitate</Link></li>
                        <li><Link to="/cookies">Politica Cookie</Link></li>
                    </ul>
                </div>

                <div className="footer-column contact-column">
                    <h4>Contact</h4>
                    <ul className="footer-contact-info">
                        <li><i className="fa-regular fa-envelope"></i> contactcazareplus@cazareplus.ro</li>
                        <li><i className="fa-solid fa-phone"></i> +40 700 000 000</li>
                        <li><i className="fa-solid fa-location-dot"></i> București, România</li>
                    </ul>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} CazarePlus. Toate drepturile rezervate.</p>
            </div>
        </footer>
    );
};

export default Footer;