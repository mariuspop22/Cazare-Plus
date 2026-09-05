import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PropertyDetails.css';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { FaMapMarkerAlt } from 'react-icons/fa';
import {
    TbSmokingNo, TbBan, TbToolsKitchen2, TbParking,
    TbBell, TbTree, TbStar, TbInfoCircle, TbCheck
} from 'react-icons/tb';

const customHouseIcon = L.divIcon({
    className: 'custom-house-marker',
    html: `<div style="position: relative; background-color: #222222; color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 20px;">
            <i class="fa-solid fa-house"></i>
            <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #222222;"></div>
           </div>`,
    iconSize: [44, 52],
    iconAnchor: [22, 52]
});

const PropertyDetails = () => {
    const { id } = useParams();

    const [property, setProperty] = useState(null);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [selectedDates, setSelectedDates] = useState([null, null]);

    const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

    const categoryIconStyle = { color: '#222222', fontSize: '24px', strokeWidth: '1.5' };

    const categoryIcons = {
        "Fumatul": <TbSmokingNo style={categoryIconStyle} />,
        "Țigările electronice și vape-urile": <TbBan style={categoryIconStyle} />,
        "Bucătărie": <TbToolsKitchen2 style={categoryIconStyle} />,
        "Parcarea": <TbParking style={categoryIconStyle} />,
        "La dispoziția turiștilor": <TbBell style={categoryIconStyle} />,
        "În curte": <TbTree style={categoryIconStyle} />,
        "Facilități generale": <TbStar style={categoryIconStyle} />,
        "Reguli generale": <TbInfoCircle style={categoryIconStyle} />
    };

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/properties/${id}`);

                if (!response.ok) {
                    throw new Error('Nu am putut încărca datele proprietății.');
                }
                const data = await response.json();

                setProperty(data);

                if (data.owner) {
                    setOwner(data.owner);
                }

                if (data.images && data.images.length > 0) {
                    const mainImg = data.images.find(img => img.mainImage) || data.images[0];
                    setActiveImage(mainImg.base64Data);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [id]);

    // Verifica daca o data din calendar se afla intr-o perioada indisponibila
    const isDateDisabled = ({ date, view }) => {
        if (view !== 'month' || !property?.unavailablePeriods) return false;

        const checkTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

        return property.unavailablePeriods.some(period => {
            const [sYear, sMonth, sDay] = period.startDate.split('-').map(Number);
            const [eYear, eMonth, eDay] = period.endDate.split('-').map(Number);

            const startTime = new Date(sYear, sMonth - 1, sDay).getTime();
            const endTime = new Date(eYear, eMonth - 1, eDay).getTime();

            return checkTime >= startTime && checkTime <= endTime;
        });
    };

    if (loading) return <div className="loader-container"><h2>Se încarcă detaliile...</h2></div>;
    if (error) return <div className="error-container"><h2>Eroare: {error}</h2></div>;
    if (!property) return <div className="error-container"><h2>Proprietatea nu a fost găsită.</h2></div>;

    const position = [
        property.latitude || 45.657974,
        property.longitude || 25.601198
    ];

    return (
        <div className="property-details-page">
            <Header isLoggedIn={!!localStorage.getItem('jwtToken')} />

            <main className="property-main-content">
                <div className="property-header">
                    <h1>{property.title}</h1>
                </div>

                {property.images && property.images.length > 0 && (
                    <div className="property-gallery">
                        <div className="main-image-container">
                            <img src={activeImage} alt="Imagine principală" className="main-image" />
                        </div>
                        <div className="thumbnail-container">
                            {property.images.map((img) => (
                                <img
                                    key={img.id}
                                    src={img.base64Data}
                                    alt="Thumbnail"
                                    className={`thumbnail ${activeImage === img.base64Data ? 'active-thumbnail' : ''}`}
                                    onClick={() => setActiveImage(img.base64Data)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="property-body">
                    <div className="property-info-left">

                        <div className="basic-info-row">
                            <span className="info-badge">{property.propertyType}</span>
                            <span><i className="fa-solid fa-user-group"></i> Max {property.maxGuests} oaspeți</span>
                            <span><i className="fa-solid fa-door-open"></i> {property.rooms} camere</span>
                            <span><i className="fa-solid fa-bath"></i> {property.bathrooms} băi</span>
                        </div>

                        {owner && (
                            <div className="property-owner-summary">
                                <img
                                    src={owner.profilePictureBase64 || defaultAvatar}
                                    alt="Proprietar"
                                    className="owner-avatar-small"
                                />
                                <div className="owner-summary-text">
                                    <span className="owner-name-small">{owner.firstName} {owner.lastName}</span>
                                    <span className="owner-phone-small">
                                        <i className="fa-solid fa-phone" style={{ marginRight: '6px' }}></i>
                                        {owner.telephoneNumber || 'Nespecificat'}
                                    </span>
                                </div>

                                <span className="owner-label-small">Proprietarul spațiului</span>
                            </div>
                        )}

                        <div className="description-section">
                            <h3>Descriere</h3>
                            <p>{property.description}</p>
                        </div>

                        <hr className="divider" />

                        <div className="facilities-section">
                            <h3>Facilități / Reguli</h3>
                            {property.facilities && property.facilities.length > 0 ? (
                                <div className="facilities-grid">
                                    {property.facilities.map((group, index) => (
                                        <div key={index} className="facility-category-card">
                                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#222222' }}>
                                                {categoryIcons[group.categoryName] || <TbInfoCircle style={categoryIconStyle} />}
                                                {group.categoryName}
                                            </h4>
                                            <ul>
                                                {group.facilities.map((fac, idx) => (
                                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <TbCheck style={{ color: '#222222', minWidth: '18px', fontSize: '18px' }} />
                                                        <span style={{ color: '#222222' }}>{fac}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Această proprietate nu are facilități listate încă.</p>
                            )}
                        </div>

                        <hr className="divider" />

                        {/* SECTIUNE CALENDAR */}
                        <div className="availability-calendar-section">
                            <h3>Selectează data de check-in</h3>
                            <p className="calendar-subtitle">Adaugă datele de călătorie pentru a vedea prețul exact</p>

                            <div className="custom-calendar-wrapper">
                                <Calendar
                                    onChange={setSelectedDates}
                                    value={selectedDates}
                                    selectRange={true}
                                    tileDisabled={isDateDisabled}
                                    minDate={new Date()}
                                    showDoubleView={true}
                                    next2Label={null}
                                    prev2Label={null}
                                    showNeighboringMonth={false}
                                />
                            </div>

                            <div className="calendar-footer-actions">
                                <button
                                    className="clear-dates-btn"
                                    onClick={() => setSelectedDates([null, null])}
                                >
                                    Șterge datele
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="property-sidebar-right">
                        <div className="price-card">
                            <div className="price-header">
                                <span className="price-amount">{property.pricePerNight} RON</span>
                                <span className="price-per">/ noapte</span>
                            </div>

                            <button className="book-button">Rezervă Acum</button>

                            <div className="price-details-note">
                                Prețul final poate varia în funcție de numărul de zile.
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="divider" />

                <div className="map-section" style={{ marginTop: '30px', marginBottom: '40px' }}>
                    <h3>Unde te vei afla</h3>
                    <p className="property-location">
                        <FaMapMarkerAlt style={{ marginRight: '3px', color: '#4b5563' }} />
                        {property.address}, {property.city}
                    </p>
                    <div style={{ height: '450px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 1 }}>
                        <MapContainer
                            center={position}
                            zoom={13}
                            scrollWheelZoom={false}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            <Marker position={position} icon={customHouseIcon} />
                        </MapContainer>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default PropertyDetails;