import React, { useState, useEffect } from "react";
import Header from "./Header";
import "./Home.css"; // Stilurile specifice paginii de prezentare
import RegisterModal from "./RegisterModal";
import apartment from "./assets/apartment.png";
import house from "./assets/house.png";
import room from "./assets/room.png";

function Home() {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8080/api/properties/featured")
            .then(response => response.json())
            .then(data => {
                console.log("Date primite de la backend:", data);
                setFeaturedProperties(data);
            })
            .catch(error => console.error("A apărut o eroare la fetch:", error));
    }, []);

    useEffect(() => {
        if (featuredProperties.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === featuredProperties.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredProperties]);

    const currentProperty = featuredProperties[currentIndex];

    return (
        <div>
            <Header onOpenRegister={() => setIsRegisterOpen(true)} />

            <RegisterModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
            />

            <div className="page-content">
                <h1 className="main-text-1">
                    Tot ceea ce îți dorești este la un click distanță...
                </h1>

                <div className="card-container">
                    <div className="card">
                        <img src={apartment} alt="img1" />
                        <div className="card-description">apartamente</div>
                    </div>
                    <div className="card">
                        <img src={house} alt="img2" />
                        <div className="card-description">cabane</div>
                    </div>
                    <div className="card">
                        <img src={room} alt="img3" />
                        <div className="card-description">camere</div>
                    </div>
                </div>

                <div className="description-container">
                    <div className="main-text-2">Cine suntem noi?</div>
                    <div className="description">
                        CazarePlus este o platformă românească dedicată rezervării de cazări,
                        oferind utilizatorilor o experiență rapidă, sigură și accesibilă.
                        Fie că îți dorești un apartment modern, o cabană în mijlocul naturii sau o cameră confortabilă,
                        CazarePlus îți pune la dispoziție numeroase opțiuni pentru orice buget.
                        De peste 4 ani, platforma a câștigat încrederea a mii de clienți mulțumiți din întreaga țară.
                    </div>
                </div>

                <div className="featured-slider-section">
                    {currentProperty ? (
                        <div className="slider-container">
                            {currentProperty.mainImageBase64 ? (
                                <img
                                    className="slider-image"
                                    src={`data:image/jpeg;base64,${currentProperty.mainImageBase64}`}
                                    alt={currentProperty.title}
                                />
                            ) : (
                                <div className="slider-placeholder">Fără imagine</div>
                            )}

                            <div className="slider-overlay"></div>

                            <div className="slider-content">
                                <div className="slider-info">
                                    <h3 className="slider-title">{currentProperty.title}</h3>
                                    <p className="slider-details">
                                        {currentProperty.city}, {currentProperty.county} <br/>
                                        <strong>{currentProperty.pricePerNight} RON</strong> / noapte
                                    </p>
                                </div>
                                <button className="slider-btn">
                                    Vezi mai mult
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p style={{textAlign: "center"}}>Se încarcă cazările...</p>
                    )}
                    <h2 className="main-text-3">Câteva din cazările noastre</h2>
                </div>
            </div>
        </div>
    );
}

export default Home;