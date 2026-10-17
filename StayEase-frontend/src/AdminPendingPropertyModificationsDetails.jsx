import Header from './Header.jsx';
import Footer from './Footer.jsx';
import "./AdminPendingPropertyModificationsDetails.css";
import { useParams, Link, useNavigate } from 'react-router-dom';

import {
    TbSmokingNo,
    TbBan,
    TbToolsKitchen2,
    TbParking,
    TbBell,
    TbTree,
    TbStar,
    TbInfoCircle,
    TbBuildingCommunity,
    TbCheck,
    TbX
} from 'react-icons/tb';

import React, {useEffect, useState} from "react";
import stars from "./assets/stars.png";

const AdminPendingPropertyModificationsDetails=() => {
    const categoryIconStyle = {
        fontSize: '22px',
        marginRight: '8px',
        color: '#333',
        display: 'inline-flex',
        alignItems: 'center'
    };

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
    const [draftPropertyModifications,setDraftPropertyModification]=useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [owner,setOwner]=useState(null);
    const [PropertyFacilities, setPropertyFacilities] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
    const [ownerApprovedProperties, setOwnerApprovedProperties] = useState([]);

    const [OwnerAvarageRatingAndReview, setAverageRatingAndReview] = useState({ averageRating: 0, totalReviews: 0 });
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    const propertyTypeTranslations = {
        APARTMENT: 'APARTAMENT',
        CABIN: 'CASA',
        ROOM: 'CAMERA'
    };
    const fetchDraftPropertyModifications = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/properties/admin/get-property-modifications-details/${id}`);
            if (!response.ok) throw new Error('Eroare la preluarea datelor');
            const data = await response.json();
            console.log("Draft gasit:");
            console.log(data);
            setDraftPropertyModification(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchDraftPropertyModifications();
    }, []);

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/properties/${id}`);
                if (!response.ok) throw new Error('Nu am putut încărca datele proprietății.');

                const data = await response.json();
                console.log("Datele proprietati:");
                console.log(data);
                setProperty(data);
                if (data.owner) setOwner(data.owner);
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

    const fetchPropertyFacilities = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/facilities/property/${id}`);
            if (!response.ok) throw new Error('Eroare la preluarea datelor');

            const data = await response.json();
            setPropertyFacilities(data);
            console.log("Datele proprietati");
            console.log(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPropertyFacilities();
    }, [id]);

    const fetchOwnerApprovedProperties = async (ownerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/owner/${ownerId}/properties`);
            if (!response.ok) throw new Error('Eroare la preluarea datelor');
            const data = await response.json();
            setOwnerApprovedProperties(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (owner && owner.id) {
            fetchOwnerApprovedProperties(owner.id);
        }
    }, [owner]);

    const fetchOwnerAvarageRatingAndReview = async (ownerId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/owner/${ownerId}/stats`);
            if (!response.ok) throw new Error('Eroare la preluarea datelor');
            const data = await response.json();
            setAverageRatingAndReview(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (owner && owner.id) {
            fetchOwnerAvarageRatingAndReview(owner.id);
        }
    }, [owner]);


    const groupedFacilities = {};

    const getCategoryName = (item) => {
        const category =
            item?.categoryName ??
            item?.category?.name ??
            item?.category;

        if (typeof category !== "string") {
            return "";
        }

        const name = category.trim();

        return name && name !== "undefined" && name !== "null"
            ? name
            : "";
    };

    const getFacilityName = (item) => {
        const facility =
            item?.facility ??
            item?.facilityName ??
            item?.name;

        if (typeof facility !== "string") {
            return "";
        }

        const name = facility.trim();

        return name && name !== "undefined" && name !== "null"
            ? name
            : "";
    };

    PropertyFacilities.forEach((item) => {
        const categoryName = getCategoryName(item);
        const facilityName = getFacilityName(item);

        if (!categoryName || !facilityName) {
            console.warn("Facilitate existentă invalidă:", item);
            return;
        }

        if (!groupedFacilities[categoryName]) {
            groupedFacilities[categoryName] = {
                items: []
            };
        }

        groupedFacilities[categoryName].items.push({
            ...item,
            facility: facilityName,
            isOriginal: true
        });
    });

    const allDraftFacilities = [
        ...(Array.isArray(draftPropertyModifications?.selectedFacilities)
            ? draftPropertyModifications.selectedFacilities
            : []),
        ...(Array.isArray(draftPropertyModifications?.customFacilities)
            ? draftPropertyModifications.customFacilities
            : [])
    ];

    allDraftFacilities.forEach((draftItem) => {
        const categoryName = getCategoryName(draftItem);
        const facilityName = getFacilityName(draftItem);

        if (!categoryName || !facilityName) {
            console.warn("Facilitate din modificări invalidă:", draftItem);
            return;
        }

        if (!groupedFacilities[categoryName]) {
            groupedFacilities[categoryName] = {
                items: []
            };
        }

        const exists = groupedFacilities[categoryName].items.some(
            (oldItem) =>
                oldItem.facility === facilityName && oldItem.isOriginal
        );

        if (!exists) {
            groupedFacilities[categoryName].items.push({
                ...draftItem,
                facility: facilityName,
                isNew: true
            });
        }
    });

    const standardCategories = Object.entries(groupedFacilities)
        .filter(([categoryName]) => Boolean(categoryName));

    const customCategories = [];


    const getCombinedImages = () => {
        let combined = [];
        if (property?.images && property.images.length > 0) {
            combined = property.images.map(img => ({
                ...img,
                isNewDraft: false
            }));
        }
        if (draftPropertyModifications?.images) {
            const newImages = draftPropertyModifications.images.filter(
                img => img.isNew === true
            );
            newImages.forEach(img => {
                combined.push({
                    ...img,
                    isNewDraft: true
                });
            });
        }
        return combined;
    };


    const displayImages = getCombinedImages();
    const buildApprovalPayload = () => {
        const newFacilitiesAdded = Object.values(groupedFacilities)
            .flatMap(category => category.items)
            .filter(item => item.isNew);

        const newImagesAdded = draftPropertyModifications?.images?.filter(img => img.isNew === true) || [];

        const payload = {
            title: draftPropertyModifications?.title ?? property.title,
            description: draftPropertyModifications?.description ?? property.description,
            propertyType: draftPropertyModifications?.propertyType ?? property.propertyType,

            pricePerNight: draftPropertyModifications?.pricePerNight ?? property.pricePerNight,
            maxGuests: draftPropertyModifications?.maxGuests ?? property.maxGuests,
            rooms: draftPropertyModifications?.rooms ?? property.rooms,
            bathrooms: draftPropertyModifications?.bathrooms ?? property.bathrooms,

            address: draftPropertyModifications?.address ?? property.address,
            city: draftPropertyModifications?.city ?? property.city,
            county: draftPropertyModifications?.county ?? property.county,
            country: draftPropertyModifications?.country ?? property.country,

            newFacilities: newFacilitiesAdded,
            newImages: newImagesAdded
        };

        return payload;
    };
    const handleApprove = async () => {
        if (!window.confirm("Ești sigur că vrei să aprobi aceste modificări?")) {
            return;
        }

        setActionLoading(true);

        try {
            const payload = buildApprovalPayload();

            console.log("1. Apăsare pe Aprobare");
            console.log("2. ID proprietate:", id);
            console.log("3. Payload trimis:", payload);

            const response = await fetch(
                `http://localhost:8080/api/properties/admin/approve-property-modifications/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const responseText = await response.text();

            console.log("4. Status HTTP:", response.status);
            console.log("5. Răspuns backend:", responseText);

            if (!response.ok) {
                throw new Error(
                    `Eroare HTTP ${response.status}: ${responseText}`
                );
            }

            alert("Modificările au fost aprobate cu succes!");
            navigate("/admin/pending-edited-properties");

        } catch (err) {
            console.error("Eroare la aprobarea modificărilor:", err);
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };


        return(
    <div className="Property-modifications-details-page">
      <Header/>

    <div className="property-modifications-details-page-container">
        <div className="property-modifications-details-page-content">
<div className="section-left-and-section-right">
            <div className="section-left">
                <div className="property-general-details">
                    <h3 className="subtitle">Detalii generale</h3>
                    <div className="property-row-details">
                        <div className="title">Titlul Proprietății: {" "}</div>
                        { draftPropertyModifications.title === property?.title ? (
                            <span className="general-details-value">{property?.title}</span>
                        ) : (
                            <div className="general-details-updated">

                                <div className="before-value">
                                    <span className="general-details-value">{property?.title}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="general-details-value">{draftPropertyModifications?.title}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="property-row-details">
                        <div className="title">Tipul Proprietății:</div>
                        { draftPropertyModifications.propertyType === property?.propertyType ? (
                            <span className="general-details-value">{propertyTypeTranslations[property?.propertyType]}</span>
                        ) : (
                            <div className="general-details-updated">

                                <div className="before-value">
                                    <span className="general-details-value">{propertyTypeTranslations[property?.propertyType]}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="general-details-value">{draftPropertyModifications?.propertyType}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="property-row-details-description">
                        <div className="title">Descrierea Proprietății: {" "}</div>
                        { draftPropertyModifications.description === property?.description ? (
                            <p className="general-details-value" style={{ whiteSpace: 'pre-line' }}>{property?.description}</p>
                        ) : (
                            <div className="general-details-updated">

                                <div className="before-value">
                                    <p className="general-details-value" style={{ whiteSpace: 'pre-line' }}>{property?.description}</p>

                                </div>
                                <div className="after-modifications-value">

                                    <p className="general-details-value" style={{ whiteSpace: 'pre-line' }}>{draftPropertyModifications?.description}</p>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
                <div className="property-price-capacity">
                    <h3 className="subtitle">Capacitate si Pret</h3>
                    <div className="property-row-details">
                        { draftPropertyModifications.pricePerNight === property?.pricePerNight ? (
                            <span className="details-value-unmodified">Pret pe noapte (Ron): {property?.pricePerNight}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Pret pe noapte (Ron): {property?.pricePerNight}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value"> Pret pe noapte (Ron): {draftPropertyModifications?.pricePerNight}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="property-row-details">
                        { draftPropertyModifications.maxGuests === property?.maxGuests ? (
                            <span className="details-value-unmodified">Oaspeți maximi : {property?.maxGuests}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Oaspeți maximi : {property?.maxGuests}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value">Oaspeți maximi: {draftPropertyModifications?.maxGuests}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="property-row-details">
                        { draftPropertyModifications.rooms === property?.rooms ? (
                            <span className="details-value-unmodified">Numar camere : {property?.rooms}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Numar camere : {property?.rooms}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value">Numar camere : {draftPropertyModifications?.rooms}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="property-row-details">
                        { draftPropertyModifications.bathrooms === property?.bathrooms ? (
                            <span className="details-value-unmodified">Numar bai : {property?.bathrooms}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Numar bai : {property?.bathrooms}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value">Numar bai : {draftPropertyModifications?.bathrooms}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="property-location-info">
                    <h3 className="subtitle">Locatie</h3>
                    <div className="property-row-details">
                        { draftPropertyModifications.address === property?.address ? (
                            <span className="details-value-unmodified">Adresa : {property?.address}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Adresa : {property?.address}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value">Adresa : {draftPropertyModifications?.address}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="property-row-details">
                        { draftPropertyModifications.county === property?.county ? (
                            <span className="details-value-unmodified">Județ : {property?.county}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Județ  : {property?.county}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value">Județ  : {draftPropertyModifications?.county}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="property-row-details">
                        { draftPropertyModifications.city === property?.city ? (
                            <span className="details-value-unmodified">Oraș : {property?.city}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Oraș : {property?.city}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value">Oraș  : {draftPropertyModifications?.city}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="property-row-details">
                        { draftPropertyModifications.country === property?.country ? (
                            <span className="details-value-unmodified">Țară : {property?.country}</span>
                        ) : (
                            <div className="details-updated">

                                <div className="before-value">
                                    <span className="details-value"> Țară : {property?.country}</span>

                                </div>
                                <div className="after-modifications-value">

                                    <span className="details-value">Țară  : {draftPropertyModifications?.country}</span>
                                    <span className="icon-new">nou</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            <div className="section-right">
                <h3>Facilități proprietate</h3>

                {standardCategories.map(([categoryName, group]) => (
                    <div key={categoryName} className="facility-category">
                        <h4 className="category-title">
                            {categoryIcons[categoryName] || <TbInfoCircle style={categoryIconStyle} />}
                            <span>{categoryName}</span>
                        </h4>
                        <ul className="facility-list">
                            {group.items.map((item, idx) => (
                                <li key={idx} className="facility-item">
                                    <span className="facility-name">{item.facility}</span>

                                    {(item._custom_facility || item._custom_category_and_custom_facility) && (
                                        <span className="custom-badge">custom</span>
                                    )}

                                    {item.isNew && (
                                        <span className="icon-new">nou</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {customCategories.map(([categoryName, group]) => (
                    <div key={categoryName} className="facility-category custom-category">
                        <h4 className="category-title">
                            {categoryIcons[categoryName] || <TbInfoCircle style={categoryIconStyle} />}
                            <span>{categoryName}</span>
                            <span className="custom-badge">custom</span>
                        </h4>
                        <ul className="facility-list">
                            {group.items.map((item, idx) => (
                                <li key={idx} className="facility-item">
                                    <span className="facility-name">{item.facility}</span>
                                    <span className="custom-badge">custom</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
</div>
            <div className="property-images-section">
                <h3>Imagini Proprietate</h3>
                <div className="images-grid">
                    {displayImages.length > 0 ? (
                        displayImages.map((image, index) => (
                            <div
                                key={image.id || `new-img-${index}`}
                                className="image-wrapper"
                            >
                                <img
                                    src={image.base64Data}
                                    alt={`Imagine ${index + 1}`}
                                    className={`property-image ${image.isNewDraft ? 'new-draft' : ''}`}
                                    onClick={() => setSelectedImage(image.base64Data)}
                                />
                                {image.isNewDraft && (
                                    <span className="icon-new icon-new-overlay">nou</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="no-images-text">Nu există imagini disponibile pentru această proprietate.</p>
                    )}
                    {selectedImage && (
                        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                            <span className="close-modal-btn" onClick={() => setSelectedImage(null)}>&times;</span>
                            <img
                                src={selectedImage}
                                alt="Imagine marita"
                                className="modal-image-full"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="owner-approved-propertie">
                <div className="owner-approved-properties-title">
                    <TbBuildingCommunity style={{ color: '#222222', fontSize: '25px' }} />
                    <h3>Proprietăți active ale lui {owner ? `${owner.firstName} ${owner.lastName}` : ''}</h3>
                </div>

                <div className="owner-approved-propertie-container">
                    {ownerApprovedProperties && ownerApprovedProperties.length > 0 ? (
                        ownerApprovedProperties.map((prop) => (
                            <Link
                                to={`/property/${prop.id}`}
                                key={prop.id}
                                className="approved-property-card"
                            >
                                <div className="approved-property-image-container">
                                    <img
                                        src={prop.mainImageBase64 || "https://via.placeholder.com/300x300?text=Fara+Imagine"}
                                        alt={prop.title}
                                        className="approved-property-image"
                                    />
                                </div>
                                <div className="approved-property-title">
                                    {prop.title}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>Nu există alte proprietăți active pentru acest proprietar.</p>
                    )}
                </div>
            </div>

            {owner && (
                <div className="property-owner-summary-admin-page">
                    <div className="property-owner-details">
                        <img
                            src={owner.profilePictureBase64 || defaultAvatar}
                            alt="Proprietar"
                            className="owner-avatar-small"
                        />
                        <div className="owner-summary-text owner-summary-text-admin-page">
                            <span className="owner-name-small">{owner.firstName} {owner.lastName}</span>
                            <span className="owner-label-small-admin-page">Proprietarul spațiului</span>
                        </div>
                    </div>

                    <div className="Average-Rating-and-Reviews">
                        <div className="Average-Rating">
                            <h4>{(OwnerAvarageRatingAndReview?.averageRating ?? 0).toFixed(2)}</h4>
                            <div className="average-score-stars">
                                <img src={stars} alt="stars" />
                            </div>
                        </div>
                        <div className="Average-Reviews">
                            <h4>{OwnerAvarageRatingAndReview?.totalReviews ?? 0} Reviews</h4>
                        </div>
                    </div>
                </div>
            )}
            <div className="admin-action-banner">
                <div className="admin-action-info">
                    <h3>Acțiuni Administrator</h3>
                    <p>Verifică detaliile de mai sus și decide starea acestei proprietăți.</p>
                </div>
                <div className="admin-action-buttons">
                    <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="admin-btn-approve"
                    >
                        <TbCheck size={18} /> Aprobă
                    </button>
                    <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        className="admin-btn-reject"
                    >
                        <TbX size={18} /> Respinge
                    </button>
                </div>
            </div>

            {showRejectModal && (
                <div className="image-modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="reject-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Motivul respingerii</h3>
                        <p>Te rog să specifici motivul pentru care respingi această proprietate. Acesta va fi trimis proprietarului pe email.</p>
                        <form onSubmit={handleReject}>
                                    <textarea
                                        rows="4"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Introdu motivul aici..."
                                        required
                                    />
                            <div className="reject-modal-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="admin-btn-cancel"
                                >
                                    Anulează
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="admin-btn-submit-reject"
                                >
                                    Trimite și Respinge
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    </div>

        <Footer/>
    </div>

);
};
export default AdminPendingPropertyModificationsDetails;