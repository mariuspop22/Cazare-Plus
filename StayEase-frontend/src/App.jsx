import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import AddProperty from "./AddProperty";
import PropertyDetails from "./PropertyDetails";
import OwnerProfile from "./OwnerProfile";
import SearchResults from './SearchResults';
import EditProperty from './EditProperty.jsx';
import ManageAvailability  from "./ManageAvailability.jsx";
import AdminPendingProperties from './AdminPendingProperties';
import AdminPendingPropertyDetails from './AdminPendingPropertyDetails';
import OwnerProperties from "./OwnerProperties.jsx";
import EditRejectedProperty from "./EditRejectedProperty.jsx"
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add-property" element={<AddProperty />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/owner/profile" element={<OwnerProfile />} />
                <Route path="/rezultate" element={<SearchResults />} />
                <Route path="/edit-property/:id" element={<EditProperty />} />

                <Route path="/manage-availability/:id" element={<ManageAvailability />} />
                <Route path="/admin/cereri-pending" element={<AdminPendingProperties />} />
                <Route path="/admin/property/:id" element={<AdminPendingPropertyDetails/>}/>
                <Route path="/owner/properties" element={<OwnerProperties/>}/>
                <Route path="/owner/edit-rejected-property/:id" element={<EditRejectedProperty/>}/>
            </Routes>
        </Router>
    );
}

export default App;