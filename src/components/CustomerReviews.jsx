import React, { useState } from 'react';
import { REVIEWS } from '../data/products';
import { Star, CheckCircle, ThumbsUp, MessageSquare } from 'lucide-react';

export default function CustomerReviews() {
  const [reviewsList, setReviewsList] = useState(REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    city: '',
    rating: 5,
    title: '',
    comment: ''
  });

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const added = {
      id: 'r-' + Date.now(),
      name: newReview.name,
      city: newReview.city || 'India',
      rating: Number(newReview.rating),
      date: 'Just now',
      verified: true,
      title: newReview.title || 'Great Plant Quality!',
      comment: newReview.comment,
      productName: 'Verified Purchase',
      img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    };

    setReviewsList([added, ...reviewsList]);
    setShowForm(false);
    setNewReview({ name: '', city: '', rating: 5, title: '', comment: '' });
  };

  return (
    <section style={{ padding: '60px 0', background: '#FFFFFF' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="reviews-header-bar">
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#00B566', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              REAL CUSTOMER STORIES
            </span>
            <h2 className="reviews-header-title">Ratings & Reviews</h2>
            <div className="reviews-rating-bar">
              <div style={{ display: 'flex', color: '#FED02F', flexShrink: 0 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#FED02F" stroke="#FED02F" />
                ))}
              </div>
              <strong style={{ fontSize: '1.05rem', whiteSpace: 'nowrap' }}>4.9 out of 5</strong>
              <span className="reviews-count-text">(Based on 12,450+ Customer Reviews)</span>
            </div>
          </div>

          <button className="btn-primary reviews-write-btn" onClick={() => setShowForm(!showForm)}>
            <MessageSquare size={16} />
            <span>{showForm ? 'Cancel' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Add Review Form */}
        {showForm && (
          <form 
            onSubmit={handleAddReview}
            style={{
              background: '#F8FAF8',
              border: '1.5px solid #CADFD4',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '40px'
            }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#0A4C36', marginBottom: '16px' }}>Share Your Plant Experience</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newReview.name}
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>City</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pune"
                  value={newReview.city}
                  onChange={e => setNewReview({ ...newReview, city: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Rating</label>
                <select 
                  value={newReview.rating}
                  onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Review Title</label>
              <input 
                type="text" 
                placeholder="e.g. Beautiful, healthy leaves!"
                value={newReview.title}
                onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Your Review</label>
              <textarea 
                rows="3" 
                required
                placeholder="Tell us how your plant is thriving!"
                value={newReview.comment}
                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
              />
            </div>

            <button type="submit" className="btn-primary">Submit Review</button>
          </form>
        )}

        {/* Reviews Cards List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {reviewsList.map(r => (
            <div 
              key={r.id}
              style={{
                background: '#FAFBF9',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={r.img} 
                  alt={r.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '700', color: '#0A4C36', fontSize: '0.95rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {r.city} • {r.date}
                  </div>
                </div>
                {r.verified && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.7rem',
                    background: '#FED02F',
                    color: '#0A4C36',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle size={12} /> Verified Buyer
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', color: '#FED02F' }}>
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#FED02F" stroke="#FED02F" />
                ))}
              </div>

              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1C1C1C' }}>
                "{r.title}"
              </div>

              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.6' }}>
                {r.comment}
              </p>

              <div style={{
                marginTop: 'auto',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#0A4C36',
                background: '#EBF5F0',
                padding: '6px 10px',
                borderRadius: '6px',
                display: 'inline-block'
              }}>
                Item: {r.productName}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
