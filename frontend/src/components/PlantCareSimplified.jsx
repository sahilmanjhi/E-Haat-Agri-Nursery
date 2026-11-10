import React, { useState } from 'react';
import { ArrowRight, BookOpen, X } from 'lucide-react';

export default function PlantCareSimplified() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const ARTICLES = [
    {
      id: 1,
      title: "Best Indoor Plants for Restaurants & Hotels",
      excerpt: "Create a welcoming atmosphere with greenery that complements your interiors without taking up too much space.",
      content: "Indoor plants can instantly make restaurants and hotels feel fresher, warmer, and more inviting. Choose low-maintenance plants like Areca Palms, Snake Plants, ZZ Plants, and Peace Lilies to add natural beauty while keeping maintenance simple.",
      img: "/images/blog/renters_plants.jpg"
    },
    {
      id: 2,
      title: "Indoor Plants Perfect for Rented Apartments",
      excerpt: "Do you live in a rented apartment and wonder if you could make it more pleasing to your eyes? A green corner changes everything...",
      content: "Low light plants like Peace Lilies and Pothos vines are easy to maintain near balcony doors or window sills. Pair them with self-watering ceramic planters to keep your wooden floors spill-free.",
      img: "/images/blog/apartment_plants.jpg"
    },
    {
      id: 3,
      title: "The Best Low-Maintenance Plants for Busy Homes",
      excerpt: "Not everyone swoons over high-maintenance schedules. If you travel or work long hours, these succulents are for you...",
      content: "Succulents like Jade Plants and Sansevieria store water in their thick fleshy leaves. They only require watering once every 2 weeks, making them ideal for frequent travelers or office desks.",
      img: "/images/blog/low_maintenance.png"
    },
    {
      id: 4,
      title: "The Perfect Plant Pairing for Every Room",
      excerpt: "They say nature brings balance to living spaces, so why not let the greens guide your home decor and energy?...",
      content: "Place air-purifying Snake Plants in the bedroom for night-time oxygen release, lush Areca Palms in the balcony for humidity, and compact Jade plants on your desk for positive productivity energy.",
      img: "/images/blog/plant_pairing.png"
    }
  ];

  return (
    <section style={{
      background: '#FAF6F0',
      padding: '70px 0'
    }}>
      <div className="container">

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '36px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{
              fontFamily: 'serif',
              fontSize: '2.8rem',
              color: '#1C1C1C',
              fontWeight: '700'
            }}>
              Plant care, simplified
            </h2>
          </div>

          <button
            style={{
              color: '#0A4C36',
              fontWeight: '700',
              fontSize: '0.95rem',
              textDecoration: 'underline',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setSelectedArticle(ARTICLES[0])}
          >
            <span>View All Guides</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* 4 Article Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {ARTICLES.map((article) => (
            <div
              key={article.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                <img
                  src={article.img}
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{
                  fontFamily: 'serif',
                  fontSize: '1.25rem',
                  color: '#1C1C1C',
                  fontWeight: '700',
                  lineHeight: '1.3',
                  marginBottom: '10px'
                }}>
                  {article.title}
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  color: '#64748B',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  flex: 1
                }}>
                  {article.excerpt}
                </p>

                <button
                  style={{
                    color: '#0A4C36',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    textAlign: 'left',
                    padding: 0
                  }}
                  onClick={() => setSelectedArticle(article)}
                >
                  Read more
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedArticle(null)}>
              <X size={20} />
            </button>

            <img
              src={selectedArticle.img}
              alt={selectedArticle.title}
              style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }}
            />

            <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', color: '#0A4C36', marginBottom: '12px' }}>
              {selectedArticle.title}
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#1C1C1C', lineHeight: '1.6', marginBottom: '20px' }}>
              {selectedArticle.content}
            </p>

            <button className="btn-primary" onClick={() => setSelectedArticle(null)}>
              Close Guide
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
