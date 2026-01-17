import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import SurveyTake from "./SurveyTake";
import SurveyNotLive from "./SurveyNotLive";

const PublicSurveyGuard = () => {
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkSurvey = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/survey/public/${id}`);
        console.log(res);
        
        setIsActive(res.data.data.isActive);
      } catch (err) {
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    checkSurvey();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h3>Loading survey...</h3>
      </div>
    );
  }

  return isActive ? <SurveyTake /> :<SurveyNotLive/>;
};

export default PublicSurveyGuard;
