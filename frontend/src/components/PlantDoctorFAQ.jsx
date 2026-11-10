import React, { useState } from 'react';
import { FAQS } from '../data/products';
import { ChevronDown, ChevronUp, Stethoscope, MessageSquare } from 'lucide-react';

export default function PlantDoctorFAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="faq-section">
      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#EBF5F0',
            color: '#0A4C36',
            fontWeight: '800',
            fontSize: '0.8rem',
            padding: '4px 12px',
            borderRadius: '99px',
            marginBottom: '8px'
          }}>
            <Stethoscope size={16} /> 24/7 PLANT DOCTOR ADVISORY
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#0A4C36' }}>Frequently Asked Questions</h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Everything you need to know about plant delivery, care guarantee, and potting media.
          </p>
        </div>

        <div className="faq-accordion">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <div 
                className="faq-header"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                {openIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openIdx === idx && (
                <div className="faq-body">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* WhatsApp Doctor CTA Box */}
        <div style={{
          marginTop: '40px',
          background: 'linear-gradient(135deg, #0A4C36 0%, #063827 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ color: '#FED02F', fontSize: '1.4rem', marginBottom: '4px' }}>
              Have a Sick Plant? Ask Our Plant Doctor!
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem' }}>
              Send a photo of your leaf issues to +91-9876543210 on WhatsApp for instant diagnosis.
            </p>
          </div>
          <a 
            href="https://wa.me/919876543210" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <MessageSquare size={18} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
