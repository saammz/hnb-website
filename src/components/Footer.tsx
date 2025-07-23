import { ArrowUp, Mail, Phone } from 'lucide-react';

import logo from '../assets/images/logo.svg';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navigationLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About Us', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact Us', href: '#contact' }
  ];

  return (
    <footer className="py-16 relative" style={{ backgroundColor: '#03210E' }}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-16 items-start">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="w-30 h-18 object-contain"
                draggable={false}
              />
            </div>
          </div>

          {/* Second Column - Address and Contact */}
          <div className="space-y-8">
            {/* Address */}
            <div className="space-y-2">
              <p className="text-white/80 text-lg leading-relaxed">
                Federal Secretariat Complex,
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Phase III, Shehu Shagari Way,
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Central Business District.
              </p>
              <p className="text-white/80 text-lg leading-relaxed">
                Abuja .FCT - Nigeria.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-white/60" />
                <span className="text-white/80 text-base">info@healthinabox.ng</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-white/60" />
                <span className="text-white/80 text-base">(234) 8130000000</span>
              </div>
            </div>
          </div>

          {/* Third Column - Navigation Links */}
          <div className="flex justify-center lg:justify-start">
            <nav className="space-y-4">
              {navigationLinks.map((link, index) => (
                <div key={index}>
                  <a
                    href={link.href}
                    className="text-white/80 text-lg hover:text-white transition-colors duration-300 block"
                  >
                    {link.name}
                  </a>
                </div>
              ))}
            </nav>
          </div>

          {/* Fourth Column - Back to Top Button */}
          <div className="flex justify-center lg:justify-end">
            <button
              onClick={scrollToTop}
              className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50"
              aria-label="Back to top"
            >
              <ArrowUp className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-white/60 text-base text-center lg:text-right">
            © 2020. Health-in-a-box. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;