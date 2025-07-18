import React from 'react';

// Import your hospital logo images
import uniportLogo from '../assets/images/image 3.svg';
import unthEnuguLogo from '../assets/images/image 4.svg';
import unthItukuLogo from '../assets/images/image 5.svg';
import luthLogo from '../assets/images/image 6.svg';
import fmcJalingoLogo from '../assets/images/image 4.svg';

const FederalHospitals = () => {
  const hospitals = [
    {
      logo: uniportLogo,
      name: "University of Port Harcourt\nTeaching Hospital"
    },
    {
      logo: unthEnuguLogo,
      name: "University of Nigeria Teaching\nHospital Enugu"
    },
    {
      logo: unthItukuLogo,
      name: "University of Nigeria Teaching\nHospital Ituku-Ozalla"
    },
    {
      logo: luthLogo,
      name: "Lagos University Teaching\nHospital Lagos"
    },
    {
      logo: fmcJalingoLogo,
      name: "Federal Medical Centre\nJalingo"
    },
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Federal Teaching Hospitals
        </h2>

        {/* Infinite Scrolling Container */}
        <div className="relative overflow-hidden">
          {/* CSS Animation Styles */}
          <style jsx>{`
            @keyframes scroll-right {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            
            .scroll-track {
              display: flex;
              animation: scroll-right 20s linear infinite;
            }
            
            .hospital-item {
              flex-shrink: 0;
              width: 300px;
              margin-right: 3rem;
            }
          `}</style>

          {/* Scrolling Track */}
          <div className="scroll-track">
            {/* Duplicate the hospitals array twice for seamless loop */}
            {[...hospitals, ...hospitals].map((hospital, index) => (
              <div
                key={index}
                className="hospital-item flex flex-col items-center space-y-4"
              >
                <div className="w-20 h-20 flex items-center justify-center rounded-full">
                  <img
                    src={hospital.logo}
                    alt={hospital.name}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="text-sm font-medium text-gray-700 text-center leading-5 whitespace-pre-line">
                  {hospital.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FederalHospitals;