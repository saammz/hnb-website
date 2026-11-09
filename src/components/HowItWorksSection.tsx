import { useState, useEffect } from 'react';
import { CalendarCheck, Syringe, Microscope, FileText } from 'lucide-react';

import lampCenter from '../assets/images/lamp-center.svg';
import lampRight from '../assets/images/lamp-right.svg';
import lampLeft from '../assets/images/lamp-left.svg';

const lampPositions = [
  { image: lampCenter, rotation: 0, angle: 180 },
  { image: lampRight, rotation: -45, angle: 135 },
  { image: lampCenter, rotation: 0, angle: 180 },
  { image: lampLeft, rotation: 45, angle: 225 },
];

const steps = [
  {
    icon: CalendarCheck,
    title: 'Book Your Test',
    description: 'Call, message or walk in. Choose a lab visit or request home sample collection.',
  },
  {
    icon: Syringe,
    title: 'Sample Collection',
    description: 'A trained phlebotomist collects your sample safely and hygienically.',
  },
  {
    icon: Microscope,
    title: 'Laboratory Analysis',
    description: 'Your sample is processed on calibrated analysers under strict quality control.',
  },
  {
    icon: FileText,
    title: 'Receive Your Results',
    description: 'Results are reviewed by our scientists and delivered to you or your doctor.',
  },
];

const HowItWorksSection = () => {
  const [lampIndex, setLampIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setLampIndex((prev) => (prev + 1) % lampPositions.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const lamp = lampPositions[lampIndex];

  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: '#05170C' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <img
          src={lamp.image}
          alt=""
          className="w-48 h-48 object-contain transition-all duration-1000 ease-in-out"
          style={{ transform: `rotate(${lamp.rotation}deg)` }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-1000 ease-in-out z-10"
        style={{
          background: `linear-gradient(${lamp.angle}deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
          filter: 'blur(40px)',
        }}
      />

      <div className="container mx-auto px-6 pt-32 relative z-30">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">How It Works</h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-3xl mx-auto">
            Getting tested with us is simple. Here's what to expect from booking to results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl p-6 transition-transform duration-300 hover:scale-105"
              style={{ backgroundColor: 'rgba(201, 255, 221, 0.1)', border: '0.5px solid #0C5D2A' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-3xl font-bold text-emerald-400/40">0{index + 1}</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
