import React, { useEffect, useRef } from 'react';
import './LandingPage.css';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useNavigate } from 'react-router-dom'; //

import Logo from "../images/Logo.svg";
import Feature1 from '../images/Feature1.png';

const LandingPage = () => {
  const headerTitleRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Register the GSAP TextPlugin for text animation
    gsap.registerPlugin(TextPlugin);

    // 2) Animate the hero heading text
    if (headerTitleRef.current) {
      gsap.to(headerTitleRef.current, {
        duration: 4,
        text: "Unlocking the Power of AI",
        ease: "none"
      });
    }

    // 3) Animate feature cards with a fade + slide-in effect
    gsap.from(".feature-card", {
      y: 100,
      opacity: 0,
      duration: 3,
      stagger: 0.2,
      ease: "power2.out"
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Updated/expanded Features array
  const features = [
    {
      image: Feature1,
      title: "Guided Lessons",
      description: "Learn AI fundamentals step-by-step with curated tutorials."
    },
    {
      image: Feature1,
      title: "Hands-on Labs",
      description: "Apply your skills in real-world coding challenges for true understanding."
    },
    {
      image: Feature1,
      title: "Community Support",
      description: "Engage with mentors and peers to share ideas and grow faster together."
    },
    {
      image: Feature1,
      title: "AI Projects",
      description: "Build real AI applications, from simple classifiers to advanced deep learning."
    }
  ];

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <img src={Logo} alt="Logo" />
        </div>
        {/* New Buttons on top right */}
        <div className="header-buttons">
          <button onClick={() => navigate('/SignIn')}>Sign In</button>
          <button onClick={() => navigate('/SignUp')}>Create Account</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1 ref={headerTitleRef}>Loading the Power of AI...</h1>
        <p>
          Join 100HourAI to learn, build, and accelerate your AI journey.
          Our platform provides personalized lessons, hands-on labs,
          and community support.
        </p>
        <button onClick={() => navigate('/SignUp')}>Get Started</button>

        <div className="video-container">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/erhqbyvPesY"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-card">
            <img src={feature.image} alt={feature.title} />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 100HourAI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;