import Navbar from '@/components/Navbar';
import Flow from '@/components/Flow';
import Footer from '@/components/Footer';

export default function PanduanPage() {
  return (
    <>
      <div style={{ background: 'var(--offwhite)' }}>
        <Navbar />
      </div>
      <Flow />
      <Footer />
    </>
  );
}
