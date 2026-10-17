import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
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
import stars from "./assets/stars.png";

import './AdminPendingPropertyDetails.css';

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

const AdminPendingPropertyDetails = () => {
    const [PropertyDetails, setPropertyDetails] = useState([]);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const [PropertyFacilities, setPropertyFacilities] = useState([]);
    const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
    const [ownerApprovedProperties, setOwnerApprovedProperties] = useState([]);

    const [OwnerAvarageRatingAndReview, setAverageRatingAndReview] = useState({ averageRating: 0, totalReviews: 0 });

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const propertyTypeTranslations = {
        APARTMENT: 'APARTAMENT',
        CABIN: 'CASA',
        ROOM: 'CAMERA'
    };
    const [selectedImage, setSelectedImage] = useState(null);
    const [draftUpdateRejectedProperty,setDraftUpdateRejectedProperty]=useState(null);

    const fetchPropertyDetails = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/properties/${id}`);
            if (!response.ok) throw new Error('Eroare la preluarea datelor');

            const data = await response.json();
            if (data.owner) {
                setOwner(data.owner);
            }
            setPropertyDetails(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    const handleApprove = async () => {
        if (!window.confirm("Ești sigur că vrei să aprobi această proprietate?")) return;
        if (draftUpdateRejectedProperty){
            try {
                const payload = buildApprovalPayload();
                const response = await fetch(`http://localhost:8080/api/admin/properties/${id}/approve-rejected-property`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Eroare la aprobarea proprietății modificate (draft)');

                alert('Modificările au fost aprobate cu succes!');
                navigate('/admin/pending-properties');

            } catch (err) {
                alert(err.message);
            } finally {
                setActionLoading(false);
            }
        }else {
            setActionLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/admin/properties/${id}/approve`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'}
                });

                if (!response.ok) throw new Error('Eroare la aprobarea proprietății');

                alert('Proprietatea a fost aprobată cu succes!');
                navigate('/admin/pending-properties');
            } catch (err) {
                alert(err.message);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleReject = async (e) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            alert('Te rog să introduci motivul respingerii.');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/admin/properties/${id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectionReason })
            });

            if (!response.ok) throw new Error('Eroare la respingerea proprietății');

            alert('Proprietatea a fost respinsă, iar utilizatorul a fost notificat prin email.');
            setShowRejectModal(false);
            navigate('/admin/cereri-pending');
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };


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
        ...(Array.isArray(draftUpdateRejectedProperty?.selectedFacilities)
            ? draftUpdateRejectedProperty.selectedFacilities
            : []),
        ...(Array.isArray(draftUpdateRejectedProperty?.customFacilities)
            ? draftUpdateRejectedProperty.customFacilities
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




    const fetchDraftUpdatedRejectedProperty = async () => {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`http://localhost:8080/api/properties/pending-owner-update-rejected-property/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            if (response.status === 404 || response.status === 204) {
                setDraftUpdateRejectedProperty(null);
                return;
            }

            if (!response.ok) {
                throw new Error('Eroare la preluarea draftului');
            }

            const draft = await response.json();
            setDraftUpdateRejectedProperty(draft);
            console.log("Draft găsit:", draft);

        } catch (err) {
            console.error('Eroare fetch draft:', err.message);
            setDraftUpdateRejectedProperty(null);
        }
    };

    useEffect(() => {
        fetchDraftUpdatedRejectedProperty();
    }, [id]);


    const getCombinedImages = () => {
        let combined = [];

        if (PropertyDetails.images && PropertyDetails.images.length > 0) {
            combined = PropertyDetails.images.map(img => ({ ...img, isNewDraft: false }));
        }
        if (draftUpdateRejectedProperty && draftUpdateRejectedProperty.images) {
            const newImages = draftUpdateRejectedProperty.images.filter(img => img.isNew === true);
            newImages.forEach(img => {
                combined.push({ ...img, isNewDraft: true });
            });
        }

        return combined;
    };

    const displayImages = getCombinedImages();

    const buildApprovalPayload = () => {
        const newFacilitiesAdded = Object.values(groupedFacilities)
            .flatMap(category => category.items)
            .filter(item => item.isNew);

        const newImagesAdded = draftUpdateRejectedProperty?.images?.filter(img => img.isNew === true) || [];

        const payload = {
            title: draftUpdateRejectedProperty?.title ?? PropertyDetails.title,
            description: draftUpdateRejectedProperty?.description ?? PropertyDetails.description,
            propertyType: draftUpdateRejectedProperty?.propertyType ?? PropertyDetails.propertyType,

            pricePerNight: draftUpdateRejectedProperty?.pricePerNight ?? PropertyDetails.pricePerNight,
            maxGuests: draftUpdateRejectedProperty?.maxGuests ?? PropertyDetails.maxGuests,
            rooms: draftUpdateRejectedProperty?.rooms ?? PropertyDetails.rooms,
            bathrooms: draftUpdateRejectedProperty?.bathrooms ?? PropertyDetails.bathrooms,

            address: draftUpdateRejectedProperty?.address ?? PropertyDetails.address,
            city: draftUpdateRejectedProperty?.city ?? PropertyDetails.city,
            county: draftUpdateRejectedProperty?.county ?? PropertyDetails.county,
            country: draftUpdateRejectedProperty?.country ?? PropertyDetails.country,

            newFacilities: newFacilitiesAdded,
            newImages: newImagesAdded
        };

        return payload;
    };
    const payload=buildApprovalPayload();


    return (
        <div className="Pending-Property-Details">
            <Header />
            <div className="Pending-Property-Details-Page">

                <div className="Pending-Property-Details-container">
                    {draftUpdateRejectedProperty && (
                        <div className="rejected-property-reason-content">
                            <h3>Ați solicitat modificări pentru această proprietate</h3>
                            <p>  {draftUpdateRejectedProperty.reasonOfRejection}</p>
                            <p>Mai jos puteți consulta datele actualizate trimise de către proprietar.</p>
                        </div>
                    )}
                    <div className="Pending-Property-Details-page-content">

                        <div className="section-left">
                            <div className="general-details">
                                <h3>Detalii generale</h3>
                                <div className="general-details-row">
                                    <div className="title">Titlul Proprietății: {" "}</div>
                                    {!draftUpdateRejectedProperty || draftUpdateRejectedProperty.title === PropertyDetails?.title ? (
                                        <span className="general-details-value">{PropertyDetails?.title}</span>
                                    ) : (
                                        <div className="general-details-updated">
                                            <span className="general-details-value">{draftUpdateRejectedProperty?.title}</span>
                                            <span className="icon-new">nou</span>
                                        </div>
                                    )}
                                </div>

                                <div className="general-details-row">
                                    <div className="title">Tipul Proprietății:</div>
                                    {!draftUpdateRejectedProperty || draftUpdateRejectedProperty.propertyType === PropertyDetails?.propertyType ? (
                                        <span className="general-details-value">
                                     {propertyTypeTranslations[PropertyDetails?.propertyType]}
                                           </span>
                                    ) : (
                                        <div className="general-details-updated">
                                     <span className="general-details-value">
                                  {propertyTypeTranslations[draftUpdateRejectedProperty?.propertyType] || draftUpdateRejectedProperty?.propertyType}
                                     </span>
                                            <span className="icon-new">nou</span>
                                        </div>
                                    )}
                                </div>

                                <h4 className="general-details-row-description">
                                    <div className="title"> Descrierea Proprietati: </div>
                                    {!draftUpdateRejectedProperty || draftUpdateRejectedProperty.description === PropertyDetails?.description ?(

                                        <p className="Property-description" style={{ whiteSpace: 'pre-line' }}>
                                            {PropertyDetails.description}
                                        </p>

                                    ) : (

                                        <p className="updated-property-description" style={{ whiteSpace: 'pre-line' }}>
                                            {draftUpdateRejectedProperty?.description}
                                            <span className="icon-new">nou</span>
                                        </p>
                                    )
                                    }</h4>

                            </div>
                            <div className="property-price-capacity">
                                <h3>Capacitate si Pret</h3>
                                <div className="Property-info-row">
                                    <div className="details-row">
                                        <div className="title"> Pret pe noapte (Ron) :</div> {
                                        !draftUpdateRejectedProperty || draftUpdateRejectedProperty.pricePerNight === PropertyDetails?.pricePerNight ? (
                                            <span className="details-value">{PropertyDetails.pricePerNight}</span>
                                        ) : (
                                            <div className="details-updated">
                                                <span className="details-value">{draftUpdateRejectedProperty?.pricePerNight}</span>
                                                <span className="icon-new">nou</span>
                                            </div>

                                        )
                                    }</div>
                                    <div className="details-row">
                                        <div className="title">  Oaspeți maximi : </div>
                                        {!draftUpdateRejectedProperty || draftUpdateRejectedProperty.maxGuests === PropertyDetails?.maxGuests ? (
                                            <span className="details-value">{PropertyDetails.maxGuests}</span>
                                        ): (
                                            <div className="details-updated">
                                                <span className="details-value">{draftUpdateRejectedProperty.maxGuests}</span>
                                                <span className="icon-new">nou</span>
                                            </div>
                                        )
                                        }
                                    </div>
                                    <div  className="details-row">
                                        <div className="title">  Numar camere : </div>
                                        {!draftUpdateRejectedProperty || draftUpdateRejectedProperty.rooms === PropertyDetails?.rooms ? (
                                            <span className="details-value">{PropertyDetails.rooms}</span>
                                        ):(
                                            <div className="details-updated">
                                                <span className="details-value">{ draftUpdateRejectedProperty.rooms}</span>
                                                <span className="icon-new">nou</span>
                                            </div>
                                        )}
                                    </div>
                                    <div  className="details-row">
                                        <div className="title"> Numar bai : </div>
                                        {!draftUpdateRejectedProperty || draftUpdateRejectedProperty.bathrooms === PropertyDetails?.bathrooms ? (
                                            <span className="details-value">{PropertyDetails.bathrooms}</span>
                                        ) :(
                                            <div className="details-updated">
                                                <span className="details-value">{draftUpdateRejectedProperty.bathrooms}</span>
                                                <span className="icon-new">nou</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="property-location-info">
                                <h3>Locatie</h3>
                                <div  className="details-row">
                                    <div className="title"> Adresa : </div>
                                    {
                                        !draftUpdateRejectedProperty || draftUpdateRejectedProperty.address === PropertyDetails?.address ? (
                                            <span  className="details-value">{PropertyDetails.address}</span>
                                        ) : (
                                            <div className="details-updated">
                                                <span className="details-value">{draftUpdateRejectedProperty.address}</span>
                                                <span className="icon-new">nou</span>
                                            </div>
                                        )

                                    }</div>
                                <div className="Property-info-row">
                                    <div className="Property-info-row-details">
                                        <div  className="details-row">
                                            <div className="title"> Județ : </div>
                                            {
                                                !draftUpdateRejectedProperty || draftUpdateRejectedProperty.city === PropertyDetails?.city ? (
                                                    <span className="details-value">{PropertyDetails.city}</span>
                                                ):(
                                                    <div className="details-updated">
                                                        <span className="details-value">{draftUpdateRejectedProperty.city}</span>
                                                        <span className="icon-new">nou</span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    <div className="Property-info-row-details">
                                        <div className="details-row">
                                            <div className="title"> Oraș :</div>
                                            {
                                                !draftUpdateRejectedProperty || draftUpdateRejectedProperty.county === PropertyDetails?.county ?(
                                                    <span className="details-value">{PropertyDetails.county}</span>
                                                ) :(
                                                    <div className="details-updated">
                                                        <span className="details-value">{draftUpdateRejectedProperty.county}</span>
                                                        <span className="icon-new">nou</span>

                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                    <div className="Property-info-row-details">
                                        <div className="details-row">
                                            <div className="title"> Țară:</div>
                                            {
                                                !draftUpdateRejectedProperty || draftUpdateRejectedProperty.country === PropertyDetails?.country ? (
                                                    <span className="details-value">{PropertyDetails.country}</span>
                                                ) : (
                                                    <div className="details-updated">
                                                        <span className="details-value">{draftUpdateRejectedProperty.country}</span>
                                                        <span className="icon-new">nou</span>
                                                    </div>
                                                )
                                            }</div>
                                    </div>
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
                        </div>
                    </div>
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
            <Footer />
        </div>
    );
};

export default AdminPendingPropertyDetails;