import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';

export default function ComingSoonPage({ title, description }) {
  return (
    <PageWrapper>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <Construction size={28} className="text-primary" />
          </div>

          <h1 className="text-2xl font-black text-ink mb-3">{title}</h1>
          <p className="text-gray-500 mb-8">
            {description || 'This section is being built. Check back soon.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="primary" icon={ArrowLeft} className="w-full sm:w-auto">
                Back to Homepage
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}