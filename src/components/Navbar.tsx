import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import loginButtonNormal from '../assets/images/login.svg';
import loginButtonHover from '../assets/images/login-hover.svg';
import logo from '../assets/images/logo.svg';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', target: 'hero' },
    { id: 'about', label: 'About Us', target: 'federal-hospitals' },
    { id: 'solution', label: 'Our Solution', target: 'services' },
    { id: 'processes', label: 'Our Processes', target: 'practice-software' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.target)
      }));

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element && section.element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      const offsetTop = element.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <style>
        {`
          .nav-item {
            transition: all 0.3s ease-in-out;
            font-weight: 300;
          }

          .nav-item:hover {
            font-weight: 400;
          }
        `}
      </style>

      <nav className="fixed top-6 left-6 right-6 z-50 mx-4 sm:mx-8 lg:mx-[50px]">
        <div
          className="bg-black/20 backdrop-blur-md rounded-[20px]"
          style={{
            border: '0.5px solid #C9FFDDE5'
          }}
        >
          <div className="container mx-auto px-4 sm:px-8 py-1">
            <div className="flex items-center justify-between h-20 sm:h-28">
              {/* Logo */}
              <div className="flex items-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-30 h-18 object-contain"
                  draggable={false}
                />
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-16">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.target)}
                    className={`nav-item relative ${activeSection === item.id
                      ? 'text-[#A0F9C2] font-medium'
                      : 'text-white/90 hover:text-[#06421C]'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Desktop Login Button */}
              <div className="hidden pt-3 md:block">
                <button
                  className="relative transition-transform duration-200 ease-out hover:scale-105 focus:outline-none"
                  onMouseEnter={() => setIsLoginHovered(true)}
                  onMouseLeave={() => setIsLoginHovered(false)}
                  onClick={() => {
                    console.log('Login clicked');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={isLoginHovered ? loginButtonHover : loginButtonNormal}
                    alt="Login"
                    className="w-30 h-18 object-contain"
                    draggable={false}
                  />
                </button>
              </div>

              {/* Mobile Hamburger Menu */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus:outline-none"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="md:hidden">
                <div className="px-4 pt-4 pb-6 space-y-1 border-t border-white/10">
                  {/* Mobile Navigation Links */}
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.target)}
                      className={`block w-full text-left py-3 px-4 rounded-lg transition-all duration-200 ${activeSection === item.id
                        ? 'text-[#A0F9C2] bg-white/10 font-medium'
                        : 'text-white/90 hover:text-[#7DE3A8] hover:bg-white/5'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}

                  {/* Mobile Login Button */}
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <button
                      onClick={() => {
                        console.log('Login clicked');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;