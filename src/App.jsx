import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Surveys from "./pages/Surveys";
import SurveyBuilder from "./pages/SurveyBuilder";
import MainPage from "./pages/MainPage";
import CompleteServey from "./pages/CompleteServey";
import TerminateSurvey from "./pages/TerminatedSurvey";
import QuotaFullSurveys from "./pages/QuotaFull";
import SurveyFullPage from "./pages/SurveyFullPage";
import Profile from "./pages/Profile";
import SurveyResponses from "./pages/Submission";
import Redirectlinks from "./pages/Redirectlinks";
import ShowRegistration from "./pages/ShowAllRegistration";
import RegistrationDetail from "./pages/RegistrationDetail";

import PublicSurveyGuard from "./pages/PublicSurveyGuard";
import TotalClick from "./pages/TotalClick";
import CreateLinks from "./pages/CreateLinks";

export default function App() {
  const [auth, setAuth] = useState(Boolean(localStorage.getItem("admin")));

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={auth ? <Navigate to="/" /> : <Login setAuth={setAuth} />}
        />

        {/* 🌍 PUBLIC SURVEY ROUTE (WITH ACTIVE CHECK) */}
        <Route path="/survey/:id" element={<PublicSurveyGuard />} />

        {/* 🔐 PROTECTED ROUTES */}
        {auth ? (
          <>
            <Route path="/" element={<MainPage />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/survey-builder" element={<SurveyBuilder />} />
            <Route path="/total-clicks" element={<TotalClick />} />
            <Route path="/complete-survey" element={<CompleteServey />} />
            <Route path="/terminate-survey" element={<TerminateSurvey />} />
            <Route path="/quota-full-survey" element={<QuotaFullSurveys />} />
            <Route path="/survey-view/:id" element={<SurveyFullPage />} />
            <Route path="/survey-response/:id" element={<SurveyResponses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/redirect-links" element={<Redirectlinks />} />
            <Route path="/create-links" element={<CreateLinks />} />
            <Route path="/registrations-all" element={<ShowRegistration />} />
            <Route path="/view-registration/:id" element={<RegistrationDetail />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}

      </Routes>
    </BrowserRouter>
  );
}
