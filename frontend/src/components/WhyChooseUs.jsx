import React from 'react';
import { ShieldCheck, PackageCheck, Headphones, RefreshCw } from 'lucide-react';

export default function WhyChooseUs() {
  const FEATURES = [
    {
      icon: <ShieldCheck size={32} />,
      title: "100% Healthy Plant Arrival",
      desc: "Fresh from our ITM Agri nurseries directly to your doorstep in prime condition."
    },
    {
      icon: <PackageCheck size={32} />,
      title: "5-Layer Eco Packaging",
      desc: "Patented breathable box design holds pots securely & prevents soil spillage in transit."
    },
    {
      icon: <RefreshCw size={32} />,
      title: "7-Day Free Replacement",
      desc: "Any transit damage or plant distress within 7 days is replaced with zero questions asked."
    },
    {
      icon: <Headphones size={32} />,
      title: "24/7 Expert Plant Doctor",
      desc: "Free lifetime plant care advice from horticulturists via WhatsApp & phone call."
    }
  ];

  return (
    <section className="why-section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#00B566', textTransform: 'uppercase', letterSpacing: '1px' }}>
            THE ITMU e-haat ADVANTAGE • GROW BETTER. SHOP SMARTE.
          </span>
          <h2 style={{ fontSize: '2.2rem', color: '#0A4C36', marginTop: '4px' }}>
            Why 1 Lakh+ Plant Parents Choose ITMU e-haat
          </h2>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon-box">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
