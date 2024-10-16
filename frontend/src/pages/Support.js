import React from 'react';
import './Support.css';  // Import styles

function Support() {
  return (
    <div className="container my-5">
      <h1 className="text-center">Customer Support</h1>
      <p className="lead text-center">
        We're here to help. Please select from the options below.
      </p>

      {/* Support Options */}
      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-question-circle fa-3x mb-3"></i>
              <h5 className="card-title">FAQ</h5>
              <p className="card-text">
                Find answers to commonly asked questions.
              </p>
              <a href="/faq" className="btn btn-primary">
                Go to FAQ
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-envelope fa-3x mb-3"></i>
              <h5 className="card-title">Email Support</h5>
              <p className="card-text">
                Send us an email and we’ll get back to you within 24 hours.
              </p>
              <a href="mailto:support@infinitytravel.com" className="btn btn-primary">
                Email Us
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-phone fa-3x mb-3"></i>
              <h5 className="card-title">Phone Support</h5>
              <p className="card-text">
                Call us directly for immediate assistance.
              </p>
              <a href="tel:+1234567890" className="btn btn-primary">
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
