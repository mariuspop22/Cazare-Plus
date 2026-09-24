import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import AddProperty from "./AddProperty";
import PropertyDetails from "./PropertyDetails";
import OwnerProfile from "./OwnerProfile";
import SearchResults from './SearchResults';
import EditProperty from './EditProperty.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/owner/profile" element={<OwnerProfile />} />
                <Route path="/rezultate" element={<SearchResults />} />
                <Route
                    path="/edit-property/:id"
                    element={<EditProperty />}
                />
            </Routes>
        </Router>
    );
}

export default App;