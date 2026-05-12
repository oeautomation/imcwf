import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import CustomFrequencyWireframe from "./CustomFrequencyWireframe.jsx";
import TestMethodDefinitionPage2 from "./test_methods2.jsx";
import InventoryPage from "./inventory.jsx";
import PriceBook from "./pricebook2.jsx";
import OtherJobs from "./otherjobs.jsx";
import SampleCollection from "./sample_collection.jsx";
import DataEntry from "./data-entry.jsx";
import SearchCollector from "./search_collector.jsx";
import AddUser from "./adduser2.jsx";
import UserRoles from "./user-roles.jsx";
import Aquisition from "./AcquisitionRequestWizard.jsx";
import Deployment from "./deployment.jsx"
import QuotationDetailsPage from "./quote.jsx";
import Detections from "./detections.jsx";
import Media from "./media.jsx";
import JobCategories from "./job_categories.jsx";

function Home() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Home</h1>
      <p>Prototypes:</p>
      <Link className="underline text-indigo-600" to="/Inventory">Inventory</Link><br/>
      <Link className="underline text-indigo-600" to="/test-method2">Test Method</Link><br/>
      <Link className="underline text-indigo-600" to="/pricebook">Price Book</Link><br/>
      <Link className="underline text-indigo-600" to="/otherjobs">Other Jobs</Link><br/>
      <Link className="underline text-indigo-600" to="/sample-collection">Sample Collection</Link><br/>
      <Link className="underline text-indigo-600" to="/data-entry">Data Entry</Link><br/>
      <Link className="underline text-indigo-600" to="/search-collector">Search Collector</Link><br/>
      <Link className="underline text-indigo-600" to="/add-user">Add User</Link><br/>
      <Link className="underline text-indigo-600" to="/user-roles">User Role Management</Link><br/>
      <Link className="underline text-indigo-600" to="/Quotations">Quotation Details</Link><br/>
      <Link className="underline text-indigo-600" to="/Detections">Detections</Link><br/>
      <Link className="underline text-indigo-600" to="/Media">Test Method with Media Support</Link><br/>
      <Link className="underline text-indigo-600" to="/Job_categories">Job Category Configuration</Link><br/>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <TitleUpdater />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customfreq" element={<CustomFrequencyWireframe />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/test-method2" element={<TestMethodDefinitionPage2 />} />
        <Route path="/pricebook" element={<PriceBook />} />
        <Route path="/otherjobs" element={<OtherJobs />} />
        <Route path="/sample-collection" element={<SampleCollection />} />
        <Route path="/data-entry" element={<DataEntry />} />
        <Route path="/search-collector" element={<SearchCollector />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/user-roles" element={<UserRoles />} />
        <Route path="/aquisition" element={<Aquisition />} />
        <Route path="/deployment" element={<Deployment />} />
        <Route path="/quotations" element={<QuotationDetailsPage />} />
        <Route path="/detections" element={<Detections />} />
        <Route path="/media" element={<Media />} />
        <Route path="/job_categories" element={<JobCategories />} />
      </Routes>
    </HashRouter>
  );
}

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const routeToHeadingMap = {
      "/": "Home",
      "/customfreq": "Custom Frequency Wireframe",
      "/inventory": "Inventory Page",
      "/test-method2": "Test Method Definition Page 2",
      "/pricebook": "Price Book",
      "/otherjobs": "Other Jobs",
      "/sample-collection": "Sample Collection",
      "/data-entry": "Data Entry",
      "/search-collector": "Search Collector",
      "/add-user": "Add User",
    };

    const heading = routeToHeadingMap[location.pathname] || "IMC Wireframes";
    document.title = heading;
  }, [location]);

  return null;
}
