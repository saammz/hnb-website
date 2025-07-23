import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FederalHospitals from '@/components/FederalHospitals';
import AboutUsSection from '@/components/AboutUsSection';
import ServicesSection from '@/components/OurSolutionSection';
import PracticeSoftware from '@/components/PracticeSoftware';
import Footer from '@/components/Footer';
import OurFeaturesSection from '@/components/OurFeaturesSection';
import ImpactSuccessSection from '@/components/ImpactSuccessSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div id="hero">
        <HeroSection />
      </div>
      <div id="federal-hospitals">
        <FederalHospitals />
      </div>
      <div id="about-us">
        <AboutUsSection />
      </div>
      <div>
        <OurFeaturesSection />
      </div>
      <div id="services">
        <ServicesSection />
      </div>
      <div>
        <ImpactSuccessSection />
      </div>
      <div id="practice-software">
        <PracticeSoftware />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
