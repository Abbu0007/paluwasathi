import Navbar from './Navbar';
import Footer from './Footer';

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer />
    </div>
  );
}