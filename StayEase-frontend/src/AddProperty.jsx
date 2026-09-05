import React, { useState, useEffect } from 'react';
import './AddProperty.css';
import Header from "./Header.jsx";

const AddProperty = () => {
    // === 1. TOATE STĂRILE TREBUIE SĂ FIE AICI, ÎN INTERIOR ===

    const [formData, setFormData] = useState({
        title: '',
        property_type: 'Apartament',
        description: '',
        price_per_night: '',
        rooms: '',
        bathrooms: '',
        max_guests: '',
        address: '',
        city: '',
        county: '',
        country: 'România',
        status: 'PENDING'
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [standardFacilities, setStandardFacilities] = useState([]);
    const [selectedFacilities, setSelectedFacilities] = useState([]);

    const [customInputs, setCustomInputs] = useState({});

    const [newCategoryName, setNewCategoryName] = useState('');
    const isAuthenticated = !!localStorage.getItem('jwtToken');
    useEffect(() => {
        fetch("http://localhost:8080/api/facilities/grouped")
            .then(response => response.json())
            .then(data => {
                console.log("Date primite de la backend:", data);
                setStandardFacilities(data);
            })
            .catch(error => console.error("A apărut o eroare la fetch:", error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const updatedData = { ...prevData, [name]: value };
            if (name === 'property_type' && value === 'Cameră') {
                updatedData.rooms = '1';
                updatedData.bathrooms = '1';
            } else if (name === 'property_type' && value !== 'Cameră') {
                updatedData.rooms = '';
                updatedData.bathrooms = '';
            }
            return updatedData;
        });
    };

    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);

        if (newFiles.length === 0) return;

        setImages((prevImages) => [...prevImages, ...newFiles]);

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

        e.target.value = null;
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));

        URL.revokeObjectURL(imagePreviews[indexToRemove]);

        setImagePreviews((prevPreviews) => prevPreviews.filter((_, index) => index !== indexToRemove));
    };

    const handleFacilityCheckboxChange = (facilityId) => {
        setSelectedFacilities((prevSelected) => {
            if (prevSelected.includes(facilityId)) {
                return prevSelected.filter(id => id !== facilityId);
            } else {
                return [...prevSelected, facilityId];
            }
        });
    };

    const handleCustomInputChange = (categoryId, value) => {
        setCustomInputs((prev) => ({
            ...prev,
            [categoryId]: value
        }));
    };

    const handleAddCustomFacility = (categoryId) => {
        const facilityName = customInputs[categoryId]?.trim();
        if (!facilityName) return;

        const tempId = `custom-${categoryId}-${Date.now()}`;

        const newFacility = {
            id: tempId,
            name: facilityName,
            isCustom: true,
            categoryId: categoryId
        };

        setStandardFacilities((prevCategories) => {
            return prevCategories.map((category) => {
                if (category.categoryId === categoryId) {
                    return {
                        ...category,
                        facilities: [...category.facilities, newFacility]
                    };
                }
                return category;
            });
        });

        setSelectedFacilities((prev) => [...prev, tempId]);

        setCustomInputs((prev) => ({
            ...prev,
            [categoryId]: ''
        }));
    };

    const handleAddCategory = () => {
        const categoryNameTrimmed = newCategoryName.trim();
        if (!categoryNameTrimmed) return;

        const categoryExists = standardFacilities.some(
            cat => cat.categoryName.toLowerCase() === categoryNameTrimmed.toLowerCase()
        );

        if (categoryExists) {
            alert("Această categorie există deja!");
            return;
        }
        const newCategoryId = `custom-cat-${Date.now()}`;

        const newCategory = {
            categoryId: newCategoryId,
            categoryName: categoryNameTrimmed,
            isCustom: true, // Indicator că este o categorie creată de utilizator
            facilities: []  // Începe fără facilități, utilizatorul le va adăuga ulterior
        };

        setStandardFacilities((prev) => [...prev, newCategory]);
        setNewCategoryName(''); // Resetăm input-ul de categorie
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (images.length === 0) {
            alert("Te rugăm să adaugi cel puțin o imagine!");
            return;
        }

        const submitData = new FormData();

        Object.keys(formData).forEach((key) => {
            if (formData[key] !== '') {
                submitData.append(key, formData[key]);
            }
        });

        images.forEach((image) => {
            submitData.append('images', image);
        });

        const standardSelectedIds = selectedFacilities.filter(
            (id) => typeof id === 'number' || !String(id).startsWith('custom-')
        );

        const customSelectedFacilities = [];
        standardFacilities.forEach((category) => {
            category.facilities.forEach((facility) => {
                if (facility.isCustom && selectedFacilities.includes(facility.id)) {
                    const isCategoryCustom = String(category.categoryId).startsWith('custom-cat-');

                    customSelectedFacilities.push({
                        categoryId: isCategoryCustom ? null : category.categoryId,
                        categoryName: isCategoryCustom ? category.categoryName : null,
                        name: facility.name
                    });
                }
            });
        });

        submitData.append('facilities', JSON.stringify(standardSelectedIds));
        submitData.append('customFacilities', JSON.stringify(customSelectedFacilities));

        try {
            const token = localStorage.getItem('jwtToken');

            const response = await fetch('http://localhost:8080/api/properties', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: submitData
            });

            if (response.ok) {
                const savedProperty = await response.json();
                alert('Proprietatea a fost salvată cu succes!');
                console.log('Proprietate salvată:', savedProperty);
            } else {
                const errorMessage = await response.text();
                alert(`A apărut o eroare la salvare: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Eroare de rețea la trimiterea formularului:', error);
            alert('Nu s-a putut conecta la server. Verifică dacă backend-ul este pornit.');
        }
    };

    const isRoom = formData.property_type === 'Cameră';

    return (
        <div>
            <Header isLoggedIn={isAuthenticated} />
            <div className="add-property-container">
                <h2>Adaugă o proprietate nouă</h2>
                <form onSubmit={handleSubmit} className="add-property-form">
                    <div className="property-informations">
                        <fieldset className="form-section">
                            <legend>Detalii Generale</legend>
                            <div className="input-group">
                                <label>Titlu Proprietate:</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                            </div>
                            <div className="input-group">
                                <label>Tip Proprietate:</label>
                                <select name="property_type" value={formData.property_type} onChange={handleInputChange} required>
                                    <option value="Apartament">Apartament</option>
                                    <option value="Cabană">Cabană</option>
                                    <option value="Cameră">Cameră individuală</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Descriere:</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" required />
                            </div>
                        </fieldset>

                        <fieldset className="form-section">
                            <legend>Capacitate și Preț</legend>
                            <div className="row-group">
                                <div className="input-group">
                                    <label>Preț pe noapte (RON):</label>
                                    <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleInputChange} step="0.01" required />
                                </div>
                                <div className="input-group">
                                    <label>Oaspeți maximi:</label>
                                    <input type="number" name="max_guests" value={formData.max_guests} onChange={handleInputChange} required />
                                </div>
                            </div>

                            {!isRoom && (
                                <div className="row-group">
                                    <div className="input-group">
                                        <label>Număr Camere:</label>
                                        <input type="number" name="rooms" value={formData.rooms} onChange={handleInputChange} required={!isRoom} />
                                    </div>
                                    <div className="input-group">
                                        <label>Băi:</label>
                                        <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} required={!isRoom} />
                                    </div>
                                </div>
                            )}
                        </fieldset>

                        <fieldset className="form-section">
                            <legend>Locație</legend>
                            <div className="input-group">
                                <label>Adresă (Stradă, număr):</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
                            </div>
                            <div className="row-group">
                                <div className="input-group">
                                    <label>Oraș:</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Județ:</label>
                                    <input type="text" name="county" value={formData.county} onChange={handleInputChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Țară:</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} required />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="form-section">
                            <legend>Imagini Proprietate</legend>
                            <div className="input-group">
                                <label>Încarcă poze (prima selectată va fi imaginea principală):</label>
                                <input
                                    type="file"
                                    name="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    /* Am scos required ca să poată trimite formularul chiar dacă le adaugă pe rând (mai bine validezi la submit) */
                                />
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="previews-container">
                                    {imagePreviews.map((url, index) => (
                                        <div key={index} className={`preview-card ${index === 0 ? 'main-image-card' : ''}`}>
                                            <img src={url} alt={`preview ${index}`} />
                                            {index === 0 && <span className="main-badge">Poză Principală</span>}

                                            {/* NOU: Butonul de ștergere */}
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => handleRemoveImage(index)}
                                                title="Șterge imaginea"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </fieldset>
                    </div>

                    <div className="property-facilities">
                        <fieldset className="form-section facilities-section">
                            <legend>Facilități Proprietate</legend>

                            {standardFacilities.length > 0 ? (
                                <div className="facilities-grid">
                                    {standardFacilities.map((category) => (
                                        <div key={category.categoryId} className="facility-category">
                                            <h4>{category.categoryName}</h4>

                                            {category.facilities.length > 0 ? (
                                                <div className="checkbox-group">
                                                    {category.facilities.map((facility) => (
                                                        <label key={facility.id} className="checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                value={facility.id}
                                                                checked={selectedFacilities.includes(facility.id)}
                                                                onChange={() => handleFacilityCheckboxChange(facility.id)}
                                                            />
                                                            {facility.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                                                    Nicio facilitate adăugată încă. Adaugă una mai jos!
                                                </p>
                                            )}

                                            <div className="custom-facility-input-group">
                                                <input
                                                    type="text"
                                                    placeholder="Altă facilitate..."
                                                    value={customInputs[category.categoryId] || ''}
                                                    onChange={(e) => handleCustomInputChange(category.categoryId, e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddCustomFacility(category.categoryId)}
                                                    className="add-custom-btn"
                                                >
                                                    Adaugă
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Se încarcă facilitățile...</p>
                            )}

                            {/* === INPUT ȘI BUTON PENTRU CATEGORIE NOUĂ === */}
                            <div className="add-category-group">
                                <input
                                    type="text"
                                    placeholder="Nume categorie nouă (ex: Activități, Wellness)..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="add-category-btn"
                                >
                                    + Categorie Nouă
                                </button>
                            </div>
                        </fieldset>
                        <button type="submit" className="submit-button">
                            Salvează Proprietatea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProperty;