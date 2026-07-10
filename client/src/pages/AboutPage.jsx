import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Siren, Search, HandCoins, ChevronDown, ChevronUp,
  ArrowRight, Mail, Phone, MapPin,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { MISSION_PILLARS, WELFARE_GUIDES, FAQS } from '../constants/about-options';
import { PLATFORM_CONTACTS, PLATFORM_EMAIL } from '../constants/emergency-options';
import { rescueService } from '../services/rescue.service';
import { petService } from '../services/pet.service';

const pillarIcons = [Siren, Heart, Search, HandCoins];

export default function AboutPage() {
  const [stats, setStats] = useState({ rescued: 0, adopted: 0 });
  const [openGuide, setOpenGuide] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [r, p] = await Promise.all([
          rescueService.getStats(),
          petService.getStats(),
        ]);
        setStats({
          rescued: r.data.rescued || 0,
          adopted: p.data.adopted || 0,
        });
      } catch {
        setStats({ rescued: 0, adopted: 0 });
      }
    };
    load();
  }, []);

  return (
    <PageWrapper>

      <div className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <p className="text-sm font-bold text-white/70 uppercase tracking-wide mb-3">
            About
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-5">
            Every street animal in Nepal deserves someone who stops
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            PaluwaSathi exists because the gap between seeing an animal in trouble
            and knowing what to do is where most of them die.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        <section>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10">
            <h2 className="text-xl font-black text-ink mb-4">The problem</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Kathmandu Valley has an estimated street dog population in the tens of
                thousands. Most people who encounter an injured animal want to help.
                Almost none of them know who to call, what the animal needs, or whether
                moving it will kill it.
              </p>
              <p>
                Meanwhile the organisations that could respond are working with
                phone trees, WhatsApp groups, and paper records. A rescue call comes in,
                gets relayed twice, and arrives at a volunteer who cannot find the
                location. An adoptable dog waits four hundred days in a kennel because
                nobody outside the shelter knows he exists. A family searching for a lost
                cat never learns that someone two kilometres away has been feeding her
                for a week.
              </p>
              <p className="text-ink font-medium">
                None of this is a resource problem. It is a coordination problem.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black text-ink mb-2">What we built</h2>
          <p className="text-gray-500 mb-6">
            Four systems that connect people who want to help with organisations that can act.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {MISSION_PILLARS.map(function (pillar, i) {
              const Icon = pillarIcons[i];
              return (
                <div key={pillar.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-black text-ink mb-2">{pillar.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-ink rounded-2xl p-6 sm:p-10 text-white">
          <h2 className="text-xl font-black mb-6">Where we are</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-3xl font-black">{stats.rescued}</p>
              <p className="text-sm text-white/60 mt-1">Animals rescued</p>
            </div>
            <div>
              <p className="text-3xl font-black">{stats.adopted}</p>
              <p className="text-sm text-white/60 mt-1">Pets rehomed</p>
            </div>
            <div>
              <p className="text-3xl font-black">3</p>
              <p className="text-sm text-white/60 mt-1">Verified NGOs</p>
            </div>
            <div>
              <p className="text-3xl font-black">7</p>
              <p className="text-sm text-white/60 mt-1">Districts covered</p>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-6">
            These numbers are small. We would rather show you the real ones than
            impressive ones.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-ink mb-2">Welfare guides</h2>
          <p className="text-gray-500 mb-6">
            Practical knowledge from people who do this work. Read them before you need them.
          </p>

          <div className="space-y-2">
            {WELFARE_GUIDES.map(function (guide, i) {
              const isOpen = openGuide === i;
              return (
                <div key={guide.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={function () { setOpenGuide(isOpen ? null : i); }}
                    className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-ink mb-1">{guide.title}</p>
                      <p className="text-sm text-gray-500 leading-snug">{guide.summary}</p>
                    </div>
                    {isOpen
                      ? <ChevronUp size={18} className="text-gray-400 shrink-0 mt-1" />
                      : <ChevronDown size={18} className="text-gray-400 shrink-0 mt-1" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-2.5">
                      {guide.points.map(function (p) {
                        return (
                          <div key={p} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed">{p}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black text-ink mb-6">Common questions</h2>

          <div className="space-y-2">
            {FAQS.map(function (faq, i) {
              const isOpen = openFaq === i;
              return (
                <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={function () { setOpenFaq(isOpen ? null : i); }}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-bold text-ink text-sm sm:text-base">{faq.q}</p>
                    {isOpen
                      ? <ChevronUp size={18} className="text-gray-400 shrink-0" />
                      : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10">
            <h2 className="text-xl font-black text-ink mb-2">Behind the platform</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              PaluwaSathi was built by Abhishek Dhamala, a student at Islington College
              in Kathmandu. It started as a coursework project and became something
              closer to a working system, because the problem it addresses is one you
              can see on almost any street in the valley.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {PLATFORM_CONTACTS.map(function (c, i) {
                return (
                  <a
                    key={i}
                    href={'tel:' + c.phone}
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-ink text-sm">{c.phone}</p>
                      <p className="text-xs text-gray-400">{c.role}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            <a
              href={'mailto:' + PLATFORM_EMAIL}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Mail size={16} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-ink text-sm truncate">{PLATFORM_EMAIL}</p>
                <p className="text-xs text-gray-400">General enquiries</p>
              </div>
            </a>

            <div className="flex flex-wrap gap-3 mt-3">
              <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-sm text-gray-600">
                <MapPin size={15} className="text-gray-400" />
                Kathmandu, Nepal
              </span>
              <a
                href="https://github.com/Abbu0007/paluwasathi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Source code
              </a>
            </div>
          </div>
        </section>

        <section className="bg-primary-50 rounded-2xl p-6 sm:p-10 text-center">
          <h2 className="text-2xl font-black text-ink mb-2">Start where you are</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            You do not need to adopt a dog to be useful. Report the injured one you
            walked past. Give an afternoon. Share a story that helps someone else act.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/rescue/report">
              <Button variant="danger" icon={Siren}>Report a Rescue</Button>
            </Link>
            <Link to="/volunteer">
              <Button variant="primary" iconRight={ArrowRight}>Find Volunteer Work</Button>
            </Link>
            <Link to="/adopt">
              <Button variant="outline" icon={Heart}>Meet the Animals</Button>
            </Link>
          </div>
        </section>

      </div>
    </PageWrapper>
  );
}