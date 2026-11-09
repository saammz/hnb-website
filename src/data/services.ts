import {
  Droplet,
  FlaskConical,
  Microscope,
  ShieldCheck,
  Dna,
  ScanSearch,
  Activity,
  HeartPulse,
  Home,
  type LucideIcon,
} from 'lucide-react';

export interface ServiceCategory {
  icon: LucideIcon;
  title: string;
  description: string;
  tests: string[];
}

/**
 * Edit this list to add, remove or rename the lab's services.
 * No prices are shown on the site — only the categories and the tests in each.
 */
export const services: ServiceCategory[] = [
  {
    icon: Droplet,
    title: 'Haematology',
    description: 'Blood tests that check your overall health and detect blood disorders.',
    tests: ['Full Blood Count (FBC)', 'Packed Cell Volume (PCV)', 'ESR', 'Blood Group & Genotype', 'Clotting Profile (PT/INR, APTT)'],
  },
  {
    icon: FlaskConical,
    title: 'Clinical Chemistry',
    description: 'Tests that measure chemicals and enzymes to assess organ function.',
    tests: ['Fasting Blood Sugar & HbA1c', 'Lipid Profile', 'Liver Function Test', 'Kidney Function / E,U & Cr', 'Uric Acid'],
  },
  {
    icon: Microscope,
    title: 'Microbiology',
    description: 'Identification of bacteria, fungi and parasites causing infection.',
    tests: ['Urine M/C/S', 'Stool M/C/S', 'Blood Culture', 'High Vaginal / Urethral Swab', 'Malaria Parasite'],
  },
  {
    icon: ShieldCheck,
    title: 'Immunology & Serology',
    description: 'Screening for infections and immune responses.',
    tests: ['HIV I & II Screening', 'Hepatitis B & C', 'Widal Test', 'VDRL / Syphilis', 'H. pylori'],
  },
  {
    icon: Activity,
    title: 'Hormone & Fertility',
    description: 'Endocrine and reproductive hormone assays.',
    tests: ['Thyroid Function Test', 'Fertility Hormone Profile', 'Pregnancy Test (Beta-hCG)', 'Testosterone', 'Prolactin'],
  },
  {
    icon: Dna,
    title: 'Molecular Diagnostics',
    description: 'PCR-based testing for precise detection of pathogens.',
    tests: ['HIV Viral Load', 'Hepatitis B Viral Load', 'COVID-19 PCR', 'Tuberculosis GeneXpert'],
  },
  {
    icon: ScanSearch,
    title: 'Histopathology & Cytology',
    description: 'Microscopic examination of tissues and cells.',
    tests: ['Tissue Biopsy', 'Pap Smear', 'Fine Needle Aspiration Cytology', 'Body Fluid Cytology'],
  },
  {
    icon: HeartPulse,
    title: 'Health Screening Packages',
    description: 'Bundled check-ups for individuals, families and organisations.',
    tests: ['General Wellness Check', 'Pre-employment Screening', 'Pre-marital Screening', 'Antenatal Profile', 'Executive Health Check'],
  },
  {
    icon: Home,
    title: 'Home Sample Collection',
    description: 'Our phlebotomists come to your home or office to collect samples.',
    tests: ['Home & Office Visits', 'Corporate Collection Drives', 'Elderly & Mobility Support'],
  },
];
