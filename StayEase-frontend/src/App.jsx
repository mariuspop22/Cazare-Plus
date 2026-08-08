import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";               // Pagina de prezentare completă
import AddProperty from "./AddProperty"; // Formularul nou creat

function App() {
  return (
      <Router>
        <Routes>
          {/* Pagina principală (cu Header-ul și restul secțiunilor incluse în Home) */}
          <Route path="/" element={<Home />} />

          {/* Pagina cu formularul */}
          <Route path="/add-property" element={<AddProperty />} />
        </Routes>
      </Router>
  );
}

export default App;