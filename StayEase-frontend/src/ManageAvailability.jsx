import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Header from './Header';
import './ManageAvailability.css';

const ManageAvailability = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [unavailablePeriods, setUnavailablePeriods] = useState([]);
    const [selectedDates, setSelectedDates] = useState([null, null]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchUnavailablePeriods = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/properties/${id}/UnavailablePeriods`);
            if (!response.ok) throw new Error('Nu am putut încărca perioadele indisponibile.');

            const data = await response.json();
            setUnavailablePeriods(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnavailablePeriods();
    }, [id]);

    const isDateDisabled = ({ date, view }) => {
        if (view !== 'month' || !unavailablePeriods || unavailablePeriods.length === 0) return false;

        const checkTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

        return unavailablePeriods.some(period => {
            const [sYear, sMonth, sDay] = period.startDate.split('-').map(Number);
            const [eYear, eMonth, eDay] = period.endDate.split('-').map(Number);

            const startTime = new Date(sYear, sMonth - 1, sDay).getTime();
            const endTime = new Date(eYear, eMonth - 1, eDay).getTime();

            return checkTime >= startTime && checkTime <= endTime;
        });
    };

    const formatDate = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSavePeriod = async () => {
        if (!selectedDates || !selectedDates[0] || !selectedDates[1]) {
            alert("Te rog să selectezi o perioadă validă (dată de început și dată de sfârșit).");
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem("jwtToken");

        const payload = {
            startDate: formatDate(selectedDates[0]),
            endDate: formatDate(selectedDates[1])
        };

        try {
            const response = await fetch(`http://localhost:8080/api/properties/${id}/UnavailablePeriods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || 'Eroare la salvarea perioadei.');
            }

            alert("Perioada a fost blocată cu succes!");
            setSelectedDates([null, null]);
            fetchUnavailablePeriods();

        } catch (err) {
            console.error(err);
            alert(`A apărut o eroare: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loader-container"><h2>Se încarcă calendarul...</h2></div>;
    if (error) return <div className="error-container"><h2>Eroare: {error}</h2></div>;

    return (
        <div className="manage-availability-page">
            <Header isLoggedIn={!!localStorage.getItem('jwtToken')} />

            <main className="property-main-content">
                <h2>Gestionează Disponibilitatea Proprietății</h2>
                <p className="page-description">
                    Selectează din calendar intervalul de zile în care proprietatea nu este disponibilă pentru rezervare (ex: renovări, uz personal).
                </p>

                <div className="availability-calendar-section">
                    <div className="custom-calendar-wrapper">
                        <Calendar
                            onChange={setSelectedDates}
                            value={selectedDates}
                            selectRange={true}
                            tileDisabled={isDateDisabled}
                            minDate={new Date()}
                            showDoubleView={window.innerWidth > 768}
                            next2Label={null}
                            prev2Label={null}
                            showNeighboringMonth={false}
                        />
                    </div>

                    <div className="selected-dates-info">
                        {selectedDates[0] && selectedDates[1] ? (
                            <p>
                                <strong>Perioadă selectată:</strong> {formatDate(selectedDates[0])} <i className="fa-solid fa-arrow-right"></i> {formatDate(selectedDates[1])}
                            </p>
                        ) : (
                            <p className="empty-selection-text">Nicio perioadă selectată.</p>
                        )}
                    </div>

                    <div className="calendar-footer-actions">
                        <button
                            className="clear-dates-btn"
                            onClick={() => setSelectedDates([null, null])}
                        >
                            Șterge selecția
                        </button>

                        <button
                            className="book-button"
                            onClick={handleSavePeriod}
                            disabled={!selectedDates[0] || !selectedDates[1] || submitting}
                        >
                            {submitting ? 'Se salvează...' : 'Blochează Perioada'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ManageAvailability;