import React from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import CustomFrequencyWireframe from "./CustomFrequencyWireframe.jsx";
import TestMethodDefinitionPage2 from "./test_methods2.jsx";
import InventoryPage from "./inventory.jsx";
import PriceBook from "./pricebook.jsx";

function Home() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Home</h1>
      <p>Go to the wireframe demo:</p>
      <Link className="underline text-indigo-600" to="/wireframe">Open Custom Frequency</Link>
    </div>
  );
}



export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customfreq" element={<CustomFrequencyWireframe />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/test-method2" element={<TestMethodDefinitionPage2 />} />
        <Route path="/pricebook" element={<PriceBook />} />
      </Routes>
    </HashRouter>
  );
}
