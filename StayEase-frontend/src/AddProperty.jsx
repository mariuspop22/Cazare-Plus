import React, { useState, useEffect } from 'react';
import './AddProperty.css';
import Header from "./Header.jsx";

const removeDiacritics = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const AddProperty = () => {
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

    // === STĂRI LOCAȚII & ID-URI ===
    const [counties, setCounties] = useState([]);
    const [cities, setCities] = useState([]);
    const [countySearch, setCountySearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [showCountyDropdown, setShowCountyDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // ID-urile și detaliile selectate
    const [selectedCountyId, setSelectedCountyId] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null); // Păstrăm tot obiectul oraș pentru siruta, lat, long

    // 1. Fetch facilități și județe la încărcarea paginii
    useEffect(() => {
        fetch("http://localhost:8080/api/facilities/grouped")
            .then(response => response.json())
            .then(data => setStandardFacilities(data))
            .catch(error => console.error("Eroare facilități:", error));

        fetch("http://localhost:8080/api/locations/counties")
            .then(response => response.json())
            .then(data => setCounties(data))
            .catch(error => console.error("Eroare la preluarea județelor:", error));
    }, []);

    // 2. Fetch orașe atunci când un județ este selectat
    useEffect(() => {
        if (selectedCountyId) {
            fetch(`http://localhost:8080/api/locations/counties/${selectedCountyId}/cities`)
                .then(response => response.json())
                .then(data => setCities(data))
                .catch(error => console.error("Eroare la preluarea orașelor:", error));
        } else {
            setCities([]);
        }
    }, [selectedCountyId]);

    // === LOGICĂ FILTRARE FĂRĂ DIACRITICE ===
    const filteredCounties = counties.filter(c =>
        removeDiacritics(c.name).includes(removeDiacritics(countySearch))
    );

    const filteredCities = cities.filter(c =>
        removeDiacritics(c.name).includes(removeDiacritics(citySearch))
    );

    // === HANDLERS LOCAȚII CU SALVARE DE ID-URI ===
    const handleSelectCounty = (county) => {
        setCountySearch(county.name);
        setSelectedCountyId(county.id);
        setFormData(prev => ({ ...prev, county: county.name }));
        setShowCountyDropdown(false);

        // Resetăm orașul selectat când se schimbă județul
        setCitySearch('');
        setSelectedCity(null);
        setFormData(prev => ({ ...prev, city: '' }));
    };

    const handleSelectCity = (city) => {
        setCitySearch(city.name);
        setSelectedCity(city); // Obiectul conține id, siruta, latitude, longitude
        setFormData(prev => ({ ...prev, city: city.name }));
        setShowCityDropdown(false);
    };

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
        setCustomInputs((prev) => ({ ...prev, [categoryId]: value }));
    };

    const handleAddCustomFacility = (categoryId) => {
        const facilityName = customInputs[categoryId]?.trim();
        if (!facilityName) return;
        const tempId = `custom-${categoryId}-${Date.now()}`;
        const newFacility = { id: tempId, name: facilityName, isCustom: true, categoryId: categoryId };

        setStandardFacilities((prevCategories) => {
            return prevCategories.map((category) => {
                if (category.categoryId === categoryId) {
                    return { ...category, facilities: [...category.facilities, newFacility] };
                }
                return category;
            });
        });
        setSelectedFacilities((prev) => [...prev, tempId]);
        setCustomInputs((prev) => ({ ...prev, [categoryId]: '' }));
    };

    const handleAddCategory = () => {
        const categoryNameTrimmed = newCategoryName.trim();
        if (!categoryNameTrimmed) return;
        const categoryExists = standardFacilities.some(cat => cat.categoryName.toLowerCase() === categoryNameTrimmed.toLowerCase());
        if (categoryExists) {
            alert("Această categorie există deja!");
            return;
        }
        const newCategoryId = `custom-cat-${Date.now()}`;
        const newCategory = { categoryId: newCategoryId, categoryName: categoryNameTrimmed, isCustom: true, facilities: [] };
        setStandardFacilities((prev) => [...prev, newCategory]);
        setNewCategoryName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validare existență ID-uri
        if (!selectedCountyId || !selectedCity) {
            alert("Te rugăm să selectezi un județ și un oraș valid din listă!");
            return;
        }

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

        // Adăugare ID-uri și date geolocație obligatorii din entități
        // Adăugare ID-uri obligatorii din entități
        submitData.append('countyId', selectedCountyId);
        submitData.append('county_id', selectedCountyId);
        submitData.append('cityId', selectedCity.id);
        submitData.append('city_id', selectedCity.id);

        // Adăugăm datele de geolocație DOAR dacă ele există în obiectul selectedCity,
        // evitând astfel transformarea lor în textul "undefined"
        if (selectedCity.siruta != null) {
            submitData.append('siruta', selectedCity.siruta);
        }
        if (selectedCity.longitude != null) {
            submitData.append('longitude', selectedCity.longitude);
        }
        if (selectedCity.latitude != null) {
            submitData.append('latitude', selectedCity.latitude);
        }

        images.forEach((image) => {
            submitData.append('images', image);
        });

        const standardSelectedIds = selectedFacilities.filter(id => typeof id === 'number' || !String(id).startsWith('custom-'));
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
                headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
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
                                {/* JUDEȚ */}
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <label>Județ:</label>
                                    <input
                                        type="text"
                                        value={countySearch}
                                        placeholder="Caută județ..."
                                        onChange={(e) => {
                                            setCountySearch(e.target.value);
                                            setShowCountyDropdown(true);
                                            setSelectedCountyId(null);
                                            setFormData(prev => ({...prev, county: ''}));
                                        }}
                                        onFocus={() => setShowCountyDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowCountyDropdown(false), 200)}
                                        required
                                        autoComplete="off"
                                    />
                                    {showCountyDropdown && (
                                        <ul className="location-autocomplete-list">
                                            {filteredCounties.map(c => (
                                                <li key={c.id} onClick={() => handleSelectCounty(c)}>
                                                    {c.name}
                                                </li>
                                            ))}
                                            {filteredCounties.length === 0 && (
                                                <li className="no-results">Nu am găsit județul...</li>
                                            )}
                                        </ul>
                                    )}
                                </div>

                                {/* ORAȘ */}
                                <div className="input-group" style={{ position: 'relative' }}>
                                    <label>Oraș/Comună:</label>
                                    <input
                                        type="text"
                                        value={citySearch}
                                        placeholder={selectedCountyId ? "Caută localitate..." : "Selectează întâi județul"}
                                        onChange={(e) => {
                                            setCitySearch(e.target.value);
                                            setShowCityDropdown(true);
                                            setSelectedCity(null);
                                            setFormData(prev => ({...prev, city: ''}));
                                        }}
                                        onFocus={() => { if(selectedCountyId) setShowCityDropdown(true); }}
                                        onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                                        required
                                        disabled={!selectedCountyId}
                                        autoComplete="off"
                                    />
                                    {showCityDropdown && selectedCountyId && (
                                        <ul className="location-autocomplete-list">
                                            {filteredCities.map(c => (
                                                <li key={c.id} onClick={() => handleSelectCity(c)}>
                                                    {c.name}
                                                </li>
                                            ))}
                                            {filteredCities.length === 0 && (
                                                <li className="no-results">Nu am găsit orașul...</li>
                                            )}
                                        </ul>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Țară:</label>
                                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} required readOnly />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="form-section">
                            <legend>Imagini Proprietate</legend>
                            <div className="input-group">
                                <label>Încarcă poze (prima selectată va fi imaginea principală):</label>
                                <div className="custom-file-upload-container">
                                    <input
                                        type="file"
                                        id="property-images"
                                        name="images"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden-file-input"
                                    />
                                    <label htmlFor="property-images" className="custom-upload-button">
                                        Adaugă Imagini
                                    </label>
                                    <span className="file-upload-info">
                                        {images.length > 0 ? `${images.length} fișiere selectate` : 'Niciun fișier selectat'}
                                    </span>
                                </div>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="previews-container">
                                    {imagePreviews.map((url, index) => (
                                        <div key={index} className={`preview-card ${index === 0 ? 'main-image-card' : ''}`}>
                                            <img src={url} alt={`preview ${index}`} />
                                            {index === 0 && <span className="main-badge">Poză Principală</span>}
                                            <button type="button" className="remove-image-btn" onClick={() => handleRemoveImage(index)} title="Șterge imaginea">
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
                                                            <input type="checkbox" value={facility.id} checked={selectedFacilities.includes(facility.id)} onChange={() => handleFacilityCheckboxChange(facility.id)} />
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
                                                <input type="text" placeholder="Altă facilitate..." value={customInputs[category.categoryId] || ''} onChange={(e) => handleCustomInputChange(category.categoryId, e.target.value)} />
                                                <button type="button" onClick={() => handleAddCustomFacility(category.categoryId)} className="add-custom-btn">Adaugă</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>Se încarcă facilitățile...</p>
                            )}
                            <div className="add-category-group">
                                <input type="text" placeholder="Nume categorie nouă (ex: Activități, Wellness)..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                                <button type="button" onClick={handleAddCategory} className="add-category-btn">+ Categorie Nouă</button>
                            </div>
                        </fieldset>
                        <button type="submit" className="submit-button">Salvează Proprietatea</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProperty;