import React, { useState, useEffect } from 'react';
import Header from "./Header.jsx";
import './OwnerProperties.css';

const OwnerProperties = () => {
    const token = localStorage.getItem('jwtToken');
    const [properties, setProperties] = useState([]);

    // State pentru modal (include motivul și ID-ul proprietății)
    const [rejectionModal, setRejectionModal] = useState({
        isOpen: false,
        reason: '',
        propertyId: null
    });

    const fetchMyProperties = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/owner/profile/properties', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProperties(data);
        } catch (error) {
            console.error('Eroare la preluarea proprietăților:', error);
        }
    };

    useEffect(() => {
        fetchMyProperties();
    }, []);

    const openModal = (reason, propertyId) => {
        setRejectionModal({
            isOpen: true,
            reason: reason || 'Ne cerem scuze, dar cererea ta a fost respinsă fără un motiv specificat.',
            propertyId: propertyId
        });
    };

    const closeModal = () => {
        setRejectionModal({
            isOpen: false,
            reason: '',
            propertyId: null
        });
    };

    return (
        <div className="owner-properties-page">
            <Header isLoggedIn={!!token} />

            <div className="owner-properties-container">
                <div className="owner-properties-section">
                    <div className="section-header">
                        <h3>Proprietățile mele ({properties.length})</h3>
                        <button className="add-prop-btn" onClick={() => window.location.href = '/add-property'}>
                            + Adaugă Proprietate Nouă
                        </button>
                    </div>

                    {properties.length === 0 ? (
                        <p className="no-props">Nu ai nicio proprietate adăugată pentru închiriere.</p>
                    ) : (
                        <div className="properties-grid">
                            {properties.map((prop) => (
                                <div
                                    key={prop.id}
                                    className="property-card-modern"
                                    style={{
                                        backgroundImage: `url(${prop.mainImageBase64 || '/default-house.png'})`
                                    }}
                                >
                                    {/* Badges */}
                                    {prop.status === 'PENDING' && (
                                        <div className="pending-badge">Pending</div>
                                    )}
                                    {prop.status === 'REJECTED' && (
                                        <div className="rejected-badge">Rejected</div>
                                    )}

                                    <div className="property-card-overlay">
                                        <h4 className="property-title-modern">{prop.title}</h4>

                                        {/* Butoane acțiune în funcție de status */}
                                        {prop.status === 'APPROVED' && (
                                            <button
                                                className="edit-btn-modern"
                                                onClick={() => window.location.href = `/edit-property/${prop.id}`}
                                            >
                                                Editează
                                            </button>
                                        )}

                                        {prop.status === 'REJECTED' && (
                                            <button
                                                className="reason-of-rejection"
                                                onClick={() => openModal(prop.rejectionReason, prop.id)}
                                            >
                                                Vezi detalii
                                            </button>
                                        )}

                                        {prop.status === 'PENDING' && (
                                            <button className="edit-btn-modern" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>
                                                În evaluare
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {rejectionModal.isOpen && (
                <div className="rejection-modal-overlay" onClick={closeModal}>
                    <div className="rejection-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Motivul respingerii</h3>
                        <p>{rejectionModal.reason}</p>

                        <div className="modal-actions-group">
                            <button className="btn-modal-close" onClick={closeModal}>
                                X
                            </button>

                            <button
                                className="btn-modal-edit"
                                onClick={() => window.location.href = `/owner/edit-rejected-property/${rejectionModal.propertyId}`}
                            >
                                Editează Acum
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerProperties;