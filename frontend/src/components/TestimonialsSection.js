import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Traveler',
      image: '👩‍💼',
      rating: 5,
      text: 'Exceptional service and luxurious accommodations. The staff went above and beyond to make my stay memorable. Highly recommended!'
    },
    {
      name: 'Michael Chen',
      role: 'Family Vacation',
      image: '👨‍👩‍👧‍👦',
      rating: 5,
      text: 'Perfect family getaway! The rooms were spacious, clean, and the kids loved the pool. Will definitely be back next year.'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Wedding Guest',
      image: '👰',
      rating: 5,
      text: 'Stayed for my best friend\'s wedding. The venue was stunning and the hospitality was outstanding. Made our celebration even more special.'
    }
  ];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="section-header">
          <h2>What Our Guests Say</h2>
          <p>Real experiences from our satisfied customers</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">{testimonial.image}</div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <span className="testimonial-role">{testimonial.role}</span>
                </div>
              </div>
              <div className="testimonial-rating">
                {renderStars(testimonial.rating)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;