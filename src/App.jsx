import React from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
import CustomFrequencyWireframe from "./CustomFrequencyWireframe.jsx";

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
      </Routes>
    </HashRouter>
  );
}
