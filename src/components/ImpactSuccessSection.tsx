import { useState, useEffect } from 'react';

import lampCenter from '../assets/images/lamp-center.svg'; // 90 degrees
import lamp45 from '../assets/images/lamp-right.svg'; // 45 degrees  
import lamp135 from '../assets/images/lamp-left.svg'; // 135 degrees

import massiveImprovementImg from '../assets/images/massive-improve.svg';
import reducedWaitTimeImg from '../assets/images/waiting-time.svg';
import onlineDataImg from '../assets/images/online.svg';
import increasedDrugImg from '../assets/images/drug.svg';
import improvedOperationalImg from '../assets/images/operational.svg';
import unifiedDataImg from '../assets/images/data.svg';

const ImpactSuccessSection = () => {
  const [currentLampIndex, setCurrentLampIndex] = useState(0);

  const lampPositions = [
    { image: lampCenter, rotation: 0, lightDirection: 'center' }, // Center (90 degrees)
    { image: lamp45, rotation: -45, lightDirection: 'right' }, // 45 degrees
    { image: lampCenter, rotation: 0, lightDirection: 'center' }, // Back to center
    { image: lamp135, rotation: 45, lightDirection: 'left' }, // 135 degrees
    { image: lampCenter, rotation: 0, lightDirection: 'center' }, // Back to center
  ];

  const impactItems = [
    {
      image: massiveImprovementImg,
      title: "Massive improvement in health infrastructure across THIs"
    },
    {
      image: reducedWaitTimeImg,
      title: "Reduced Patient Wait Time"
    },
    {
      image: onlineDataImg,
      title: "Online real-time data acquisition from Tertiary Health Institutions (THIs)"
    },
    {
      image: increasedDrugImg,
      title: "Increased drug availability"
    },
    {
      image: improvedOperationalImg,
      title: "Improved operational efficiency at THIs"
    },
    {
      image: unifiedDataImg,
      title: "Unified data and analytics across the National Health System"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLampIndex((prev) => (prev + 1) % lampPositions.length);
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, []);

  const getLightAngle = () => {
    const currentLamp = lampPositions[currentLampIndex];
    switch (currentLamp.lightDirection) {
      case 'center':
        return 180; // Straight down
      case 'right':
        return 135; // Angled to the right
      case 'left':
        return 225; // Angled to the left
      default:
        return 180;
    }
  };

  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: '#05170C' }}>
      {/* Hanging Lamp - positioned at very top */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20">
        <img
          src={lampPositions[currentLampIndex].image}
          alt="Lamp"
          className="w-48 h-48 object-contain transition-all duration-1000 ease-in-out"
          style={{
            transform: `rotate(${lampPositions[currentLampIndex].rotation}deg)`
          }}
        />
      </div>

      {/* Moving Light Effect - Full height gradient */}
      <div
        className="absolute top-0 w-full h-full opacity-30 pointer-events-none transition-all duration-1000 ease-in-out z-10"
        style={{
          background: `linear-gradient(${getLightAngle()}deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)`,
          filter: 'blur(40px)',
        }}
      />

      <div className="container mx-auto px-6 pt-32 relative z-30">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            Impact and Success
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-4xl mx-auto">
            Health-in-a-box unifies data across all connected hospitals to drive data-driven decisions and a future built on accurate information. The innovative has achieved significant success in the following areas:
          </p>
        </div>

        {/* Impact Grid - 6 items in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {impactItems.map((item, index) => (
            <div
              key={index}
              className="group cursor-pointer"
            >
              {/* Container with green background */}
              <div
                className="rounded-2xl px-2 py-2 overflow-hidden transition-transform duration-300 group-hover:scale-105 h-full"
                style={{
                  backgroundColor: 'rgba(201, 255, 221, 0.1)',
                  border: '0.5px solid #0C5D2A'
                }}
              >
                {/* Image on top */}
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Text content below image */}
                <div className="p-4">
                  <h3 className="text-white font-medium text-sm leading-tight text-center">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSuccessSection;