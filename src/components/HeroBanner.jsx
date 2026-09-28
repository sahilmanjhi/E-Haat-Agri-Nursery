import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/products';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, Award } from 'lucide-react';

export default function HeroBanner({ onExploreCategory }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-slide">
          <div className="hero-content">
            <span className="hero-badge">{slide.badge}</span>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '2px', color: '#FED02F', marginBottom: '8px' }}>
              {slide.tagline}
            </div>
            <h1>{slide.title}</h1>
            <p>{slide.subtitle}</p>
            <div className="hero-actions">
              <button 
                className="btn-primary" 
                onClick={() => onExploreCategory(slide.ctaLink)}
              >
                <span>{slide.ctaText}</span>
                <ArrowRight size={18} />
              </button>
              <button 
                className="btn-secondary"
                onClick={() => onExploreCategory('Indoor Plants')}
              >
                View Best Sellers
              </button>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <img src={slide.image} alt={slide.title} />
          </div>
        </div>

        {/* Carousel Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          paddingBottom: '24px'
        }}>
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: currentSlide === idx ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: currentSlide === idx ? '#FED02F' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                border: 'none'
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
