import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, FlaskConical, Users, Clock, Award } from 'lucide-react';
import { scrollToSection } from '@/components/Navbar';

import slide1Image from '../assets/images/bg-one.svg';
import slide2Image from '../assets/images/bg-two.svg';
import slide3Image from '../assets/images/bg-three.svg';


const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Accurate",
      subtitle: "Diagnostics",
      highlight: "You Can Trust",
      description: "Fast, reliable laboratory testing you can trust. From routine blood work to specialised diagnostics, our accredited scientists deliver accurate results to support better care.",
      backgroundImage: slide1Image,
      direction: "left"
    },
    {
      title: "Advanced",
      subtitle: "Laboratory",
      highlight: "Technology",
      description: "Modern analysers, strict quality control and experienced medical laboratory scientists working together to give you and your doctor results you can act on.",
      backgroundImage: slide2Image,
      direction: "right"
    },
    {
      title: "Convenient",
      subtitle: "Testing",
      highlight: "Made Simple",
      description: "Book a test, visit any of our collection points or request home sample collection, and receive your results securely and on time.",
      backgroundImage: slide3Image,
      direction: "left"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [slides.length]);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const stats = [
    { icon: FlaskConical, number: "200+", label: "Tests Available" },
    { icon: Users, number: "50k+", label: "Patients Served" },
    { icon: Clock, number: "24hrs", label: "Typical Turnaround" },
    { icon: Award, number: "10+", label: "Years of Experience" }
  ];

  const getSlideAnimation = (direction: string) => {
    switch (direction) {
      case 'left':
        return 'animate-slide-in-left';
      case 'right':
        return 'animate-slide-in-right';
      case 'up':
        return 'animate-fade-in-up';
      default:
        return 'animate-fade-in-up';
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 overflow-hidden">
      {/* Background Image with slide animation */}
      <div
        key={`bg-${currentSlide}`}
        className={`absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-1000 ease-in-out ${getSlideAnimation(slides[currentSlide].direction)}`}
        style={{
          backgroundImage: `url('${slides[currentSlide].backgroundImage}')`
        }}
      ></div>
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 items-start min-h-[80vh]">
          {/* Left Content */}
          <div className="lg:col-span-12 space-y-8 pt-32">
            <div className="flex items-start space-x-8">
              {/* Progress bar - extended height to reach buttons */}
              <div className="flex-shrink-0">
                <div className="w-1 h-[500px] bg-white/20 rounded-full relative overflow-hidden">
                  {/* Active progress indicator */}
                  <div
                    className="absolute w-full bg-white rounded-full transition-all duration-1000 ease-in-out"
                    style={{
                      top: `${(currentSlide / slides.length) * 100}%`,
                      height: `${100 / slides.length}%`
                    }}
                  />
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={`absolute w-full rounded-full transition-all duration-500 ease-out ${index < currentSlide
                        ? 'bg-white/40'
                        : 'bg-transparent'
                        }`}
                      style={{
                        top: `${(index / slides.length) * 100}%`,
                        height: `${100 / slides.length}%`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 space-y-6">
                {/* Count indicator - static, no animation */}
                <span className="text-white/60 text-2xl font-normal">
                  0{currentSlide + 1}/03
                </span>

                <div
                  key={`text-${currentSlide}`}
                  className={`transition-all duration-1000 ease-in-out ${getSlideAnimation(slides[currentSlide].direction)}`}
                >
                  <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                    <span className="block">
                      {slides[currentSlide].title} <span className="text-emerald-400">{slides[currentSlide].subtitle}</span> {slides[currentSlide].highlight}
                    </span>
                  </h1>
                </div>

                {/* Description - static, no animation */}
                <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
                  {slides[currentSlide].description}
                </p>

                {/* CTA Buttons and Arrow Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-14">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      onClick={() => scrollToSection('services')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-base"
                    >
                      Our Services
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => scrollToSection('contact')}
                      className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900 h-12 px-8 text-base"
                    >
                      Contact Us
                    </Button>
                  </div>

                  {/* Arrow Navigation */}
                  <div className="flex items-center space-x-4 ml-auto">
                    <Button
                      className={`w-16 h-16 rounded-full backdrop-blur-md shadow-none transition-all duration-200 ${currentSlide === 0
                        ? 'opacity-40 cursor-not-allowed'
                        : 'opacity-100 hover:bg-white/10'
                        }`}
                      style={{
                        background: 'transparent',
                        border: '0.5px solid white'
                      }}
                      onClick={currentSlide === 0 ? undefined : goToPrevSlide}
                      disabled={currentSlide === 0}
                    >
                      <ArrowRight className="w-6 h-6 text-white rotate-180" />
                    </Button>
                    <Button
                      className="w-16 h-16 rounded-full backdrop-blur-md shadow-none hover:bg-white/10 transition-all duration-200"
                      style={{
                        background: 'transparent',
                        border: '0.5px solid white'
                      }}
                      onClick={goToNextSlide}
                    >
                      <ArrowRight className="w-6 h-6 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - static, no animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="backdrop-blur-md rounded-2xl p-6"
              style={{
                backgroundColor: 'rgba(201, 255, 221, 0.1)',
                border: '0.5px solid #C9FFDDE5'
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;