import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FederalHospitals from '@/components/FederalHospitals';
import AboutUsSection from '@/components/AboutUsSection';
import OurServicesSection from '@/components/OurServicesSection';
import TestDirectorySection from '@/components/TestDirectorySection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div id="hero">
        <HeroSection />
      </div>
      <div id="partners">
        <FederalHospitals />
      </div>
      <div id="about-us">
        <AboutUsSection />
      </div>
      <div id="services">
        <OurServicesSection />
      </div>
      <WhyChooseUsSection />
      <div id="test-directory">
        <TestDirectorySection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
