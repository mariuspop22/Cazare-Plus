import React, { useState, useEffect } from 'react';
import Header from "./Header.jsx";
import './OwnerProperties.css';
import { API_BASE_URL } from './config';
import Footer from "./Footer";

const OwnerProperties = () => {
    const token = localStorage.getItem('jwtToken');
    const [properties, setProperties] = useState([]);
    const [OwnerPendingEdidedProperties, setOwnerPendingEdidedProperties] = useState([]);

    const [activeProperties, setactiveProperties] = useState([]);
    const [pendingProperties, setpendingProperties] = useState([]);
    const [rejectedProperties, setrejectedProperties] = useState([]);

    const [rejectionModalForPendingProperty, setRejectionModalForPendingProperty] = useState({
        isOpen: false,
        reason: '',
        propertyId: null
    });

    const [rejectionModalForPropertyModifications, setRejectionModalForPropertyModifications] = useState({
        isOpen: false,
        reason: '',
        propertyId: null
    });
    const fetchMyProperties = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/owner/profile/properties`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProperties(data);
        } catch (error) {
            console.error('Eroare la preluarea proprietăților:', error);
        }
    };

    const fetchOwnerPendingEdidedProperties = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/properties/owner/get-pending-edited-properties`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Eroare de la server: ${response.status}`);
            }
            const data = await response.json();
            setOwnerPendingEdidedProperties(data);
            console.log(data);
        } catch (error) {
            console.error('Eroare la preluarea modificărilor:', error);
        }
    };

    useEffect(() => {
        fetchMyProperties();
        fetchOwnerPendingEdidedProperties();
    }, []);

    useEffect(() => {
        setactiveProperties(properties.filter(item => item.status === "APPROVED"));
        setpendingProperties(properties.filter(item => item.status === "PENDING"));
        setrejectedProperties(properties.filter(item => item.status === "REJECTED"));
    }, [properties]);

    const openModalForPendingProperty = (reason, propertyId) => {
        setRejectionModalForPendingProperty({
            isOpen: true,
            reason: reason || 'Ne cerem scuze, dar cererea ta a fost respinsă fără un motiv specificat.',
            propertyId: propertyId
        });
    };

    const closeModalForPendingProperty = () => {
        setRejectionModalForPendingProperty({
            isOpen: false,
            reason: '',
            propertyId: null
        });
    };
    const openModalForPropertyModifications = (reason, propertyId) => {
        setRejectionModalForPropertyModifications({
            isOpen: true,
            reason: reason,
            propertyId: propertyId
        });
    };
    const closeModalForPropertyModifications = () => {
        setRejectionModalForPropertyModifications({
            isOpen: false,
            reason: '',
            propertyId: null
        });
    };
    const renderPropertyCard = (prop) => (
        <div
            key={prop.id}
            className="property-card-modern"
            style={{
                backgroundImage: `url(${
                    prop.mainImageBase64
                        ? (prop.mainImageBase64.startsWith('data:image')
                            ? prop.mainImageBase64
                            : `data:image/jpeg;base64,${prop.mainImageBase64}`)
                        : '/default-house.png'
                })`
            }}
        >
            {prop.status === 'PENDING' && (
                <div className="pending-badge">Pending</div>
            )}
            {prop.status === 'REJECTED' && (
                <div className="rejected-badge">Rejected</div>
            )}

            <div className="property-card-overlay">
                <h4 className="property-title-modern">{prop.title}</h4>

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
                        onClick={() => openModalForPendingProperty(prop.rejectionReason, prop.id)}
                    >
                        Vezi detalii
                    </button>
                )}

                {prop.status === 'PENDING' && (
                    <button className="edit-btn-modern" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>
                        În evaluare
                    </button>
                )}
                {prop.draftStatus === 'PENDING' && (
                    <button className="edit-btn-modern" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>
                        În evaluare
                    </button>
                )}

                {prop.draftStatus === 'REJECTED' && (
                    <button
                        className="reason-of-rejection"
                        onClick={() => openModalForPropertyModifications(prop.rejection_reason, prop.id)}
                    >
                        Vezi detalii
                    </button>
                )}
                {prop.draftStatus === 'REJECTED' && (
                    <div className="rejected-badge">Rejected</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="owner-properties-page">
            <Header isLoggedIn={!!token} />

            <div className="owner-properties-container">
                <div className="owner-properties-content">
               <div className="owner-active-properties">
                    <div className="section-header">
                        <h3>Proprietăți active ({activeProperties.length})</h3>
                        <button className="add-prop-btn" onClick={() => window.location.href = '/add-property'}>
                            + Adaugă Proprietate Nouă
                        </button>
                    </div>

                    {activeProperties.length === 0 ? (
                        <p className="no-props">Nu ai nicio proprietate activă.</p>
                    ) : (
                        <div className="properties-grid">
                            {activeProperties.map(renderPropertyCard)}
                        </div>
                    )}
                </div>

                <div className="owner-pending-properties">
                    <div className="section-header">
                        <h3>Proprietăți aflate în evaluare ({pendingProperties.length})</h3>
                    </div>
                    {pendingProperties.length === 0 ? (
                        <p className="no-props">Nu ai nicio proprietate în evaluare.</p>
                    ) : (
                        <div className="properties-grid">
                            {pendingProperties.map(renderPropertyCard)}
                        </div>
                    )}
                </div>

                <div className="owner-rejected-properties">
                    <div className="section-header">
                        <h3>Proprietăți respinse ({rejectedProperties.length})</h3>
                    </div>
                    {rejectedProperties.length === 0 ? (
                        <p className="no-props">Nu ai nicio proprietate respinsă.</p>
                    ) : (
                        <div className="properties-grid">
                            {rejectedProperties.map(renderPropertyCard)}
                        </div>
                    )}
                </div>

                <div className="owner-edided-properties">
                    <div className="section-header">
                        <h3>Modificări aflate în evaluare ({OwnerPendingEdidedProperties.length})</h3>
                    </div>
                    {OwnerPendingEdidedProperties.length === 0 ? (
                        <p className="no-props">Nu ai nicio modificare în evaluare.</p>
                    ) : (
                        <div className="properties-grid">
                            {OwnerPendingEdidedProperties.map(renderPropertyCard)}
                        </div>
                    )}
                </div>
            </div>

            {rejectionModalForPendingProperty.isOpen && (
                <div className="rejection-modal-overlay" onClick={closeModalForPendingProperty}>
                    <div className="rejection-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Motivul respingerii</h3>
                        <p>{rejectionModalForPendingProperty.reason}</p>

                        <div className="modal-actions-group">
                            <button className="btn-modal-close" onClick={closeModalForPendingProperty}>
                                X
                            </button>
                            <button
                                className="btn-modal-edit"
                                onClick={() => window.location.href = `/owner/edit-rejected-property/${rejectionModalForPendingProperty.propertyId}`}
                            >
                                Editează Acum
                            </button>
                        </div>
                    </div>
                </div>
            )}
                {rejectionModalForPropertyModifications.isOpen && (
                    <div className="rejection-modal-overlay" onClick={closeModalForPropertyModifications}>
                        <div className="rejection-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>Motivul respingerii</h3>
                            <p>{rejectionModalForPropertyModifications.reason}</p>

                            <div className="modal-actions-group">
                                <button className="btn-modal-close" onClick={closeModalForPropertyModifications}>
                                    X
                                </button>
                                <button
                                    className="btn-modal-edit"
                                    onClick={() => window.location.href = `/edit-property/${rejectionModalForPropertyModifications.propertyId}`}
                                >
                                    Editează Acum
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
            <Footer />

        </div>
    );
};

export default OwnerProperties;