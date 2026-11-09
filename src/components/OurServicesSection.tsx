import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { services } from '@/data/services';
import { scrollToSection } from '@/components/Navbar';

const OurServicesSection = () => {
  return (
    <section className="py-20" style={{ backgroundColor: '#F4FFF8' }}>
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-3xl">
          <div className="inline-block mb-4">
            <span className="text-emerald-500 font-medium text-sm tracking-wider uppercase border-l-4 border-emerald-500 pl-3">
              OUR SERVICES
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Comprehensive <span className="text-emerald-500">Laboratory</span> Testing
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            We offer a wide range of diagnostic tests across every major laboratory discipline.
            Contact us for test preparation guidance, availability or a full list of tests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-white p-8 border border-gray-200 rounded-2xl transition-colors duration-300 hover:border-emerald-400"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 transition-colors group-hover:bg-emerald-500">
                <service.icon className="w-7 h-7 text-emerald-600 transition-colors group-hover:text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{service.description}</p>
              <ul className="space-y-2">
                {service.tests.map((test) => (
                  <li key={test} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-gray-700 text-sm">{test}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button
            size="lg"
            onClick={() => scrollToSection('test-directory')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-base"
          >
            Browse All Tests <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OurServicesSection;
