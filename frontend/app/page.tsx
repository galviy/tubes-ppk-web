import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FacilityTabs from '@/components/FacilityTabs';
import BuildingFeatures from '@/components/BuildingFeatures';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="ochoco-landing-page">
      <Navbar />
      <Hero />
      <FacilityTabs />
      <BuildingFeatures />
      <Footer />
    </main>
  );
}
