import React from 'react';
import './Support.css';  // Import styles

function Support() {
  return (
    <div className="container my-5">
      <h1 className="text-center">Customer Support</h1>
      <p className="lead text-center">
        We're here to help. Please select from the options below or contact us directly.
      </p>

      {/* Support Options */}
      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="fas fa-question-circle fa-3x mb-3"></i>
              <h5 className="card-title">FAQ</h5>
              <p className="card-text">
                Find answers to commonly asked questions. <br />
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
                Send us an email and we’ll get back to you within 24 hours. <br />
                <p><strong>Email:</strong> Support@infinitytravel.com</p>
              </p>
              <a href="mailto:Support@infinitytravel.com" className="btn btn-primary">
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
                Call us directly for immediate assistance. <br />
                <p><strong>Phone:</strong> 800-555-5555</p>
                <p><strong>Hours:</strong> M-F 8:00AM - 5:00 PM EST</p>
              </p>
              <a href="tel:+1-800-555-5555" className="btn btn-primary">
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
