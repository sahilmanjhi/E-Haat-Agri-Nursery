import React, { useState } from 'react';
import { X, Sparkles, Sun, Home, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { PRODUCTS } from '../data/products';

export default function PlantQuizModal({ isOpen, onClose, onAddToCart, onQuickView }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    room: '',
    light: '',
    priority: ''
  });

  const handleSelect = (key, value) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4); // Results
    }
  };

  // Filter recommendations based on quiz choices
  const recommendedPlants = PRODUCTS.filter(p => {
    if (answers.priority === 'Pet Safe' && !p.petFriendly) return false;
    if (answers.priority === 'Air Purifying' && !p.airPurifying) return false;
    return true;
  }).slice(0, 3);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#FED02F',
            color: '#000',
            fontWeight: '800',
            fontSize: '0.75rem',
            padding: '4px 12px',
            borderRadius: '99px',
            marginBottom: '8px'
          }}>
            <Sparkles size={14} /> 30-SECOND PLANT MATCHMAKER
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#0A4C36' }}>Find Your Ideal Plant Match</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Answer 3 simple questions & get personalized plant recommendations!
          </p>
        </div>

        {/* Step Indicator */}
        {step <= 3 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: step >= s ? '#0A4C36' : '#E2E8F0',
                  transition: 'background 0.3s'
                }} 
              />
            ))}
          </div>
        )}

        {/* Question 1 */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', textAlign: 'center' }}>
              1. Where will you place your new plant?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['Living Room', 'Bedroom', 'Balcony', 'Workspace / Desk'].map(room => (
                <button
                  key={room}
                  onClick={() => handleSelect('room', room)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FAFBF9',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    color: '#0A4C36',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 2 */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', textAlign: 'center' }}>
              2. How much sunlight does this spot get?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Bright Indirect Light', desc: 'Near a sunny window with filtered light' },
                { label: 'Low Light / Shade', desc: 'Indoor room or office away from windows' },
                { label: 'Direct Sunlight', desc: 'Open balcony or terrace with direct rays' }
              ].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect('light', opt.label)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FAFBF9',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#0A4C36', fontSize: '0.95rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 3 */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', textAlign: 'center' }}>
              3. What is your primary requirement?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Low Maintenance', icon: '🌿' },
                { label: 'Air Purifying', icon: '🍃' },
                { label: 'Pet Safe', icon: '🐾' },
                { label: 'Good Fortune / Feng Shui', icon: '✨' }
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSelect('priority', p.label)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FAFBF9',
                    fontWeight: '700',
                    color: '#0A4C36',
                    fontSize: '0.95rem'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{p.icon}</div>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <CheckCircle2 size={36} style={{ color: '#00B566', marginBottom: '6px' }} />
              <h3 style={{ fontSize: '1.3rem', color: '#0A4C36' }}>Your Top Plant Matches</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Based on your preferences for {answers.room} & {answers.priority}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {recommendedPlants.map(product => (
                <div 
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAF8'
                  }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#0A4C36', fontSize: '0.95rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{product.light} • ₹{product.price}</div>
                  </div>
                  <button 
                    className="add-cart-btn"
                    onClick={() => {
                      onAddToCart(product, product.potOptions ? product.potOptions[0] : null);
                      onClose();
                    }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>

            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(1)}>
              Retake Quiz
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
