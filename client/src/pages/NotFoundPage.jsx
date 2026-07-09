import { Link } from 'react-router-dom';
import { Home, Siren } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <img src="/logo.png" alt="" className="w-12 h-auto opacity-60" />
          </div>

          <p className="text-6xl font-black text-primary mb-2">404</p>
          <h1 className="text-2xl font-black text-ink mb-3">
            This page wandered off
          </h1>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="primary" icon={Home} className="w-full sm:w-auto">
                Back to Homepage
              </Button>
            </Link>
            <Link to="/rescue/report">
              <Button variant="outline" icon={Siren} className="w-full sm:w-auto">
                Report an Animal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}