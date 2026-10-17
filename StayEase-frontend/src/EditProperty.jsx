import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AddProperty.css';
import Header from './Header.jsx';

const removeDiacritics = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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
        status: ''
    });

    const [images, setImages] = useState([]);
    const [standardFacilities, setStandardFacilities] = useState([]);
    const [selectedFacilities, setSelectedFacilities] = useState([]);

    // Stări pentru facilități custom și categorii noi
    const [customInputs, setCustomInputs] = useState({});
    const [newCategoryName, setNewCategoryName] = useState('');

    // === STĂRI LOCAȚII & ID-URI ===
    const [counties, setCounties] = useState([]);
    const [cities, setCities] = useState([]);
    const [countySearch, setCountySearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [showCountyDropdown, setShowCountyDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const [selectedCountyId, setSelectedCountyId] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isAuthenticated = !!localStorage.getItem('jwtToken');

    useEffect(() => {
        const loadData = async () => {
            try {
                // Încărcăm simultan datele proprietății, facilitățile și județele
                const [propRes, facRes, countiesRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/properties/${id}`),
                    fetch('http://localhost:8080/api/facilities/grouped'),
                    fetch('http://localhost:8080/api/locations/counties')
                ]);

                if (!propRes.ok) {
                    throw new Error('Nu s-au putut prelua datele proprietății.');
                }

                const propData = await propRes.json();
                const facData = await facRes.json();
                const countiesData = countiesRes.ok ? await countiesRes.json() : [];

                setCounties(countiesData);

                const initialSelectedIds = [];

                if (propData.facilities) {
                    propData.facilities.forEach(propCat => {
                        const categoryName = propCat.categoryName;
                        let targetCategory = facData.find(c => c.categoryName === categoryName);

                        if (!targetCategory) {
                            targetCategory = {
                                categoryId: `custom-cat-${Date.now()}-${Math.random()}`,
                                categoryName: categoryName,
                                isCustom: true,
                                facilities: []
                            };
                            facData.push(targetCategory);
                        }

                        propCat.facilities.forEach(facilityName => {
                            let foundFac = targetCategory.facilities.find(f => f.name === facilityName);

                            if (foundFac) {
                                initialSelectedIds.push(String(foundFac.id));
                            } else {
                                const tempId = `custom-fac-${Date.now()}-${Math.random()}`;
                                targetCategory.facilities.push({
                                    id: tempId,
                                    name: facilityName,
                                    isCustom: true,
                                    categoryId: targetCategory.categoryId
                                });
                                initialSelectedIds.push(tempId);
                            }
                        });
                    });
                }

                setStandardFacilities(facData);
                setSelectedFacilities(initialSelectedIds);

                setFormData({
                    title: propData.title || '',
                    property_type: convertPropertyTypeToUI(propData.propertyType),
                    description: propData.description || '',
                    price_per_night: propData.pricePerNight || '',
                    rooms: propData.rooms || '',
                    bathrooms: propData.bathrooms || '',
                    max_guests: propData.maxGuests || '',
                    address: propData.address || '',
                    city: propData.city || '',
                    county: propData.county || '',
                    country: propData.country || 'România',
                    status: propData.status || ''
                });

                // Potrivire inițială pentru Județ și Oraș
                if (propData.county) {
                    setCountySearch(propData.county);
                    const matchCounty = countiesData.find(c => removeDiacritics(c.name) === removeDiacritics(propData.county));
                    if (matchCounty) {
                        setSelectedCountyId(matchCounty.id);
                    }
                }

                if (propData.city) {
                    setCitySearch(propData.city);
                }

                setImages(propData.images || []);

            } catch (error) {
                console.error('Eroare la preluarea datelor:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    // Fetch orașe atunci când un județ este selectat / schimbat
    useEffect(() => {
        if (selectedCountyId) {
            fetch(`http://localhost:8080/api/locations/counties/${selectedCountyId}/cities`)
                .then(response => response.json())
                .then(data => {
                    setCities(data);
                    // Setăm automat orașul găsit în lista de orașe pentru geolocație
                    if (formData.city && !selectedCity) {
                        const matchCity = data.find(c => removeDiacritics(c.name) === removeDiacritics(formData.city));
                        if (matchCity) {
                            setSelectedCity(matchCity);
                        }
                    }
                })
                .catch(error => console.error("Eroare la preluarea orașelor:", error));
        } else {
            setCities([]);
        }
    }, [selectedCountyId, formData.city]);

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
        setSelectedCity(city);
        setFormData(prev => ({ ...prev, city: city.name }));
        setShowCityDropdown(false);
    };

    const convertPropertyTypeToUI = (type) => {
        switch (type) {
            case 'APARTMENT':
                return 'Apartament';
            case 'HOUSE':
                return 'Cabană';
            case 'ROOM':
                return 'Cameră';
            default:
                return type || 'Apartament';
        }
    };

    const convertPropertyTypeToEnum = (type) => {
        switch (type) {
            case 'Apartament':
                return 'APARTMENT';
            case 'Cabană':
                return 'HOUSE';
            case 'Cameră':
                return 'ROOM';
            default:
                return 'APARTMENT';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFacilityCheckboxChange = (facilityId) => {
        const strId = String(facilityId);
        setSelectedFacilities(prevSelected => {
            if (prevSelected.includes(strId)) {
                return prevSelected.filter(id => id !== strId);
            }
            return [...prevSelected, strId];
        });
    };

    const handleCustomInputChange = (categoryId, value) => {
        setCustomInputs((prev) => ({ ...prev, [categoryId]: value }));
    };

    const handleAddCustomFacility = (categoryId) => {
        const facilityName = customInputs[categoryId]?.trim();
        if (!facilityName) return;

        const tempId = `custom-fac-${Date.now()}-${Math.random()}`;
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
        const newCategoryId = `custom-cat-${Date.now()}-${Math.random()}`;
        const newCategory = { categoryId: newCategoryId, categoryName: categoryNameTrimmed, isCustom: true, facilities: [] };
        setStandardFacilities((prev) => [...prev, newCategory]);
        setNewCategoryName('');
    };

    const handleAddImage = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;

        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImageObj = {
                    id: `new-${Date.now()}-${Math.random()}`,
                    file: file,
                    base64Data: reader.result,
                    mainImage: false,
                    isNew: true
                };
                setImages(prevImages => [...prevImages, newImageObj]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = null;
    };

    const handleRemoveImage = (imageId) => {
        setImages(prevImages =>
            prevImages.filter(image => image.id !== imageId)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const formattedSelectedFacilities = [];
        const formattedCustomFacilities = [];

        // Construim facilitățile standard și custom, verificând atent după prefixul 'custom-'
        standardFacilities.forEach(category => {
            const isCategoryCustom = category.isCustom || String(category.categoryId).startsWith('custom-');

            category.facilities.forEach(facility => {

                if (selectedFacilities.includes(String(facility.id))) {
                    const isFacilityCustom = facility.isCustom || String(facility.id).startsWith('custom-');

                    if (isCategoryCustom && isFacilityCustom) {
                        formattedCustomFacilities.push({
                            categoryName: category.categoryName,
                            facility: facility.name,
                            _custom_category:false,
                            _custom_facility:false,
                            _custom_category_and_custom_facility:true

                        });
                    } else if (isFacilityCustom) {
                        formattedCustomFacilities.push({
                            categoryName: category.categoryName,
                            facility: facility.name,
                            _custom_category:false,
                            _custom_facility:true,
                            _custom_category_and_custom_facility:false

                        });
                    }else
                    {
                        formattedSelectedFacilities.push({
                            categoryName: category.categoryName,
                            facility: facility.name,
                            _custom_category:false,
                            _custom_facility:false,
                            _custom_category_and_custom_facility:false
                        });
                    }
                }
            });
        });

        const formattedImages = images.map(img => {
            if (img.isNew) {
                return {
                    id: null,
                    base64Data: img.base64Data,
                    mainImage: !!img.mainImage,
                    isNew: true
                };
            } else {
                return {
                    id: img.id,
                    base64Data: null,
                    mainImage: !!img.mainImage,
                    isNew: false
                };
            }
        });

        const payload = {
            title: formData.title,
            propertyType: convertPropertyTypeToEnum(formData.property_type),
            description: formData.description,
            pricePerNight: parseFloat(formData.price_per_night) || 0,
            maxGuests: parseInt(formData.max_guests, 10) || 0,
            rooms: parseInt(formData.rooms, 10) || 0,
            bathrooms: parseInt(formData.bathrooms, 10) || 0,
            address: formData.address,
            city: formData.city,
            county: formData.county,
            country: formData.country,
            countyId: selectedCountyId,
            cityId: selectedCity ? selectedCity.id : null,
            siruta: selectedCity ? selectedCity.siruta : null,
            latitude: selectedCity ? selectedCity.latitude : null,
            longitude: selectedCity ? selectedCity.longitude : null,
            selectedFacilities: formattedSelectedFacilities,
            customFacilities: formattedCustomFacilities,
            images: formattedImages
        };

        const userId = localStorage.getItem('userId') || 1;
        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`http://localhost:8080/api/properties/${id}/draft?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Solicitarea de editare a fost trimisă spre aprobare!');
                navigate('/my-properties');
            } else {
                alert('Eroare: ' + (result.message || 'Nu s-au putut salva modificările.'));
            }
        } catch (err) {
            console.error('Eroare la trimiterea draftului:', err);
            alert('A apărut o eroare la conexiunea cu serverul.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Header isLoggedIn={isAuthenticated} />
                <div className="add-property-container">
                    <h2>Se încarcă proprietatea...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header isLoggedIn={isAuthenticated} />
                <div className="add-property-container">
                    <h2>{error}</h2>
                </div>
            </div>
        );
    }

    const isRoom = formData.property_type === 'Cameră';

    return (
        <div>
            <Header isLoggedIn={isAuthenticated} />

            <div className="add-property-container">
                <h2>Editează proprietatea</h2>
                <form className="add-property-form" onSubmit={handleSubmit}>
                    <div className="property-informations">
                        <fieldset className="form-section">
                            <legend>Detalii Generale</legend>
                            <div className="input-group">
                                <label>Titlu Proprietate:</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="input-group">
                                <label>Tip Proprietate:</label>
                                <select
                                    name="property_type"
                                    value={formData.property_type}
                                    onChange={handleInputChange}
                                >
                                    <option value="Apartament">Apartament</option>
                                    <option value="Cabană">Cabană</option>
                                    <option value="Cameră">Cameră individuală</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Descriere:</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="5"
                                />
                            </div>
                        </fieldset>
                        <fieldset className="form-section">
                            <legend>Capacitate și Preț</legend>
                            <div className="row-group">
                                <div className="input-group">
                                    <label>Preț pe noapte (RON):</label>
                                    <input
                                        type="number"
                                        name="price_per_night"
                                        value={formData.price_per_night}
                                        onChange={handleInputChange}
                                        step="0.01"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Oaspeți maximi:</label>
                                    <input
                                        type="number"
                                        name="max_guests"
                                        value={formData.max_guests}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            {!isRoom && (
                                <div className="row-group">
                                    <div className="input-group">
                                        <label>Număr Camere:</label>
                                        <input
                                            type="number"
                                            name="rooms"
                                            value={formData.rooms}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Băi:</label>
                                        <input
                                            type="number"
                                            name="bathrooms"
                                            value={formData.bathrooms}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </fieldset>
                        <fieldset className="form-section">
                            <legend>Locație</legend>
                            <div className="input-group">
                                <label>Adresă (Stradă, număr):</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
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
                            </div>
                            <div className="input-group">
                                <label>Țară:</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    readOnly
                                />
                            </div>
                        </fieldset>
                        <fieldset className="form-section">
                            <legend>Imagini Proprietate</legend>
                            <div className="input-group">
                                <label>Imagini existente și imagini noi:</label>
                                <div className="custom-file-upload-container">
                                    <input
                                        type="file"
                                        id="property-images"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAddImage}
                                        className="hidden-file-input"
                                    />
                                    <label htmlFor="property-images" className="custom-upload-button">
                                        Adaugă Imagini
                                    </label>
                                    <span className="file-upload-info">
                                        {images.length} imagini
                                    </span>
                                </div>
                            </div>
                            {images.length > 0 && (
                                <div className="previews-container">
                                    {images.map((image, index) => (
                                        <div
                                            key={image.id}
                                            className={`preview-card ${image.mainImage ? 'main-image-card' : ''}`}
                                        >
                                            <img
                                                src={image.base64Data || image.url || image.imageUrl}
                                                alt={`Imagine ${index + 1}`}
                                            />
                                            {image.mainImage && (
                                                <span className="main-badge">Poză Principală</span>
                                            )}
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => handleRemoveImage(image.id)}
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
                                    {standardFacilities.map(category => (
                                        <div key={category.categoryId} className="facility-category">
                                            <h4>{category.categoryName}</h4>

                                            {category.facilities.length > 0 ? (
                                                <div className="checkbox-group">
                                                    {category.facilities.map(facility => (
                                                        <label key={facility.id} className="checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                value={facility.id}
                                                                checked={selectedFacilities.includes(String(facility.id))}
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

                            <div className="add-category-group">
                                <input
                                    type="text"
                                    placeholder="Nume categorie nouă..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <button type="button" onClick={handleAddCategory} className="add-category-btn">
                                    + Categorie Nouă
                                </button>
                            </div>
                        </fieldset>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={submitting}
                        >
                            {submitting ? 'Se trimite...' : 'Salvează Modificările'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProperty;