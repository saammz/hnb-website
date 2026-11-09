import { ArrowUp, Mail, Phone, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navItems, scrollToSection } from '@/components/Navbar';
import { services } from '@/data/services';

import logo from '../assets/images/darlez-logo-light.png';

// TODO: replace with Darlez's real contact details
const contact = {
  address: ['Federal Secretariat Complex,', 'Phase III, Shehu Shagari Way,', 'Central Business District, Abuja FCT.'],
  email: 'info@healthinabox.ng',
  phone: '(234) 8130000000',
  hours: ['Mon – Fri: 7:00am – 7:00pm', 'Sat: 8:00am – 4:00pm'],
};

const headingClass = 'text-white font-semibold text-base mb-6 tracking-wide';
const linkClass = 'text-white/70 hover:text-emerald-400 transition-colors text-left';

const Footer = () => {
  return (
    <footer id="contact" style={{ backgroundColor: '#03210E' }}>
      <div className="container mx-auto px-6">
        {/* CTA strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-12 border-b border-white/10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Ready to book a test?</h2>
            <p className="text-white/70">Call us or walk in. Home sample collection is available.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8">
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>
                <Phone /> Call Us
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-white/60 text-white hover:bg-white hover:text-gray-900 h-12 px-8"
            >
              <a href={`mailto:${contact.email}`}>
                <Mail /> Email Us
              </a>
            </Button>
          </div>
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 py-16">
          {/* Brand */}
          <div className="lg:col-span-4 lg:pr-12">
            <img
              src={logo}
              alt="Darlez Medical Diagnostics"
              className="h-14 w-auto object-contain mb-6"
              draggable={false}
            />
            <p className="text-white/70 leading-relaxed">
              Accurate, timely and reliable medical laboratory testing for individuals, families,
              clinics and hospitals.
            </p>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className={headingClass}>Quick Links</h3>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button onClick={() => scrollToSection(item.target)} className={linkClass}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className={headingClass}>Our Services</h3>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service) => (
                <li key={service.title}>
                  <button onClick={() => scrollToSection('services')} className={linkClass}>
                    {service.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className={headingClass}>Contact Us</h3>
            <ul className="space-y-5 text-white/70">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {contact.address.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="hover:text-emerald-400 transition-colors">
                  {contact.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <a href={`mailto:${contact.email}`} className="hover:text-emerald-400 transition-colors break-all">
                  {contact.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {contact.hours.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 py-6 border-t border-white/10">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Darlez Medical Diagnostics Limited. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            aria-label="Back to top"
          >
            Back to top
            <span className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors">
              <ArrowUp className="w-5 h-5 text-white" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
