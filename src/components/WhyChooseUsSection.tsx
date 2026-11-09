import { Target, Timer, BadgeCheck, Home, Lock, Stethoscope } from 'lucide-react';

const reasons = [
  {
    icon: Target,
    title: 'Accurate & Reliable Results',
    description: 'Strict internal and external quality control on every test so you and your doctor can act with confidence.',
  },
  {
    icon: Timer,
    title: 'Fast Turnaround',
    description: 'Most routine results are ready within 24 hours, with urgent testing available when you need it.',
  },
  {
    icon: BadgeCheck,
    title: 'Qualified Professionals',
    description: 'Our tests are performed and reviewed by licensed medical laboratory scientists and pathologists.',
  },
  {
    icon: Home,
    title: 'Home Sample Collection',
    description: 'Skip the queue — our trained phlebotomists can collect samples at your home or workplace.',
  },
  {
    icon: Lock,
    title: 'Confidential & Secure',
    description: 'Your health information is handled privately and results are shared only with you and your care team.',
  },
  {
    icon: Stethoscope,
    title: 'Doctor & Hospital Referrals',
    description: 'We work with clinics and hospitals to support referrals and deliver results directly to physicians.',
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="mb-16">
          <div className="inline-block mb-4">
            <span className="text-emerald-500 font-medium text-sm tracking-wider uppercase border-l-4 border-emerald-500 pl-3">
              WHY CHOOSE US
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
            Quality Care at Every Step
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group p-8 border border-gray-200 rounded-2xl transition-colors duration-300 hover:bg-[#F4FFF8]"
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-200 mb-6 transition-colors group-hover:border-emerald-500">
                <reason.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">{reason.title}</h3>
              <p className="text-gray-600 leading-relaxed text-base">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
