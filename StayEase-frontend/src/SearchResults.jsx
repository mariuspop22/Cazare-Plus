import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import './SearchResults.css';
import Header from "./Header.jsx";
import RegisterModal from "./RegisterModal";
import LoginModal from "./Login";

export default function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const properties = location.state?.properties || [];

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwtToken"));

    const [favoriteIds, setFavoriteIds] = useState([]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchFavorites();
        } else {
            setFavoriteIds([]);
        }
    }, [isLoggedIn]);

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch('http://localhost:8080/api/favorites/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const ids = await response.json();
                setFavoriteIds(ids);
            }
        } catch (error) {
            console.error("Eroare la preluarea favoritelor:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        setIsLoggedIn(false);
    };

    const getPropertyImage = (property) => {
        if (property.images && property.images.length > 0) {
            const mainImg = property.images.find(img => img.mainImage) || property.images[0];
            if (mainImg && mainImg.imageData) {
                return `data:image/jpeg;base64,${mainImg.imageData}`;
            }
        }
        return property.imageUrl || "https://via.placeholder.com/300x200?text=Fără+Imagine";
    };

    const handleFavoriteClick = async (e, propertyId) => {
        e.preventDefault();

        if (!isLoggedIn) {
            setIsLoginOpen(true);
            return;
        }

        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(`http://localhost:8080/api/favorites/toggle/${propertyId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const isNowFavorite = await response.json();
                if (isNowFavorite) {
                    setFavoriteIds(prev => [...prev, propertyId]);
                } else {
                    setFavoriteIds(prev => prev.filter(id => id !== propertyId));
                }
            }
        } catch (error) {
            console.error("Eroare la toggle favorite:", error);
        }
    };

    return (
        <div>
            <Header
                onOpenRegister={() => setIsRegisterOpen(true)}
                onOpenLogin={() => setIsLoginOpen(true)}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                onAddProperty={() => navigate("/add-property")}
            />

            <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onLoginSuccess={() => {
                    setIsLoggedIn(true);
                    setIsLoginOpen(false);
                }}
            />

            <div className="search-results-container">
                {properties.length === 0 ? (
                    <div className="no-results">
                        <p>Ne pare rău, nu am găsit nicio proprietate pentru criteriile tale.</p>
                        <Link to="/" className="back-btn">Încearcă altă căutare</Link>
                    </div>
                ) : (
                    <div className="properties-grid">
                        {properties.map((property) => {
                            const isFavorite = favoriteIds.includes(property.id);

                            return (
                                <div key={property.id} className="property-card">
                                    <Link to={`/property/${property.id}`} className="property-image-container">
                                        <img
                                            src={getPropertyImage(property)}
                                            alt={property.title}
                                            className="property-image"
                                        />

                                        <button
                                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                                            onClick={(e) => handleFavoriteClick(e, property.id)}
                                        >
                                            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
                                            </svg>
                                        </button>

                                        <div className="rating-badge">
                                            ★ {property.averageRating > 0 ? property.averageRating : "Nou"}
                                        </div>
                                    </Link>

                                    <div className="property-info">
                                        <h3>{property.title}</h3>
                                        <p className="property-location"> {property.city}, {property.country}</p>
                                        <div className="property-details-mini">
                                            <div className="property-details-capacity">
                                                <span> {property.rooms} camere</span>
                                                <span>•</span>
                                                <span> max {property.maxGuests} oaspeți</span>
                                            </div>
                                            <div className="property-details-price">
                                                <span className="price"><strong>{property.pricePerNight} RON</strong> / noapte</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}