import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import './AdminPendingProperties.css';

const AdminPendingEditedProperties= () =>{
    const [pendingEditedProperties,setPendingEditedProperties]= useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchPendingEditedProperties = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/properties/admin/get-pending-edited-properties');
            if (!response.ok) throw new Error('Eroare la preluarea datelor');

            const data = await response.json();
            setPendingEditedProperties(data);
            console.log("Pendind-Edited-Properties");
            console.log(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEditedProperties();
    }, []);

    return (
        <div className="admin-page-wrapper">
            <Header />

            <main className="admin-container">
                    <h2>Modificari  în așteptarea aprobării ({pendingEditedProperties.length})</h2>

                    {loading && <div className="admin-loading">Se încarcă cererile...</div>}

                    {error && <div className="admin-error">Eroare: {error}</div>}

                    {!loading && !error && pendingEditedProperties.length === 0 && (
                        <div className="admin-empty">Nu există nicio proprietate în stadiul PENDING.</div>
                    )}
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th></th>
                                <th>Detalii Cazare</th>
                                <th>Date Proprietar</th>

                            </tr>
                            </thead>
                            <tbody>
                            {pendingEditedProperties.map((property) => (
                                <tr key={property.id}>
                                    <td className="img-cell">
                                        {property.mainImageBase64 ? (
                                            <img
                                                src={`data:image/jpeg;base64,${property.mainImageBase64}`}
                                                alt={property.title}
                                                className="admin-prop-img"
                                            />
                                        ) : (
                                            <div className="no-img-placeholder">Fără poză</div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="prop-title">{property.title}</div>
                                        <div className="prop-type">{property.propertyType}</div>
                                        <Link to={`/admin/get-property-modifications-details/${property.id}`} className="view-details-link" target="_blank">
                                            Vezi toate detaliile ↗
                                        </Link>
                                    </td>

                                    <td>
                                        {property.owner ? (
                                            <>
                                                <div className="owner-name">{property.owner.firstName} {property.owner.lastName}</div>
                                                <div className="owner-contact">{property.owner.email}</div>
                                                <div className="owner-contact">{property.owner.telephoneNumber}</div>
                                            </>
                                        ) : (
                                            <span className="no-owner">Nespecificat</span>
                                        )}
                                    </td>


                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
            </main>
            <Footer/>
        </div>
    );

};
export default AdminPendingEditedProperties;