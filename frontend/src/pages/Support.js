import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faEnvelope,
  faPhone,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { Card } from 'react-bootstrap';
import './Support.css';

function Support() {
  return (
    <div className="support-page">
      {/* Hero Section */}
      <div className="support-hero">
        <div className="container">
          <h1 className="text-center mb-4">Customer Support</h1>
          <p className="lead text-center text-white mb-0">
            We're here to help. Please select from the options below or contact us directly.
          </p>
        </div>
      </div>

      {/* Support Options */}
      <div className="container my-5">
        <div className="row g-4">
          {/* FAQ Card */}
          <div className="col-md-4">
            <Card className="support-card h-100">
              <Card.Body className="text-center d-flex flex-column">
                <div className="card-content">
                  <div className="icon-wrapper">
                    <FontAwesomeIcon icon={faQuestionCircle} className="support-icon" />
                  </div>
                  <h3 className="support-title">FAQ</h3>
                  <p className="support-text">
                    Find answers to commonly asked questions about our services and booking process.
                  </p>
                </div>
                <div className="mt-auto">
                  <button 
                    className="btn btn-primary support-btn" 
                    onClick={() => window.location.href = '/faq'}
                  >
                    Go to FAQ
                  </button>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Email Support Card */}
          <div className="col-md-4">
            <Card className="support-card h-100">
              <Card.Body className="text-center d-flex flex-column">
                <div className="card-content">
                  <div className="icon-wrapper email-icon">
                    <FontAwesomeIcon icon={faEnvelope} className="support-icon" />
                  </div>
                  <h3 className="support-title">Email Support</h3>
                  <p className="support-text">
                    Send us an email and we'll get back to you within 24 hours.
                  </p>
                  <div className="contact-info">
                    <strong>Email:</strong>
                    <p>Support@infinitytravel.com</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <a 
                    href="mailto:Support@infinitytravel.com" 
                    className="btn btn-primary support-btn"
                  >
                    Email Us
                  </a>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Phone Support Card */}
          <div className="col-md-4">
            <Card className="support-card h-100">
              <Card.Body className="text-center d-flex flex-column">
                <div className="card-content">
                  <div className="icon-wrapper phone-icon">
                    <FontAwesomeIcon icon={faPhone} className="support-icon" />
                  </div>
                  <h3 className="support-title">Phone Support</h3>
                  <p className="support-text">
                    Call us directly for immediate assistance.
                  </p>
                  <div className="contact-info">
                    <strong>Phone:</strong>
                    <p>800-555-5555</p>
                    <strong>Hours:</strong>
                    <p>M-F 8:00AM - 5:00 PM EST</p>
                  </div>
                </div>
                <div className="mt-auto">
                  <a 
                    href="tel:+1-800-555-5555" 
                    className="btn btn-primary support-btn"
                  >
                    Call Us
                  </a>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;