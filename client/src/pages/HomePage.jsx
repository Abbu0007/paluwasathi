import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Search, Users, MessageCircle, MapPin, AlertTriangle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';

export default function HomePage() {
  const quickActions = [
    { label: 'Report Animal', Icon: AlertTriangle, to: '/rescue/report', accent: true },
    { label: 'Find a Vet', Icon: MapPin, to: '/emergency' },
    { label: 'Lost Pet', Icon: Search, to: '/lost-found' },
    { label: 'Volunteer', Icon: Users, to: '/volunteer' },
    { label: 'Donate', Icon: Heart, to: '/donate' },
    { label: 'Community', Icon: MessageCircle, to: '/community' },
  ];

  return (
    <PageWrapper>
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 text-primary-dark text-sm font-bold mb-6">
              Nepal's Animal Rescue Platform
            </span>
            <h1 className="text-4xl lg:text-6xl font-black text-ink leading-tight mb-6">
              Connecting People, Rescuers and Animals in Need.
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Report injured animals, adopt a companion, support rescue efforts,
              and volunteer all in one place built for Nepal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/rescue/report">
                <Button variant="primary" size="lg" icon={AlertTriangle}>Report Rescue</Button>
              </Link>
              <Link to="/adopt">
                <Button variant="secondary" size="lg" icon={Heart}>Adopt a Pet</Button>
              </Link>
              <Link to="/donate">
                <Button variant="outline" size="lg">Donate Now</Button>
              </Link>
            </div>
            <div className="flex gap-10 mt-12">
              <div>
                <p className="text-3xl font-black text-ink">847+</p>
                <p className="text-sm text-gray-500">Animals Rescued</p>
              </div>
              <div>
                <p className="text-3xl font-black text-ink">234</p>
                <p className="text-sm text-gray-500">Active Volunteers</p>
              </div>
              <div>
                <p className="text-3xl font-black text-ink">1,203</p>
                <p className="text-sm text-gray-500">Pets Adopted</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] relative">
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-ink">12 active rescues now</span>
            </div>
            <img src="/logo.png" alt="PaluwaSathi" className="w-48 h-auto" />
            <p className="text-primary-dark font-bold mt-4 text-center">
              Every animal deserves a second chance.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">Quick Actions</p>
        <h2 className="text-3xl font-black text-ink mb-8">What do you need help with?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map(({ label, Icon, to, accent }) => (
            <Link
              key={label}
              to={to}
              className={accent
                ? "bg-white rounded-2xl p-5 border border-danger transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                : "bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"}
            >
              <div className={accent
                ? "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-red-50 text-danger"
                : "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-primary-50 text-primary"}>
                <Icon size={22} />
              </div>
              <p className="font-bold text-ink text-sm">{label}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
