import React, { useState, useEffect } from 'react';
import './OwnerProfile.css';
import Header from "./Header.jsx";

const OwnerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);

    const token = localStorage.getItem('jwtToken');
    const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
    const [properties, setProperties] = useState([]);

    const fetchMyProperties = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/owner/profile/properties', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProperties(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/owner/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setProfile(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                telephoneNumber: data.telephoneNumber || '',
                address: data.address || '',
                bio: data.bio || ''
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchMyProperties();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updateData = new FormData();
        updateData.append('firstName', formData.firstName);
        updateData.append('lastName', formData.lastName);
        updateData.append('email', formData.email);
        updateData.append('telephoneNumber', formData.telephoneNumber);
        updateData.append('address', formData.address);
        updateData.append('bio', formData.bio);
        if (file) updateData.append('profilePicture', file);

        try {
            await fetch('http://localhost:8080/api/owner/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: updateData
            });
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            console.error(error);
        }
    };

    if (!profile) return (
        <>
            <Header isLoggedIn={!!token} />
            <div style={{ textAlign: 'center', marginTop: '50px' }}>Se încarcă...</div>
        </>
    );

    return (
        <>
            <Header isLoggedIn={!!token} />

            <div className="owner-profile-container">
                <h2>Profilul meu</h2>

                {!profile.profileComplete && !isEditing && (
                    <div className="alert-banner">
                        Te rugăm să îți completezi profilul pentru a putea lista proprietăți și a atrage mai mulți clienți!
                    </div>
                )}

                <div className="profile-card">
                    <div className="profile-header">
                        <img
                            src={profile.profilePictureBase64 || defaultAvatar}
                            alt="Profil"
                            className="profile-picture"
                        />
                        <div>
                            <h3>{profile.firstName} {profile.lastName}</h3>
                            <p>{profile.email}</p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="profile-details">
                            <div className="profile-detail-row">
                                <strong>Telefon:</strong>
                                <span>{profile.telephoneNumber || 'Necompletat'}</span>
                            </div>
                            <div className="profile-detail-row">
                                <strong>Adresă:</strong>
                                <span>{profile.address || 'Necompletat'}</span>
                            </div>
                            <div className="profile-detail-row">
                                <strong>Bio:</strong>
                                <span>{profile.bio || 'Necompletat'}</span>
                            </div>
                            <button onClick={() => setIsEditing(true)}>Editează Datele</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <label>Prenume:</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />

                            <label>Nume de familie:</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />

                            <label>Email:</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' }}/>

                            <label>Telefon:</label>
                            <input type="text" name="telephoneNumber" value={formData.telephoneNumber} onChange={handleInputChange} />

                            <label>Adresă:</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} />

                            <label>Bio:</label>
                            <textarea name="bio" value={formData.bio} onChange={handleInputChange}></textarea>

                            <label>Poză de profil:</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} />

                            <div className="form-actions">
                                <button type="submit">Salvează Modificările</button>
                                <button type="button" onClick={() => setIsEditing(false)}>Anulează</button>
                            </div>
                        </form>
                    )}
                </div>
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
                                    <div className="property-card-overlay">
                                        <h4 className="property-title-modern">{prop.title}</h4>

                                        <button
                                            className="edit-btn-modern"
                                            onClick={() => window.location.href = `/edit-property/${prop.id}`}
                                        >
                                            Editează
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OwnerProfile;