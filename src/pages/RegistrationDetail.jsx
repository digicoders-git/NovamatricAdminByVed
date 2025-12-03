import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './CSS/RegistrationDetail.css';
import DashboardLayout from './Dashboard';

const RegistrationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchRegistration();
    }, [id]);

    const fetchRegistration = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/registration/getbyid/${id}`);

            if (response.data.success) {
                setRegistration(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch registration');
            }
        } catch (err) {
            console.error('Error fetching registration:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load registration');
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load registration details',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getConsentBadge = (value) => {
        if (typeof value === 'boolean') {
            return value ? 'Consented' : 'Not Consented';
        }
        return value || 'N/A';
    };

    const getConsentClass = (value) => {
        if (typeof value === 'boolean') {
            return value ? 'consent-yes' : 'consent-no';
        }
        const val = value?.toLowerCase() || '';
        if (val.includes('yes') || val.includes('agree')) return 'consent-yes';
        if (val.includes('no') || val.includes('decline')) return 'consent-no';
        return 'consent-neutral';
    };

    const countAgreements = () => {
        const consents = [registration.dataConsent, registration.nda, registration.ageConfirm];
        return consents.filter(c => c?.toLowerCase?.()?.includes('yes') || c === true).length;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="reg-loading">
                    <div className="loading-spinner">
                        <i className="pi pi-spin pi-spinner" />
                        <p>Loading registration details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !registration) {
        return (
            <DashboardLayout>
                <div className="reg-error">
                    <div className="error-content">
                        <i className="pi pi-exclamation-triangle" />
                        <h2>Registration Not Found</h2>
                        <p>{error || 'The requested registration could not be found.'}</p>
                        <Button
                            label="Back to Registrations"
                            icon="pi pi-arrow-left"
                            onClick={() => navigate(-1)}
                        />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="reg-detail-container">
                <Toast ref={toast} />

                {/* Header Section */}
                <div className="reg-header">
                    <div className="reg-header-left">
                        <Button
                            icon="pi pi-arrow-left"
                            className="p-button-text p-button-plain reg-back-btn"
                            onClick={() => navigate(-1)}
                        />
                        <div className="reg-header-info">
                            <h1>Registration Details</h1>
                            <div className="reg-meta">
                                <span className="reg-id">
                                    <i className="pi pi-hashtag" />
                                    {registration._id.slice(-8)}
                                </span>
                                <span className="reg-date">
                                    <i className="pi pi-clock" />
                                    {formatDate(registration.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="reg-header-actions">
                        <Button
                            icon="pi pi-refresh"
                            className="p-button-text"
                            onClick={fetchRegistration}
                        />
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="reg-stats">
                    <div className="stat-card">
                        <i className="pi pi-shield stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{countAgreements()}/3</span>
                            <span className="stat-label">Consents</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="pi pi-user stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{registration.age}</span>
                            <span className="stat-label">Age</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="pi pi-briefcase stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{registration.employmentStatus}</span>
                            <span className="stat-label">Status</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="pi pi-home stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{registration.householdSize}</span>
                            <span className="stat-label">Household</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="pi pi-map-marker stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{registration.city}</span>
                            <span className="stat-label">City</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="reg-content">
                    {/* Personal Information */}
                    <Card className="reg-card">
                        <div className="card-title">
                            <i className="pi pi-user" />
                            <h2>Personal Information</h2>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">Full Name</span>
                                <span className="info-value strong">{registration.fullName}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Email</span>
                                <a href={`mailto:${registration.email}`} className="info-value link">
                                    {registration.email}
                                </a>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Age</span>
                                <span className="info-value">{registration.age}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Gender</span>
                                <span className={`info-badge ${registration.gender?.toLowerCase()}`}>
                                    {registration.gender}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Education</span>
                                <span className="info-value">{registration.education}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Location Information */}
                    <Card className="reg-card">
                        <div className="card-title">
                            <i className="pi pi-map-marker" />
                            <h2>Location Information</h2>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">Country</span>
                                <span className="info-value strong">{registration.country}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">State/Province</span>
                                <span className="info-value">{registration.state}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">City</span>
                                <span className="info-value">{registration.city}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Pincode/ZIP</span>
                                <span className="info-value mono">{registration.pincode}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Location</span>
                                <span className="info-value">
                                    {registration.location || `${registration.city}, ${registration.state}, ${registration.country}`}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Professional Information */}
                    <Card className="reg-card">
                        <div className="card-title">
                            <i className="pi pi-briefcase" />
                            <h2>Professional Information</h2>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">Employment Status</span>
                                <span className="info-value strong">{registration.employmentStatus}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Job Title</span>
                                <span className="info-value">{registration.jobTitle || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Industry</span>
                                <span className="info-value">{registration.industry}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Experience</span>
                                <span className="info-value">{registration.experience}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Designation</span>
                                <span className="info-value">{registration.designation}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Organization Size</span>
                                <span className="info-value">{registration.orgSize}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Purchase Decision</span>
                                <span className="info-value">{registration.purchaseDecision}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Household & Financial */}
                    <Card className="reg-card">
                        <div className="card-title">
                            <i className="pi pi-home" />
                            <h2>Household & Financial</h2>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">Household Size</span>
                                <span className="info-value">{registration.householdSize}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Marital Status</span>
                                <span className="info-value">{registration.maritalStatus}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Income</span>
                                <span className="info-value strong">{registration.income}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Home Ownership</span>
                                <span className="info-value">{registration.homeOwnership}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Vehicle</span>
                                <span className="info-value">{registration.vehicle}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Communication</span>
                                <span className="info-value">{registration.communication}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Consents & Agreements */}
                    <Card className="reg-card consent-card-full">
                        <div className="card-title">
                            <i className="pi pi-file-check" />
                            <h2>Consents & Agreements</h2>
                        </div>
                        <div className="consent-body">
                            <div className="consent-item">
                                <div className="consent-text">
                                    <i className="pi pi-database" />
                                    <span>Data Collection Consent</span>
                                </div>
                                <span className={`consent-badge ${getConsentClass(registration.dataConsent)}`}>
                                    {getConsentBadge(registration.dataConsent)}
                                </span>
                            </div>
                            <div className="consent-item">
                                <div className="consent-text">
                                    <i className="pi pi-lock" />
                                    <span>NDA Agreement</span>
                                </div>
                                <span className={`consent-badge ${getConsentClass(registration.nda)}`}>
                                    {getConsentBadge(registration.nda)}
                                </span>
                            </div>
                            <div className="consent-item">
                                <div className="consent-text">
                                    <i className="pi pi-verified" />
                                    <span>Age Confirmation</span>
                                </div>
                                <span className={`consent-badge ${getConsentClass(registration.ageConfirm)}`}>
                                    {getConsentBadge(registration.ageConfirm)}
                                </span>
                            </div>
                            <div className="consent-item">
                                <div className="consent-text">
                                    <i className="pi pi-check-circle" />
                                    <span>Final Consent</span>
                                </div>
                                <span className={`consent-badge ${registration.finalConsent ? 'consent-yes' : 'consent-no'}`}>
                                    {registration.finalConsent ? 'Agreed' : 'Not Agreed'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Technical Information */}
                    <Card className="reg-card technical-full">
                        <div className="card-title">
                            <i className="pi pi-server" />
                            <h2>Technical Information</h2>
                        </div>
                        <div className="card-body">
                            <div className="info-row">
                                <span className="info-label">IP Address</span>
                                <span className="info-value mono">{registration.ipAddress || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">User Agent</span>
                                <span className="info-value mono small">{registration.userAgent || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Created At</span>
                                <span className="info-value">{formatDate(registration.createdAt)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Last Updated</span>
                                <span className="info-value">{formatDate(registration.updatedAt)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RegistrationDetail;