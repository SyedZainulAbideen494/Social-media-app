import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../app-modules/api_routes';
import './company.css';

const JoinedCompanies = () => {
  const [joinedCompanies, setJoinedCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token not found');
      return;
    }

    axios.post(API_ROUTES.getJoinedCompanies, { token })
      .then(response => {
        const { companies } = response.data;
        setJoinedCompanies(companies);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching joined companies:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="joined-companies-container">
      {isLoading ? (
        <p>Loading...</p>
      ) : joinedCompanies.length === 0 ? (
        <p>You are not in any company yet.</p>
      ) : (
        joinedCompanies.map((company, index) => (
          <div key={index} className="company-box">{company}</div>
        ))
      )}
    </div>
  );
};

export default JoinedCompanies;