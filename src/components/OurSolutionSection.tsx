import { Check } from 'lucide-react';

import aboutImage from '../assets/images/about-us.svg';

const OurSolutionSection = () => {
  const leftFeatures = [
    "Radiology Information Systems (RIS)",
    "Pharmacy Information Systems (PIS)",
    "Clinical Decision Support Systems (CDSS)",
    "Health Information Exchange (HIE) Systems"
  ];

  const rightFeatures = [
    "Electronic Medical Record (EMR) System",
    "Finance Management System",
    "Picture Archiving and Communication System",
    "Laboratory Information System (LIS)"
  ];

  return (
    <div className="py-20" style={{ backgroundColor: '#F4FFF8' }}>
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-emerald-500 font-medium text-sm tracking-wider uppercase border-l-4 border-emerald-500 pl-3">OUR SOLUTION</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Transforming Healthcare with{' '}
                <span className="text-emerald-500">HnB</span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed">
              The Health-In-A-Box Health Management Information System (HnB HMIS)
              is designed to tackle the significant challenges that healthcare providers
              encounter in the modern landscape. Traditional healthcare systems
              frequently deal with inconsistent data, labour-intensive workflows, and
              outdated communication systems; and healthcare providers often face
              challenges that disrupt patient care and contribute to operational
              inefficiencies.
            </p>

            {/* Features List - Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left column */}
              <div className="space-y-4">
                {leftFeatures.map((feature, index) => (
                  <div key={`left-${index}`} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {rightFeatures.map((feature, index) => (
                  <div key={`right-${index}`} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Image with floating cards */}
          <div className="relative">
            <div className="relative">
              {/* Main image with rounded corners */}
              <img
                src={aboutImage}
                alt="Healthcare professionals"
                className="w-full h-[500px] object-cover rounded-[24px]"
              />

              {/* Top floating card - Seamless operation */}
              <div className="absolute top-6 left-6 bg-white rounded-2xl p-4 shadow-lg max-w-[300px]">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base mb-1">Seamless operation</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Figma ipsum component variant aimi main layer. Scrolling
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom floating card - 10 years of experience */}
              <div className="absolute bottom-6 right-6 bg-white rounded-2xl p-4 shadow-lg max-w-[320px]">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base mb-1">10 years of experience</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Figma ipsum component variant aimi main layer. Scrolling ipsuming valorin component variant aimi main
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurSolutionSection;