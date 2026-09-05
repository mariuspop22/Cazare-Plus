import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import AddProperty from "./AddProperty";
import PropertyDetails from "./PropertyDetails";
import OwnerProfile from "./OwnerProfile";
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/owner/profile" element={<OwnerProfile />} />
            </Routes>
        </Router>
    );
}

export default App;