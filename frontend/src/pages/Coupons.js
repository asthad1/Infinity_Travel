import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Coupons.css';

const Coupons = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === 'admin';

  const [coupons, setCoupons] = useState([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [notification, setNotification] = useState('');
  const [couponData, setCouponData] = useState({
    coupon_code: '',
    discount_percentage: 0,
    discount_amount: 0,
    start_date: '',
    end_date: '',
    minimum_order_amount: 0,
    user_roles: '',
    discount_type: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://localhost:9001/api/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleCopyCode = (couponCode) => {
    navigator.clipboard.writeText(couponCode);
    setNotification('Code copied to clipboard!');
    setTimeout(() => setNotification(''), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCouponData({ ...couponData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:9001/api/coupons', couponData);
      fetchCoupons(); // Refresh the coupons list
      setShowAddCoupon(false); // Hide the form after saving
      setCouponData({ // Reset the form
        coupon_code: '',
        discount_percentage: 0,
        discount_amount: 0,
        start_date: '',
        end_date: '',
        minimum_order_amount: 0,
        user_roles: '',
        discount_type: '',
      });
    } catch (error) {
      console.error("Error adding coupon:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Coupons</h2>
      {notification && <div className="alert alert-info">{notification}</div>}
      
      {isAdmin && (
        <>
          <button className="btn btn-primary mb-3" onClick={() => setShowAddCoupon(!showAddCoupon)}>
            Add New Coupon
          </button>

          {showAddCoupon && (
            <form onSubmit={handleSubmit} className="add-coupon-form">
              <div className="form-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  name="coupon_code"
                  value={couponData.coupon_code}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Discount Percentage</label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={couponData.discount_percentage}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Discount Amount</label>
                <input
                  type="number"
                  name="discount_amount"
                  value={couponData.discount_amount}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={couponData.start_date}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={couponData.end_date}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Minimum Order Amount</label>
                <input
                  type="number"
                  name="minimum_order_amount"
                  value={couponData.minimum_order_amount}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>User Role or Email ID</label>
                <input
                  type="text"
                  name="user_roles"
                  value={couponData.user_roles}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Discount Type</label>
                <input
                  type="text"
                  name="discount_type"
                  value={couponData.discount_type}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-primary mt-3">Save Coupon</button>
              <button type="button" className="btn btn-secondary mt-3 ms-2" onClick={() => setShowAddCoupon(false)}>Cancel</button>
            </form>
          )}
          
          {/* Coupons list */}
          <div className="coupon-list mt-4">
            {coupons.map((coupon) => (
              <div key={coupon.coupon_id} className="coupon-box">
                <div className="coupon-details">
                  <h4>{coupon.discount_type} {coupon.discount_percentage}% Off</h4>
                  <p>Code: {coupon.coupon_code}</p>
                  <p>Applies to: {coupon.user_roles || 'All Users'}</p>
                  <p>Minimum Order: ${coupon.minimum_order_amount || 0}</p>
                  <p>Expires on: {new Date(coupon.end_date).toLocaleDateString()}</p>
                </div>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => handleCopyCode(coupon.coupon_code)}
                >
                  Copy code
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Coupons;
