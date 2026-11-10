import React from 'react';
import { Phone } from 'lucide-react';

export default function AnnouncementBar() {
  const announcementItems = [
    {
      id: 'shipping',
      icon: '🚚',
      text: 'Free Shipping Above ₹499'
    },
    {
      id: 'combo',
      icon: '🌿',
      text: 'Buy Any 4 Plants @ ₹1,199'
    },
    {
      id: 'discount',
      icon: '🎉',
      text: 'Get 10% Off on Orders Above ₹1,499'
    },
    {
      id: 'nursery',
      icon: '🪴',
      text: 'Fresh Nursery Plants Available'
    }
  ];

  // Repeat items array 4 times for seamless continuous infinite marquee scrolling
  const repeatedItems = [
    ...announcementItems,
    ...announcementItems,
    ...announcementItems,
    ...announcementItems
  ];

  return (
    <div className="announcement-bar-wrapper">
      <div className="announcement-bar-container">
        
        {/* Left Live Badge (Desktop) */}
        <div className="announcement-left-info">
          <span className="live-pulse"></span>
          <span className="info-text">ITMU e-Haat Nursery</span>
        </div>

        {/* Infinite Marquee Track Viewport */}
        <div className="marquee-viewport">
          <div className="marquee-track">
            {repeatedItems.map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`} 
                className="announcement-item"
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-text">{item.text}</span>
                <span className="item-separator">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Phone Helpline (Desktop) */}
        <div className="announcement-right-info">
          <a href="tel:+919876543210" className="helpline-link">
            <Phone size={12} className="phone-icon" />
            <span>Helpline: +91-9876543210</span>
          </a>
        </div>

      </div>
    </div>
  );
}
