import React from 'react';

// Import your feature icons
import workflowIcon from '../assets/icons/Workflow.svg';
import dataIntegrationIcon from '../assets/icons/Data.svg';
import communicationIcon from '../assets/icons/Communication Collaboration.svg';
import reportingIcon from '../assets/icons/Reporting.svg';
import complianceIcon from '../assets/icons/Security.svg';

const OurFeaturesSection = () => {
  const features = [
    {
      icon: workflowIcon,
      title: "Enhanced Workflow Efficiency",
      description: "By automating routine tasks and optimizing workflow processes, HMIS significantly reduces the administrative burden on healthcare staff"
    },
    {
      icon: dataIntegrationIcon,
      title: "Data Integration and Accessibility",
      description: "HMIS centralizes patient records and data, ensuring that all relevant information is easily accessible to healthcare professionals. This reduces errors associated with data."
    },
    {
      icon: communicationIcon,
      title: "Real-time Communication and Collaboration:",
      description: "HMIS enables seamless communication, real-time data sharing between different departments and healthcare providers."
    },
    {
      icon: reportingIcon,
      title: "Advanced Reporting and Analytics",
      description: "The system provides powerful reporting tools that help healthcare facilities monitor performance, identify trends, and make data-driven decisions."
    },
    {
      icon: complianceIcon,
      title: "Regulatory Compliance and Security",
      description: "HMIS is designed with compliance in mind, ensuring that all operations align with the latest healthcare regulations."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4">
            <span className="text-emerald-500 font-medium text-sm tracking-wider uppercase border-l-4 border-emerald-500 pl-3">
              OUR FEATURES
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
            All-in-One Practice Software
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* First row - 3 cards */}
          {features.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="p-8 border border-gray-200 rounded-2xl transition-colors duration-300 group"
              style={{
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F4FFF8';
                // Change icon container border
                const iconContainer = e.currentTarget.querySelector('.icon-container');
                if (iconContainer) {
                  iconContainer.style.borderColor = '#10b981';
                  iconContainer.style.borderWidth = '0.5px';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                // Reset icon container border
                const iconContainer = e.currentTarget.querySelector('.icon-container');
                if (iconContainer) {
                  iconContainer.style.borderColor = '#e5e7eb';
                  iconContainer.style.borderWidth = '1px';
                }
              }}
            >
              <div className="mb-6">
                <div className="icon-container w-16 h-16 bg-white rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {feature.description}
              </p>
            </div>
          ))}

          {/* Second row - 2 cards centered */}
          <div className="md:col-start-1 lg:col-start-1">
            <div
              className="p-8 border border-gray-200 rounded-2xl transition-colors duration-300 group"
              style={{
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F4FFF8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div className="mb-6">
                <div
                  className="w-16 h-16 bg-white rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.borderWidth = '0.5px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.borderWidth = '1px';
                  }}
                >
                  <img
                    src={features[3].icon}
                    alt={features[3].title}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
                {features[3].title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {features[3].description}
              </p>
            </div>
          </div>

          <div className="md:col-start-2 lg:col-start-2">
            <div
              className="p-8 border border-gray-200 rounded-2xl transition-colors duration-300 group"
              style={{
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F4FFF8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div className="mb-6">
                <div
                  className="w-16 h-16 bg-white rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.borderWidth = '0.5px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.borderWidth = '1px';
                  }}
                >
                  <img
                    src={features[4].icon}
                    alt={features[4].title}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
                {features[4].title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {features[4].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurFeaturesSection;