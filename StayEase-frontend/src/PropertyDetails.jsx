import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PropertyDetails.css';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import stars from "./assets/stars.png";
import {
    TbSmokingNo, TbBan, TbToolsKitchen2, TbParking,
    TbBell, TbTree, TbStar, TbInfoCircle, TbCheck, TbBuildingCommunity
} from 'react-icons/tb';

// --- COMPONENTA PENTRU CARUSELUL DE PROPRIETĂȚI SIMILARE ---
const SimilarPropertiesCarousel = ({ properties, navigate }) => {
    const scrollRef = useRef(null);

    const scroll = (scrollOffset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft += scrollOffset;
        }
    };

    const getPropertyImage = (property) => {
        if (property.images && property.images.length > 0) {
            const mainImg = property.images.find(img => img.mainImage) || property.images[0];
            const imgData = mainImg.imageData || mainImg.base64Data;
            if (imgData) {
                return imgData.startsWith('data:')
                    ? imgData
                    : `data:image/jpeg;base64,${imgData}`;
            }
        }

        if (property.mainImageBase64) {
            return property.mainImageBase64.startsWith('data:')
                ? property.mainImageBase64
                : `data:image/jpeg;base64,${property.mainImageBase64}`;
        }

        return null;
    };

    if (!properties || properties.length === 0) return null;

    return (
        <div className="similar-carousel-wrapper">
            <button className="scroll-arrow left" onClick={() => scroll(-300)}>
                <FaChevronLeft />
            </button>

            <div className="similar-properties-grid" ref={scrollRef}>
                {properties.map(property => {
                    const imageSrc = getPropertyImage(property);

                    return (
                        <div
                            key={property.id}
                            className="similar-property-card"
                            onClick={() => {
                                navigate(`/property/${property.id}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            <div className="similar-property-image-container">
                                {imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={property.title}
                                        className="similar-property-image"
                                    />
                                ) : (
                                    <div className="no-image-placeholder">Fără imagine</div>
                                )}
                                <span className="similar-property-rating">
                                    {property.rating > 0 ? property.rating : 'Nou'}
                                    <FaStar className="star-icon" />
                                </span>
                            </div>

                            <div className="similar-property-info">
                                <div className="similar-property-header">
                                    <h4 className="similar-property-title">{property.title}</h4>
                                </div>
                                <div className="similar-property-header">
                                    <div className="similar-property-price">
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
    );
};

// --- COMPONENTA PRINCIPALĂ ---
const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const propertyTypeTranslations = {
        APARTMENT: 'APARTAMENT',
        CABIN: 'CASA',
        ROOM: 'CAMERA'
    };

    const [property, setProperty] = useState(null);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [selectedDates, setSelectedDates] = useState([null, null]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [similarProperties, setSimilarProperties] = useState([]);
    const [reviewCount, setReviewCount] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);
    const [reviews, setPropertyReviews] = useState([]);

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

    // Preluare detalii proprietate
    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/properties/${id}`);
                if (!response.ok) throw new Error('Nu am putut încărca datele proprietății.');

                const data = await response.json();
                setProperty(data);
                if (data.owner) setOwner(data.owner);
                if (data.images && data.images.length > 0) {
                    const mainImg = data.images.find(img => img.mainImage) || data.images[0];
                    setActiveImage(mainImg.base64Data);
                    console.log("ffff:");
                    console.log(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
        checkFavoriteStatus();
    }, [id]);

    // Preluare Recenzii
    useEffect(() => {
        const fetchPropertyReviews = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/properties/${id}/reviews`);
                if (response.ok) {
                    const propertyReviews = await response.json();
                    setPropertyReviews(propertyReviews);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (id) fetchPropertyReviews();
    }, [id]);

    // Preluare Numar Recenzii
    useEffect(() => {
        const fetchReviewCount = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/reviews/property/${id}/count`);
                if (response.ok) {
                    const count = await response.json();
                    setReviewCount(count);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (id) fetchReviewCount();
    }, [id]);

    // Preluare Rating Mediu
    useEffect(() => {
        const fetchRatingCount = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/properties/${id}/average-rating`);
                if (response.ok) {
                    const data = await response.json();
                    setRatingCount(data.rating);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (id) fetchRatingCount();
    }, [id]);

    // Preluare Proprietăți Similare
    useEffect(() => {
        const fetchSimilarProperties = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/properties/${id}/similar`);
                if (response.ok) {
                    const data = await response.json();
                    setSimilarProperties(data);
                    console.log("Similare:");
                    console.log(data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (id) fetchSimilarProperties();
    }, [id]);

    const checkFavoriteStatus = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) return;
        try {
            const response = await fetch(`http://localhost:8080/api/favorites/check/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setIsFavorite(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFavoriteClick = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            alert("Trebuie să fii autentificat pentru a adăuga proprietăți la favorite!");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/favorites/toggle/${id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const updatedIsFavorite = await response.json();
                setIsFavorite(updatedIsFavorite);
            }
        } catch (err) {
            console.error(err);
        }
    };

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

    return (
        <div className="property-details-page">
            <Header isLoggedIn={!!localStorage.getItem('jwtToken')} />

            <main className="property-main-content">
                <div className="property-header-and-favorite">
                    <div className="property-header">
                        <h1>{property.title}</h1>
                    </div>

                    <div className="property-favorite" onClick={handleFavoriteClick}>
                        <p>Salvează</p>
                        <button
                            type="button"
                            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                            aria-label="Adaugă la favorite"
                        >
                            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {property.images && property.images.length > 0 && (
                    <>
                        <div className="new-property-gallery">
                            <div className="gallery-top">
                                <div className="gallery-main" onClick={() => setShowAllPhotos(true)}>
                                    <img src={property.images[0]?.base64Data} alt="Imagine principală" />
                                </div>
                                <div className="gallery-side">
                                    {property.images[1] && (
                                        <img src={property.images[1].base64Data} alt="Imagine laterală 1" onClick={() => setShowAllPhotos(true)} />
                                    )}
                                    {property.images[2] && (
                                        <img src={property.images[2].base64Data} alt="Imagine laterală 2" onClick={() => setShowAllPhotos(true)} />
                                    )}
                                </div>
                            </div>

                            <div className="gallery-bottom">
                                {property.images.slice(3, 8).map((img, index) => {
                                    const isLast = index === 4;
                                    const remainingPhotos = property.images.length - 8;

                                    return (
                                        <div
                                            key={img.id || index}
                                            className={`bottom-img-wrapper ${isLast ? 'last-image' : ''}`}
                                            onClick={() => setShowAllPhotos(true)}
                                        >
                                            <img src={img.base64Data} alt="Thumbnail" />
                                            {isLast && remainingPhotos > 0 && (
                                                <div className="overlay-text">
                                                    +{remainingPhotos} fotografii
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {showAllPhotos && (
                            <div className="all-photos-modal">
                                <div className="modal-header">
                                    <button className="close-modal-btn" onClick={() => setShowAllPhotos(false)}>
                                        <i className="fa-solid fa-arrow-left"></i> Înapoi la proprietate
                                    </button>
                                </div>
                                <div className="modal-content">
                                    {property.images.map((img, idx) => (
                                        <img key={img.id || idx} src={img.base64Data} alt={`Foto ${idx + 1}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="property-body">
                    <div className="property-info-left">

                        <div className="basic-info-row">
                            <span className="info-badge">
                                {propertyTypeTranslations[property.propertyType] || property.propertyType}
                            </span>
                            <span>•</span>
                            <span><i className="fa-solid fa-user-group"></i> Max {property.maxGuests} oaspeți</span>
                            <span>•</span>
                            <span><i className="fa-solid fa-door-open"></i> {property.rooms} camere</span>
                            <span>•</span>
                            <span><i className="fa-solid fa-bath"></i> {property.bathrooms} băi</span>
                        </div>

                        <div className="property-review-and-rating">
                            <div className="property-rating-summary">
                                <span className="rating-count">
                                    <TbStar />
                                    {ratingCount ? ratingCount : 'Nou'}
                                </span>
                            </div>
                            <span>•</span>
                            <div className="property-reviews-summary">
                                <span className="review-count">
                                    {reviewCount} {reviewCount === 1 ? 'recenzie' : 'recenzii'}
                                </span>
                            </div>
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

                <div className="reviews-section">
                    <div className="reviews-summary-header">
                        <div className="average-score-text">
                            {property.average_rating
                                ? Number(property.average_rating).toFixed(1)
                                : ratingCount
                                    ? Number(ratingCount).toFixed(1)
                                    : 'Nou'}
                        </div>
                        <div className="average-score-stars">
                            <img src={stars} alt="img1"></img>
                        </div>
                    </div>

                    <div className="reviews-header">
                        <TbStar style={categoryIconStyle} />
                        <h3>Recenzii</h3>
                    </div>

                    {reviews && reviews.length > 0 ? (
                        <div className="reviews-grid">
                            {reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <img
                                            src={review.renterProfilePicture || defaultAvatar}
                                            alt={review.renterFirstName}
                                            className="review-avatar"
                                        />
                                        <div className="review-author-info">
                                            <span className="review-author-name">
                                                {review.renterFirstName} {review.renterLastName}
                                            </span>
                                            <span className="review-date">
                                                {new Date(review.createdAt).toLocaleDateString('ro-RO', {
                                                    year: 'numeric',
                                                    month: 'long'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="review-rating-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <TbStar
                                                key={i}
                                                className={`review-star ${i < review.score ? 'filled' : 'empty'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-reviews-msg">
                            Această proprietate nu are încă recenzii.
                        </p>
                    )}
                </div>

                {/* SECȚIUNEA PROPRIETĂȚI SIMILARE */}
                <div className="similar-properties-section" >
                    <div className="similar-properties-header" >
                        <TbBuildingCommunity style={{ color: '#222222', fontSize: '28px' }} />
                        <span className="similar-property-title">
                            Proprietăți similare ({similarProperties.length})
                        </span>
                    </div>

                    {similarProperties.length > 0 ? (
                        <SimilarPropertiesCarousel
                            properties={similarProperties}
                            navigate={navigate}
                        />
                    ) : (
                        <p style={{ color: '#666' }}>Nu am găsit proprietăți similare pentru acest moment.</p>
                    )}
                </div>

            </main>
        </div>
    );
};

export default PropertyDetails;