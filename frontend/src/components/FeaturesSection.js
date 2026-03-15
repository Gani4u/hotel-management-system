import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: '💰',
      title: 'Best Prices',
      description: 'Guaranteed lowest rates for hotel rooms across all categories'
    },
    {
      icon: '🛎️',
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your needs'
    },
    {
      icon: '📱',
      title: 'Easy Booking',
      description: 'Simple and secure booking process in just a few clicks'
    },
    {
      icon: '🔄',
      title: 'Free Cancellation',
      description: 'Cancel your booking anytime before check-in at no cost'
    },
    {
      icon: '🏊',
      title: 'Premium Amenities',
      description: 'Swimming pool, spa, fitness center, and fine dining'
    },
    {
      icon: '📍',
      title: 'Prime Location',
      description: 'Located in the heart of the city with easy access to attractions'
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="section-header">
          <h2>Why Choose Us?</h2>
          <p>Experience luxury and comfort like never before</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;