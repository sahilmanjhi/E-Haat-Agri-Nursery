import React from 'react';
import { Sprout, Quote, Heart, ShieldCheck } from 'lucide-react';

export default function OurStory() {
  return (
    <section style={{
      background: '#04422E',
      color: '#FFFFFF',
      padding: '60px 0',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="our-story-grid">

          {/* Left Column: Brand Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px',
              padding: '30px 24px',
              background: 'linear-gradient(145deg, #063827 0%, #084C35 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '300px',
              position: 'relative',
              overflow: 'hidden'
            }}>

              {/* Background Sprout Watermark */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-20px',
                opacity: 0.08,
                color: '#FFFFFF',
                pointerEvents: 'none'
              }}>
                <Sprout size={240} />
              </div>

              {/* Badge top-left */}
              <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(10, 76, 54, 0.85)',
                backdropFilter: 'blur(6px)',
                border: '1.5px solid #00B566',
                color: '#00B566',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '6px 14px',
                borderRadius: '99px',
                letterSpacing: '1px',
                marginBottom: '20px'
              }}>
                ITMU e-haat AGRI NURSERY
              </div>

              {/* Central Quote Graphic */}
              <div style={{ margin: 'auto 0' }}>
                <Quote size={36} style={{ color: '#FED02F', marginBottom: '8px', opacity: 0.9 }} />
                <h3 style={{
                  fontFamily: 'serif',
                  fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  lineHeight: '1.2'
                }}>
                  "Freshness at Your Doorstep."
                </h3>
              </div>

              {/* Brand Footer Mark */}
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                paddingTop: '16px',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img
                  src="/images/itmu_ehaat_logo_bg.png"
                  alt="ITMU e-haat Logo"
                  style={{
                    height: '44px',
                    width: 'auto',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#FED02F', fontWeight: '800', lineHeight: '1.2' }}>
                    ITMU e-haat Agri Nursery
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                    Freshness at Your Doorstep.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Story Text */}
          <div>
            <h2 style={{
              fontFamily: 'serif',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              color: '#FFFFFF',
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              Our Story.
            </h2>

            <h3 style={{
              fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: '20px'
            }}>
              "Anyone can be a <span style={{ color: '#FED02F' }}>plant parent!</span>"
            </h3>

            <div style={{
              borderLeft: '2px solid #00B566',
              paddingLeft: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: '1.6'
            }}>
              <p>
                When <strong>ITMU e-haat Agri Nursery</strong> was created, we believed that more people would fall in love with gardening if it felt simpler, more accessible, and less intimidating.
              </p>
              <p>
                Growing plants has always been a part of who we are, rooted in our homes, our traditions, our everyday lives. But for many, getting started wasn't easy. ITMU e-haat was created to change that. To make gardening easy and inviting for everyone, whether you're bringing home your very first plant or nurturing a lifelong passion.
              </p>
              <p>
                Because that special connection to nature, once you feel it, never really leaves you.
              </p>
              <div style={{ fontWeight: '700', color: '#FED02F', fontSize: '1rem', marginTop: '6px' }}>
                Welcome to ITMU e-haat Agri Nursery — Freshness at Your Doorstep.! 🌿
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
