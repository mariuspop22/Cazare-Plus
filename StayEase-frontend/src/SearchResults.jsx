import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import './SearchResults.css';
import Header from "./Header.jsx";
import RegisterModal from "./RegisterModal";
import LoginModal from "./Login";
import { API_BASE_URL } from './config';
import { FaStar } from 'react-icons/fa';
import apartmentImg from './assets/apartment.png';
import houseImg from './assets/house.png';
import roomImg from './assets/room.png';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import {
    TbSmokingNo, TbBan, TbToolsKitchen2, TbParking,
    TbBell, TbTree, TbStar, TbInfoCircle, TbCheck, TbBuildingCommunity,TbAdjustmentsHorizontal
} from 'react-icons/tb';
export default function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const [properties, setProperties] = useState(
        location.state?.properties || []
    );
    const searchCriteria = location.state?.searchCriteria || {};
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwtToken"));
    const [favoriteIds, setFavoriteIds] = useState([]);

    const [FilterModal, setFilterModal] = useState({
        isOpen: false
    });

    const [selectedTypes, setSelectedTypes] = useState([]);
    const [Facilities, setFacilities] = useState([]);
    const propertyTypes = [
        {key: 'APARTMENT', label: 'APARTAMENT', icon: apartmentImg},
        {key: 'CABIN', label: 'CASA', icon: houseImg},
        {key: 'ROOM', label: 'CAMERA', icon: roomImg}
    ];
    const [selectedFacilities, setselectedFacilities] = useState([]);

    const categoryIconStyle = {color: '#222222', fontSize: '24px', strokeWidth: '1.5'};
    const [PropertySearchIds,setPropertiesSearchIds]= useState([]);
    const categoryIcons = {
        "Fumatul": <TbSmokingNo style={categoryIconStyle}/>,
        "Țigările electronice și vape-urile": <TbBan style={categoryIconStyle}/>,
        "Bucătărie": <TbToolsKitchen2 style={categoryIconStyle}/>,
        "Parcarea": <TbParking style={categoryIconStyle}/>,
        "La dispoziția turiștilor": <TbBell style={categoryIconStyle}/>,
        "În curte": <TbTree style={categoryIconStyle}/>,
        "Facilități generale": <TbStar style={categoryIconStyle}/>,
        "Reguli generale": <TbInfoCircle style={categoryIconStyle}/>
    };
    const FacilitiesFilter = [];

    const priceRangeFilter = {
        min: 0,
        max: 0
    };
    const propertyTypeFilter = [];

    const [propertyRatingFilter, setpropertyRatingFilter] = useState([0, 5]);
    const handleRender = (node, info) => {
        return (
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    bottom: '25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#222',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                }}>
                    {info.value.toFixed(1)} ⭐
                </div>

                {node}
            </div>
        );
    };
    const OpenFilterModal = () => {
        setFilterModal({isOpen: true});
    };

    const CloseFilterModal = () => {
        setFilterModal({isOpen: false});
    };


    const toggleType = (typeKey) => {
        setSelectedTypes(prevTypes => {
            let newState;
            if (prevTypes.includes(typeKey)) {
                newState = prevTypes.filter(t => t !== typeKey);
            } else {
                newState = [...prevTypes, typeKey];
            }

            propertyTypeFilter.length = 0;
            propertyTypeFilter.push(...newState);

            return newState;
        });
    };
    const [priceRange, setPriceRange] = useState([50, 1100]);
    const MIN_PRICE = 0;
    const MAX_PRICE = 2000;


    const handleMinInputChange = (e) => {
        const value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
        setPriceRange([value, priceRange[1]]);
        priceRangeFilter.min = value;

    };

    const handleMaxInputChange = (e) => {
        const value = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
        setPriceRange([priceRange[0], value]);
        priceRangeFilter.max = value;

    };

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
            const response = await fetch(`${API_BASE_URL}/api/favorites/my`, {
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
            const response = await fetch(`${API_BASE_URL}/api/favorites/toggle/${propertyId}`, {
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
    const fetchFacilities = async () => {
        try {
            const reponse = await fetch(`${API_BASE_URL}/api/facilities/grouped`);
            const data = await reponse.json();
            setFacilities(data)
        } catch (error) {
            console.error("Eroare la preluarea facilitiilor:", error);
        }
    }
    useEffect(() => {
        fetchFacilities();

    }, []);
    console.log(Facilities);

    const handleFacilityCheckboxChange = (categoryId, facilityId) => {
        setselectedFacilities(prev => {
            const isAlreadySelected = prev.some(
                item => item.facilityId === facilityId && item.categoryId === categoryId
            );
            let newState;
            if (isAlreadySelected) {
                newState = prev.filter(
                    item => !(item.facilityId === facilityId && item.categoryId === categoryId)
                );
            } else {
                newState = [...prev, {categoryId, facilityId}];
            }
            FacilitiesFilter.length = 0;
            FacilitiesFilter.push(...newState);
            return newState;
        });
    };
    console.log(selectedFacilities);

  const PropertiesSearchIds = () => {
      const PropertiesIds=[];
      properties.forEach(item => {
          PropertiesIds.push(item.id);
      })
      setPropertiesSearchIds(PropertiesIds);

      console.log("id uri proprietatiilor:");
      console.log(PropertiesIds);
  }
    useEffect(() => {
        PropertiesSearchIds();

    }, []);
    const filterPayload = {
        propertiesSearchIds: PropertySearchIds,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        propertyTypes: selectedTypes,
        facilities: selectedFacilities
    };
    const handlesubmitFilter = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/properties/search/filters`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(filterPayload)
                }
            );

            if (!response.ok) {
                const errorText = await response.text();

                console.error("Status HTTP:", response.status);
                console.error("Eroare backend:", errorText);
                console.error("Payload trimis:", filterPayload);

                throw new Error(errorText);
            }

            const result = await response.json();

            setProperties(result);

            CloseFilterModal();

        } catch (error) {
            console.error('Eroare la filtrarea proprietăților:', error);
            alert('Nu s-au putut aplica filtrele.');
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

                <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}/>

                <LoginModal
                    isOpen={isLoginOpen}
                    onClose={() => setIsLoginOpen(false)}
                    onLoginSuccess={() => {
                        setIsLoggedIn(true);
                        setIsLoginOpen(false);
                    }}
                />

                <div className="search-results-container">
                    <div className="filter-button-container">
                        <button className="filter-button" onClick={() => OpenFilterModal()}>
                            <TbAdjustmentsHorizontal size={24}/>
                            <span>Filtre</span>
                        </button>
                    </div>
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
                                                    <path
                                                        d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
                                                </svg>
                                            </button>

                                            <div className="rating-badge">
                                                {property.averageRating > 0 ? property.averageRating : "Nou"} <FaStar
                                                className="star-icon"/>
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
                                                    <span
                                                        className="price"><strong>{property.pricePerNight} RON</strong> / noapte</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {FilterModal.isOpen && (
                    <div className="Filter-Modal-overlay">
                        <div className="Filter-Modal-container">
                            <div className="Filter-Modal-content">
                                <h3 className="title">Filtre</h3>
                                <button className="close-filter-modal" onClick={CloseFilterModal}>X</button>

                                <div className="filter-section">
                                    <h3 className="subtitle">Tipul proprietății</h3>

                                    <div className="property-types-container">
                                        {propertyTypes.map(({key, label, icon}) => {
                                            const isSelected = selectedTypes.includes(key);

                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => toggleType(key)}
                                                    className={`property-type-btn ${isSelected ? 'selected' : ''}`}
                                                >
                                                    <img
                                                        src={icon}
                                                        alt={label}
                                                        className="property-type-icon"
                                                    />
                                                    <span className="property-type-label">
                                              {label}
                                                </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                </div>
                                <div className="filter-section">
                                    <h3 className="subtitle">Pretul</h3>


                                    <div className="price-inputs-container">
                                        <div className="price-input-box">
                                            <label>Minimum</label>
                                            <div className="input-wrapper">
                                                <span>lei</span>

                                                <input
                                                    type="text"
                                                    value={priceRange[0]}
                                                    onChange={handleMinInputChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="price-input-box">
                                            <label>Maximum</label>
                                            <div className="input-wrapper">
                                                <span>lei</span>

                                                <input
                                                    type="text"
                                                    value={priceRange[1]}
                                                    onChange={handleMaxInputChange}
                                                />

                                                {priceRange[1] >= MAX_PRICE && <span>+</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="filter-section">
                                    <h3 className="subtitle">Facilitatiile proprietati</h3>
                                    {Facilities && (
                                        <div className="facilities-grid">
                                            {Facilities.map((group, index) => (
                                                <div key={group.categoryId} className="facility-category-card">
                                                    <h4 style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        color: '#222222'
                                                    }}>
                                                        {categoryIcons[group.categoryName] ||
                                                            <TbInfoCircle style={categoryIconStyle}/>}
                                                        {group.categoryName}
                                                    </h4>
                                                    <div className="checkbox-group">
                                                        {group.facilities.map((facility) => {
                                                            const isChecked = selectedFacilities.some(
                                                                (selected) => selected.facilityId === facility.id && selected.categoryId === group.categoryId
                                                            );

                                                            return (
                                                                <label key={facility.id} className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        value={facility.id}
                                                                        checked={isChecked}
                                                                        onChange={() => handleFacilityCheckboxChange(group.categoryId, facility.id)}
                                                                    />
                                                                    {facility.name}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                            ))}

                                        </div>
                                    )}
                                </div>

                                <div className="submit-filter-button">
                                    <button
                                        className="submit-filters"
                                        onClick={handlesubmitFilter}
                                    >
                                        Filtrează
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );

}
