import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import Header from "./Header.jsx";
import Footer from "./Footer";
import './SelectPropertyForManagingAvailability.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const SelectPropertyForManagingAvailability = () => {
    const [OwnerProperties,setOwnerProperties]=useState([]);
    const token = localStorage.getItem('jwtToken');
        const fetchOwnerProperties = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/owner/profile/properties`, {
                    headers: {'Authorization': `Bearer ${token}`}
                });
                const data = await response.json();
                const filteredProperties = data.filter(prop => prop.status === "APPROVED");
                setOwnerProperties(filteredProperties);

            } catch (error) {
                console.error('Eroare la preluarea proprietăților:', error);
            }
        };
    useEffect(() => {
        fetchOwnerProperties();

    }, []);



    return (
        <div className="manage-properties-availability-page">
            <Header isLoggedIn={!!token} />
        <div className="properties-container">
            <div className="properties-content">
                <h3>Adăugare indisponibilitate: Selectează proprietatea</h3>

                 <div className="properties-grid">
                     {OwnerProperties.map((property) => (
                         <Link to={`/owner/manage-availability/${property.id}`}
                               key={property.id}
                               style={{ textDecoration: 'none', color: 'inherit' }}>
                         <div
                             className="property-card-modern"
                             style={{
                                 backgroundImage: `url(${property.mainImageBase64})`
                             }}
                         >
                             <div className="property-card-overlay">
                                 <h4 className="property-title-modern">
                                   {property.title}
                                 </h4>
                             </div>


                         </div>
                         </Link>
                     ))}
                 </div>
            </div>

        </div>
            <Footer/>
        </div>
    );

};export default  SelectPropertyForManagingAvailability;