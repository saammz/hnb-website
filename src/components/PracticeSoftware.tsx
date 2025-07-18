import React from 'react';

// Import your feature icons
import workflowIcon from '../assets/icons/Workflow.svg';
import dataIntegrationIcon from '../assets/icons/Data.svg';
import communicationIcon from '../assets/icons/Communication Collaboration.svg';
import reportingIcon from '../assets/icons/Reporting.svg';
import complianceIcon from '../assets/icons/Security.svg';

const PracticeSoftware = () => {
  const features = [
    {
      icon: workflowIcon,
      title: "Enhanced Workflow Efficiency",
      description: "End to end automation across all Tertiary Health Institutions."
    },
    {
      icon: dataIntegrationIcon,
      title: "Data Integration and Accessibility",
      description: "Centralized health data aggregation for epidemiological, financial, inventory and general administrative data."
    },
    {
      icon: communicationIcon,
      title: "Real-time Communication and Collaboration:",
      description: "National health analytics and reporting for oversight and planning."
    },
    {
      icon: reportingIcon,
      title: "Advanced Reporting and Analytics",
      description: "Automated administration, billing and reconciliation of health insurance services."
    },
    {
      icon: complianceIcon,
      title: "Regulatory Compliance and Security",
      description: "Increased transparency and accountability across THIs."
    },
    {
      icon: workflowIcon,
      title: "Process Standardization",
      description: "Standardization of THI processes for consistent data aggregation and reporting."
    },
    {
      icon: dataIntegrationIcon,
      title: "Operational Excellence",
      description: "Improved operational efficiency and patient turnaround time across Tertiary Health Institutions (THIs)."
    },
    {
      icon: communicationIcon,
      title: "Healthcare Access",
      description: "Improved access to qualitative healthcare at THIs and through telemedicine services."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block mb-4">
            <span className="text-emerald-500 font-medium text-sm tracking-wider uppercase border-l-4 border-emerald-500 pl-3">
              OUR PROCESS
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Enhancing The National Health System Through
          </h2>
        </div>

        {/* Features Grid - All 8 items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* All 8 cards */}
          {features.map((feature, index) => (
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
        </div>
      </div>
    </section>
  );
};

export default PracticeSoftware;