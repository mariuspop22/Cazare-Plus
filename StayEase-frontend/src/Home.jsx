import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "./Home.css";
import RegisterModal from "./RegisterModal";
import LoginModal from "./Login";
import apartment from "./assets/apartment.png";
import house from "./assets/house.png";
import room from "./assets/room.png";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { FaBed, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaFire, FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DestinationCarousel = ({ dest, properties, navigate }) => {
    const scrollRef = useRef(null);

    const scroll = (scrollOffset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft += scrollOffset;
        }
    };

    const getPropertyImage = (property) => {
        // 1. Căutăm imaginea marcată cu mainImage: true în array-ul images
        if (property.images && property.images.length > 0) {
            const mainImg = property.images.find(img => img.mainImage) || property.images[0];
            if (mainImg && mainImg.imageData) {
                return mainImg.imageData.startsWith('data:')
                    ? mainImg.imageData
                    : `data:image/jpeg;base64,${mainImg.imageData}`;
            }
        }

        // 2. Fallback în cazul în care backend-ul trimite direct mainImageBase64
        if (property.mainImageBase64) {
            return property.mainImageBase64.startsWith('data:')
                ? property.mainImageBase64
                : `data:image/jpeg;base64,${property.mainImageBase64}`;
        }

        return null;
    };

    return (
        <div className="top-properties-section">
            <div className="top-property-subtitle-icon">
                <FaFire className="title-icon" />
                <h3 className="top-properties-subtitle">Best in {dest.name}</h3>
            </div>
            <div className="carousel-wrapper">
                <button className="scroll-arrow left" onClick={() => scroll(-300)}>
                    <FaChevronLeft />
                </button>

                <div className="top-properties-grid" ref={scrollRef}>
                    {properties.map(property => {
                        const imageSrc = getPropertyImage(property);

                        return (
                            <div key={property.id} className="top-property-card" onClick={() => navigate(`/property/${property.id}`)}>
                                <div className="top-property-image-container">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={property.title}
                                            className="top-property-image"
                                        />
                                    ) : (
                                        <div className="no-image-placeholder">Fără imagine</div>
                                    )}
                                    <span className="top-property-rating">
                                        {property.averageRating > 0 ? property.averageRating : 'Nou'}
                                        <FaStar className="star-icon" />
                                    </span>
                                </div>

                                <div className="top-property-info">
                                    <div className="top-property-header">
                                        <h4 className="top-property-title">{property.title}</h4>
                                    </div>
                                    <div className="top-property-header">
                                        <div className="top-property-price">
                                            {property.pricePerNight} RON / noapte
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="scroll-arrow right" onClick={() => scroll(300)}>
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};
function Home() {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwtToken"));

    const [destination, setDestination] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedLocationInfo, setSelectedLocationInfo] = useState(null);

    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
    const [guestCounts, setGuestCounts] = useState({
        adults: 2,
        children: 0,
        rooms: 1
    });

    const [popularDestinations, setPopularDestinations] = useState([]);
    const [topPropertiesPerDestination, setTopPropertiesPerDestination] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:8080/api/properties/featured")
            .then(async response => {
                if (!response.ok) throw new Error(`Eroare Featured: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("[TEST BACKEND] Featured Properties primite:", data);
                setFeaturedProperties(data);
            })
            .catch(error => console.error("[TEST BACKEND] Eroare la /api/properties/featured:", error));
    }, []);

    useEffect(() => {
        fetch("http://localhost:8080/api/destinations/popular")
            .then(async response => {
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Status ${response.status}: ${errorText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("[TEST BACKEND] Destinații populare primite:", data);
                setPopularDestinations(data);
            })
            .catch(error => console.error("[TEST BACKEND] Eroare la /api/destinations/popular:", error.message));
    }, []);

    useEffect(() => {
        if (popularDestinations.length > 0) {
            popularDestinations.forEach(dest => {
                fetch(`http://localhost:8080/api/destinations/${encodeURIComponent(dest.name)}/top-properties?limit=10`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Status ${res.status}`);
                        return res.json();
                    })
                    .then(data => {
                        console.log(`[TEST BACKEND] Top properties pentru ${dest.name}:`, data);
                        setTopPropertiesPerDestination(prev => ({
                            ...prev,
                            [dest.name]: data
                        }));
                    })
                    .catch(err => console.error(`[TEST BACKEND] Eroare la top-properties pt ${dest.name}:`, err));
            });
        }
    }, [popularDestinations]);

    useEffect(() => {
        if (featuredProperties.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === featuredProperties.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);
        return () => clearInterval(interval);
    }, [featuredProperties]);

    useEffect(() => {
        if (destination.trim().length >= 2 && !selectedLocationInfo) {
            const delayDebounceFn = setTimeout(() => {
                fetch(`http://localhost:8080/api/locations/search?query=${destination}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Status: ${res.status}`);
                        return res.json();
                    })
                    .then(data => {
                        console.log(`[TEST BACKEND] Rezultate autocomplete locație "${destination}":`, data);
                        setSearchResults(data);
                        setShowDropdown(true);
                    })
                    .catch(err => console.error("[TEST BACKEND] Eroare la /api/locations/search:", err));
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setShowDropdown(false);
        }
    }, [destination, selectedLocationInfo]);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        setIsLoggedIn(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const queryParams = new URLSearchParams({
            city: destination,
            adults: guestCounts.adults,
            children: guestCounts.children,
            rooms: guestCounts.rooms
        });

        if (startDate) queryParams.append("checkIn", startDate.toISOString().split('T')[0]);
        if (endDate) queryParams.append("checkOut", endDate.toISOString().split('T')[0]);

        const searchUrl = `http://localhost:8080/api/properties/search?${queryParams.toString()}`;

        fetch(searchUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Eroare de la server. Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                navigate("/rezultate", { state: { properties: data } });
            })
            .catch(err => {
                console.error("Eroare la căutare:", err);
                alert("Căutarea a eșuat. Verifică consola!");
            });
    };

    const handleSelectLocation = (location) => {
        setDestination(location.name);
        setSelectedLocationInfo(location);
        setShowDropdown(false);
    };

    const handleDestinationChange = (e) => {
        setDestination(e.target.value);
        setSelectedLocationInfo(null);
    };

    const handleGuestChange = (type, operation) => {
        setGuestCounts(prev => {
            let newValue = operation === 'increment' ? prev[type] + 1 : prev[type] - 1;
            if (type === 'adults' && newValue < 1) newValue = 1;
            if (type === 'children' && newValue < 0) newValue = 0;
            if (type === 'rooms' && newValue < 1) newValue = 1;
            return { ...prev, [type]: newValue };
        });
    };

    const guestInputText = `${guestCounts.adults} adulți · ${guestCounts.children} copii · ${guestCounts.rooms} camer${guestCounts.rooms > 1 ? 'e' : 'ă'}`;

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
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={() => setIsLoggedIn(true)} />

            <div className="page-content">
                <div className="hero-section">
                    <div className="hero-left">
                        <form className="search-bar-form" onSubmit={handleSearch}>
                            <div className="search-bar-frame">

                                <div className="search-field" style={{ position: "relative" }}>
                                    <FaBed className="search-field-icon" />
                                    <div className="search-field-content">
                                        <input
                                            type="text"
                                            placeholder="Unde mergeți?"
                                            value={destination}
                                            onChange={handleDestinationChange}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {showDropdown && searchResults.length > 0 && (
                                        <ul className="location-dropdown">
                                            {searchResults.map((loc) => (
                                                <li
                                                    key={`${loc.type}-${loc.id}`}
                                                    onClick={() => handleSelectLocation(loc)}
                                                    className="location-dropdown-item"
                                                >
                                                    <FaMapMarkerAlt className="location-item-icon" />
                                                    <div className="location-item-text">
                                                        <span className="location-name">{loc.name}</span>
                                                        <span className="location-context">{loc.context}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="search-field">
                                    <FaCalendarAlt className="search-field-icon" />
                                    <div className="search-field-content">
                                        <div className="search-dates-row">
                                            <DatePicker
                                                selectsRange={true}
                                                startDate={startDate}
                                                endDate={endDate}
                                                onChange={(update) => setDateRange(update)}
                                                placeholderText="mm/dd/yy — mm/dd/yy"
                                                className="clean-datepicker-input"
                                                dateFormat="MM/dd/yyyy"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="search-field" style={{ position: "relative" }}>
                                    <FaUser className="search-field-icon" />
                                    <div
                                        className="search-field-content"
                                        onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Adaugă oaspeți"
                                            value={guestInputText}
                                            readOnly
                                            style={{ cursor: "pointer", caretColor: "transparent" }}
                                        />
                                    </div>

                                    {isGuestDropdownOpen && (
                                        <div className="guest-dropdown">
                                            <div className="guest-dropdown-item">
                                                <div className="guest-text-wrapper">
                                                    <span className="guest-title">Adulți</span>
                                                    <span className="guest-subtitle">Vârsta 13+</span>
                                                </div>
                                                <div className="guest-controls">
                                                    <button type="button" onClick={() => handleGuestChange('adults', 'decrement')} disabled={guestCounts.adults <= 1}>−</button>
                                                    <span className="guest-count">{guestCounts.adults}</span>
                                                    <button type="button" onClick={() => handleGuestChange('adults', 'increment')}>+</button>
                                                </div>
                                            </div>

                                            <div className="guest-dropdown-item">
                                                <div className="guest-text-wrapper">
                                                    <span className="guest-title">Copii</span>
                                                    <span className="guest-subtitle">Vârsta 0 - 12</span>
                                                </div>
                                                <div className="guest-controls">
                                                    <button type="button" onClick={() => handleGuestChange('children', 'decrement')} disabled={guestCounts.children <= 0}>−</button>
                                                    <span className="guest-count">{guestCounts.children}</span>
                                                    <button type="button" onClick={() => handleGuestChange('children', 'increment')}>+</button>
                                                </div>
                                            </div>

                                            <div className="guest-dropdown-item">
                                                <div className="guest-text-wrapper">
                                                    <span className="guest-title">Camere</span>
                                                </div>
                                                <div className="guest-controls">
                                                    <button type="button" onClick={() => handleGuestChange('rooms', 'decrement')} disabled={guestCounts.rooms <= 1}>−</button>
                                                    <span className="guest-count">{guestCounts.rooms}</span>
                                                    <button type="button" onClick={() => handleGuestChange('rooms', 'increment')}>+</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="search-button">
                                <button type="submit" className="search-submit-btn">
                                    Căutare
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="hero-right">
                        <h1 className="main-text-1">Tot ceea ce îți dorești este la un click distanță...</h1>
                        <div className="card-container">
                            <div className="card"><img src={apartment} alt="img1" /><div className="card-description">apartamente</div></div>
                            <div className="card"><img src={house} alt="img2" /><div className="card-description">cabane</div></div>
                            <div className="card"><img src={room} alt="img3" /><div className="card-description">camere</div></div>
                        </div>
                    </div>
                </div>

                <div className="description-container">
                    <div className="main-text-2">Cine suntem noi?</div>
                    <div className="description">
                        CazarePlus este o platformă românească dedicată rezervării de cazări,
                        oferind utilizatorilor o experiență rapidă, sigură și accesibilă.
                        Fie că îți dorești un apartment modern, o cabană în mijlocul naturii sau o cameră confortabilă,
                        CazarePlus îți pune la dispoziție numeroase opțiuni pentru orice buget.
                        De peste 4 ani, platforma a câștigat încrederea a mii de clienți mulțumiți din întreaga țară.
                    </div>
                </div>

                <div className="popular-destination">
                    <div className="popular-destinations-container">
                        <div className="popular-destinations-header">
                            <div className="popular-destinations-title-wrapper">
                                <FaFire className="title-icon" />
                                <h2 className="popular-destinations-title">Cele mai populare destinații de acum</h2>
                            </div>
                            <p className="popular-destinations-subtitle">
                                Descoperă locurile preferate de călătorii CazarePlus pentru următoarea ta escapadă.
                            </p>
                        </div>

                        <div className="destinations-grid">
                            {popularDestinations.map(dest => (
                                <div key={dest.id} className="destination-card">
                                    <img
                                        src={`data:image/jpeg;base64,${dest.imageData}`}
                                        alt={dest.name}
                                        className="destination-image"
                                    />
                                    <div className="destination-overlay">
                                        <span className="destination-name">
                                            {dest.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="top-properties-wrapper">
                    {popularDestinations.map(dest => {
                        const properties = topPropertiesPerDestination[dest.name];
                        if (!properties || properties.length === 0) return null;

                        return (
                            <DestinationCarousel
                                key={`top-${dest.id}`}
                                dest={dest}
                                properties={properties}
                                navigate={navigate}
                            />
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

export default Home;