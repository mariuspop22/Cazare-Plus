import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from "./Header.jsx";
import Footer from "./Footer";
import "./MakeReservation.css"
import { API_BASE_URL } from './config';

const MakeReservation = () => {

    const [renterInformation ,setRenterInformation]=useState([]);
    const userId = localStorage.getItem('userId') || false;
    const location = useLocation();
    const reservationDetails = location.state?.ReservationDetails;
    const [formData, setFormData] = useState({
        renterFirstName: '',
        renterLastName: '',
        renterTelephoneNumber: '',
        renterEmail: '',
        userId: '',
        propertyId: '',
        numbersOfGuests: '',
        totalPrice: '',
        checkOut: '',
        checkIn: '',
        specialRequest: '',

    });
    const fetchRenterInformations = async () => {
        if(userId) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/renter/${userId}/information`, {
                });
                const data = await response.json();
                setRenterInformation(data);
                console.log(data);
            } catch (error) {
                console.error('Eroare la preluarea dartelor utilizatorului:', error);
            }
        }
    };
    useEffect(() => {
        fetchRenterInformations();
    }, []);
console.log(reservationDetails);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            const updatedData = { ...prevData, [name]: value };
            return updatedData;
        });
    };
   const handleSubmit=() => {

    }
    return (
        <div className="make-reservation-page">
            <Header isLoggedIn={!!localStorage.getItem('jwtToken')} />
        <div className="make-reservation-container">
            <div className="make-reservation-content">
                <h3>Va rugam sa completati datele de mai jos pentru reservare</h3>
                <form onSubmit={handleSubmit} className="make-reservation-form">

                <div className="reservations-details">
                <div className="left-content">
                    <h4>Datele chiriasului</h4>


                    {renterInformation ? (
                    <div className="renter-details">

                        <div className="input-group">
                            <label>Nume:</label>
                            <input type="text" name="renterFirstName" value={renterInformation.firstName} onChange={handleInputChange} required />
                        </div>
                        <div className="input-group">
                            <label>Prenume:</label>
                            <input type="text" name="renterLastName" value={renterInformation.lastName} onChange={handleInputChange} required />
                        </div>
                        <div className="input-group">
                            <label>Email:</label>
                            <input type="text" name="renterTelephoneNumber" value={renterInformation.telephoneNumber} onChange={handleInputChange} required />
                        </div>

                        <div className="input-group">
                            <label>Email:</label>
                            <input type="text" name="renterEmail" value={renterInformation.email} onChange={handleInputChange} required />
                        </div>
                    </div>
                        ) : (<div className="renter-details">

                        <div className="input-group">
                            <label>Nume:</label>
                            <input type="text" name="renterFirstName" value={formData.renterFirstName} onChange={handleInputChange} required />
                        </div>
                        <div className="input-group">
                            <label>Prenume:</label>
                            <input type="text" name="renterTelephoneNumber" value={formData.renterLastName} onChange={handleInputChange} required />
                        </div>
                        <div className="input-group">
                            <label>Email:</label>
                            <input type="text" name="renterEmail" value={formData.renterFirstName} onChange={handleInputChange} required />
                        </div>

                        <div className="input-group">
                            <label>Email:</label>
                            <input type="text" name="title" value={formData.renterFirstName} onChange={handleInputChange} required />
                        </div>
                    </div>)
                    }
                </div>
                <div className="right-content">
                    <h4>Datele rezervarii</h4>
                    {reservationDetails && (
                    <div className="reservation-details">

                        <div className="checkIn-checkOut">
                            <div className="input-group">
                                <label>Check In:</label>
                                <input type="text" name="checkIn" value={reservationDetails.checkIn} onChange={handleInputChange} required />
                            </div>

                            <div className="input-group">
                                <label>Check Out:</label>
                                <input type="text" name="checkOut" value={reservationDetails.checkOut} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Numarul de Oaspeti:</label>
                            <input type="number" name="numbersOfGuests" value={formData.numbersOfGuests} onChange={handleInputChange} required />
                        </div>

                        <div className="input-group">
                            <label>Cerinte pentru proprietar:</label>
                            <textarea name="specialRequest" value={formData.specialRequest} onChange={handleInputChange} rows="2"  />
                        </div>

                        <div className="total-price-for-reservation">
                            Pretul Total : {reservationDetails.totalPriceForReservation} RON
                        </div>

                    </div>
                    )}

                    <button type="submit" className="submit-button">Rezerva</button>

                </div>
            </div>
                </form>
            </div>
        </div>
            <Footer/>
        </div>





    )

};
export default MakeReservation;