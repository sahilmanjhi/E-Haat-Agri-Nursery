import React from 'react';

export default function FarmToHome() {
  const STAGES = [
    {
      id: 1,
      title: "Grown at our farm",
      desc: "Nurtured in our ITM farm for 4–8 weeks before reaching you.",
      img: "/images/farm/grown_at_farm.jpg"
    },
    {
      id: 2,
      title: "3-step quality check",
      desc: "Only the healthiest make it to you.",
      img: "/images/farm/quality_check.png"
    },
    {
      id: 3,
      title: "Survival packaging",
      desc: "Moisture-locked, breathable wrap. Tested at 42°C & 5-day transit.",
      img: "/images/farm/survival_packaging.png"
    },
    {
      id: 4,
      title: "Arrives alive",
      desc: "30-day guarantee with free replacement. No questions, just care.",
      img: "/images/farm/arrives_alive.png"
    }
  ];

  return (
    <section className="farm-to-home-section" style={{
      background: '#046B46',
      color: '#FFFFFF'
    }}>
      <div className="container">

        {/* Header */}
        <div className="farm-to-home-header" style={{ textAlign: 'center' }}>
          <h2 className="farm-to-home-title" style={{
            fontFamily: 'serif',
            fontSize: 'clamp(1.75rem, 5vw, 2.8rem)',
            color: '#FFFFFF',
            fontWeight: '700',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>
            From Our Farm to Your Home
          </h2>
          <p className="farm-to-home-sub" style={{
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}>
            Every plant is nursed in our ITMU farms, hand-picked, and packed to survive the journey - not just reach your doorstep.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="farm-to-home-grid">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="farm-stage-card"
              style={{
                background: '#063827',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ width: '100%', height: '240px', overflow: 'hidden' }}>
                <img
                  src={stage.img}
                  alt={stage.title}
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

              <div style={{ padding: '24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{
                  fontFamily: 'serif',
                  fontSize: '1.4rem',
                  color: '#FFFFFF',
                  marginBottom: '8px'
                }}>
                  {stage.title}
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.4'
                }}>
                  {stage.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
