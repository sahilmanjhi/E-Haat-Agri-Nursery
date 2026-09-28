import React from 'react';

export default function TransformHome({ onSelectCategory }) {
  const ROOMS = [
    {
      title: "Living Room",
      img: "/images/rooms/living_room.jpg",
      categoryLink: "Indoor Plants"
    },
    {
      title: "Bedroom",
      img: "/images/rooms/bedroom.jpg",
      categoryLink: "low-light"
    },
    {
      title: "Balcony",
      img: "/images/rooms/balcony.jpg",
      categoryLink: "Outdoor Plants"
    },
    {
      title: "Office",
      img: "/images/rooms/office.png",
      categoryLink: "Indoor Plants"
    }
  ];

  return (
    <section style={{
      background: '#FAF0F2',
      padding: '70px 0'
    }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'serif',
            fontSize: '2.8rem',
            color: '#1C1C1C',
            fontWeight: '700'
          }}>
            Transform Your Home.
          </h2>
        </div>

        {/* 4 Large Vertical Room Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {ROOMS.map((room, idx) => (
            <div 
              key={idx}
              style={{
                position: 'relative',
                height: '420px',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer'
              }}
              onClick={() => onSelectCategory(room.categoryLink)}
            >
              <img 
                src={room.img} 
                alt={room.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />

              {/* Title overlay at top */}
              <div style={{
                position: 'absolute',
                top: '30px',
                left: 0,
                right: 0,
                textAlign: 'center',
                color: '#FFFFFF',
                textShadow: '0 2px 10px rgba(0,0,0,0.6)'
              }}>
                <h3 style={{
                  fontFamily: 'serif',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#FFFFFF'
                }}>
                  {room.title}
                </h3>
              </div>

              {/* Button overlay at bottom */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button 
                  style={{
                    background: '#FFFFFF',
                    color: '#0A4C36',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    padding: '10px 24px',
                    borderRadius: '99px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(room.categoryLink);
                  }}
                >
                  Shop Now
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
