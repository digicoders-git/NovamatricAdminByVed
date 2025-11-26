import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Surveys from "./pages/Surveys";
import SurveyBuilder from "./pages/SurveyBuilder";
// import SurveyTake from "./pages/SurveyTake";
import MainPage from "./pages/MainPage";
import CompleteServey from "./pages/CompleteServey";
import TerminateSurvey from './pages/TerminatedSurvey'
import QuotaFullSurveys from "./pages/QuotaFull";
import SurveyTake from "./pages/SurveyTake";
import SurveyFullPage from "./pages/SurveyFullPage";
import Profile from "./pages/Profile";
import SurveyResponses from "./pages/Submission";
import Redirectlinks from "./pages/Redirectlinks";

export default function App() {
  const [auth, setAuth] = useState(Boolean(localStorage.getItem("admin")));

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE (only when NOT logged in) */}
        <Route
          path="/login"
          element={
            auth ? <Navigate to="/" /> : <Login setAuth={setAuth} />
          }
        />

        <Route path="/survey/:id" element={<SurveyTake/>} />
        {/* PROTECTED ROUTES */}
        {auth ? (
          <>
            <Route path="/" element={<MainPage />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/survey-builder" element={<SurveyBuilder />} />
            <Route path="/complete-survey" element={<CompleteServey />} />
            <Route path="/terminate-survey" element={<TerminateSurvey/>} />
            <Route path="/quota-full-survey" element={<QuotaFullSurveys/>} />
            <Route path='/survey-view/:id' element={<SurveyFullPage/>}/>
            <Route path='/survey-response/:id' element={<SurveyResponses/>}/>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/redirect-links' element={<Redirectlinks/>}/>
          </>
        ) : (
          /* If NOT logged in, ANY admin route redirects to login */
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        {/* PUBLIC ROUTE FOR TAKING SURVEY */}
        {/* <Route path="/survey/:id" element={<terminateSurvey />} /> */}

      </Routes>
    </BrowserRouter>
  );
}
