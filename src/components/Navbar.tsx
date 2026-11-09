import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '../assets/images/darlez-logo-light.png';

export const navItems = [
  { id: 'home', label: 'Home', target: 'hero' },
  { id: 'about', label: 'About Us', target: 'about-us' },
  { id: 'services', label: 'Our Services', target: 'services' },
  { id: 'test-directory', label: 'Find a Test', target: 'test-directory' },
  { id: 'how-it-works', label: 'How It Works', target: 'how-it-works' },
  { id: 'contact', label: 'Contact', target: 'contact' },
];

export const scrollToSection = (targetId: string) => {
  const element = document.getElementById(targetId);
  if (element) {
    window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
  }
};

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const element = document.getElementById(navItems[i].target);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (targetId: string) => {
    scrollToSection(targetId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-6 left-6 right-6 z-50 mx-4 sm:mx-8 lg:mx-[50px]">
      <div className="bg-black/30 backdrop-blur-md rounded-[20px] border border-[#C9FFDD]/60">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-20">
            <img src={logo} alt="Darlez Medical Diagnostics" className="h-10 sm:h-12 w-auto object-contain" draggable={false} />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.target)}
                  className={`text-sm transition-colors ${
                    activeSection === item.id
                      ? 'text-[#A0F9C2] font-medium'
                      : 'text-white/90 font-light hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:block">
              <Button
                onClick={() => handleNav('contact')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Book a Test
              </Button>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-6 pt-4 space-y-1 border-t border-white/10">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.target)}
                  className={`block w-full text-left py-3 px-4 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'text-[#A0F9C2] bg-white/10 font-medium'
                      : 'text-white/90 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-white/10">
                <Button
                  onClick={() => handleNav('contact')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Book a Test
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
