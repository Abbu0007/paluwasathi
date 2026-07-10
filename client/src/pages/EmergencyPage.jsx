import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Siren, Phone, AlertTriangle, MapPin, ArrowRight,
  ChevronDown, ChevronUp, Skull, Clock, CheckCircle2,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import {
  PLATFORM_CONTACTS, NATIONAL_NUMBERS,
  FIRST_AID_STEPS, POISON_SIGNS,
} from '../constants/emergency-options';
import { campaignService } from '../services/donation.service';

export default function EmergencyPage() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openStep, setOpenStep] = useState(0);

  useEffect(() => {
    campaignService.getNgos()
      .then(function (res) { setNgos(res.data.ngos); })
      .catch(function () { setNgos([]); })
      .finally(function () { setLoading(false); });
  }, []);

  return (
    <PageWrapper>
      <div className="bg-danger">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Siren size={28} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white/70 uppercase tracking-wide mb-1">
                Emergency
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                An Animal Needs Help Right Now
              </h1>
              <p className="text-white/80 mt-2 max-w-2xl">
                Report the case first so a volunteer is dispatched. Then read
                the first aid steps while you wait.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/rescue/report" className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-white text-danger font-black hover:bg-gray-50 transition-colors">
                <Siren size={18} />
                Report a Rescue Case
                <ArrowRight size={18} />
              </button>
            </Link>
            <a href={'tel:' + PLATFORM_CONTACTS[0].phone} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 py-4 rounded-full border-2 border-white/40 text-white font-black hover:bg-white/10 transition-colors">
                <Phone size={18} />
                Call {PLATFORM_CONTACTS[0].phone}
              </button>
            </a>
          </div>

          <p className="text-xs text-white/60 mt-4 text-center sm:text-left">
            Reporting through the platform is faster. It sends the exact location and photos to
            every available volunteer at once.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        <section>
          <h2 className="text-xl font-black text-ink mb-1">Direct Contacts</h2>
          <p className="text-sm text-gray-500 mb-5">
            If you cannot use the report form, call one of these numbers.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {PLATFORM_CONTACTS.map(function (c, i) {
              return (
                <a
                  key={i}
                  href={'tel:' + c.phone}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-danger hover:bg-red-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-danger flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase">{c.role}</p>
                    <p className="font-black text-ink">{c.phone}</p>
                    <p className="text-xs text-gray-500 truncate">{c.name}</p>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {NATIONAL_NUMBERS.map(function (n) {
              return (
                <a
                  key={n.number}
                  href={'tel:' + n.number}
                  className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="font-bold text-ink text-sm">{n.label}</p>
                    <p className="font-black text-danger text-lg">{n.number}</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{n.note}</p>
                </a>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-black text-ink mb-1">Rescue Organisations</h2>
          <p className="text-sm text-gray-500 mb-5">
            Verified NGOs operating rescue teams in the valley.
          </p>

          {loading ? (
            <div className="py-10"><Spinner /></div>
          ) : ngos.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-sm text-gray-500">
                Could not load organisations. Use the numbers above.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ngos.map(function (ngo) {
                return (
                  <div key={ngo._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="font-black text-ink truncate">{ngo.name}</p>
                      <CheckCircle2 size={14} className="text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-4">
                      <MapPin size={11} /> {ngo.district}
                    </p>

                    <a
                      href={'tel:' + ngo.phone}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
                    >
                      <Phone size={14} /> {ngo.phone}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-start gap-3 mb-5">
            <AlertTriangle size={22} className="text-accent shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-black text-ink">While You Wait</h2>
              <p className="text-sm text-gray-500">
                What to do, and more importantly what not to do.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {FIRST_AID_STEPS.map(function (step, i) {
              const isOpen = openStep === i;
              return (
                <div key={step.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={function () { setOpenStep(isOpen ? -1 : i); }}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-dark text-sm font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="font-bold text-ink text-sm sm:text-base">{step.title}</p>
                    </div>
                    {isOpen
                      ? <ChevronUp size={18} className="text-gray-400 shrink-0" />
                      : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pl-[68px]">
                      <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="bg-white rounded-2xl border-2 border-danger p-6">
            <div className="flex items-start gap-3 mb-4">
              <Skull size={22} className="text-danger shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-black text-ink">Suspected Poisoning</h2>
                <p className="text-sm text-gray-500">
                  Deliberate poisoning of street dogs happens. It is a crime under the
                  Animal Welfare and Livestock Health Act.
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Signs</p>
            <div className="grid sm:grid-cols-2 gap-2 mb-5">
              {POISON_SIGNS.map(function (s) {
                return (
                  <div key={s} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                    <p className="text-sm text-gray-600">{s}</p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-red-50">
              <p className="text-sm font-bold text-danger mb-1">This is time critical</p>
              <p className="text-sm text-gray-700">
                Get the animal to a vet immediately. Do not induce vomiting unless a vet
                instructs you to. If you can identify the substance, photograph the
                container. If you suspect it was deliberate, call the police on 100 and
                report the location.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-primary rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex items-start gap-3 mb-4">
            <Clock size={22} className="shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-black">Response times</h2>
              <p className="text-sm text-white/80">
                Volunteers are dispatched based on urgency and proximity.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-xs font-bold text-white/60 uppercase mb-1">Critical</p>
              <p className="text-sm text-white/90">
                Bleeding, hit by vehicle, poisoning, unable to move
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-xs font-bold text-white/60 uppercase mb-1">High</p>
              <p className="text-sm text-white/90">
                Visible injury, severe illness, trapped, abandoned young
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-xs font-bold text-white/60 uppercase mb-1">Moderate</p>
              <p className="text-sm text-white/90">
                Malnourished, skin condition, lost pet, needs sterilisation
              </p>
            </div>
          </div>

          <p className="text-xs text-white/60 mt-5">
            Be honest about urgency. Marking a moderate case as critical delays
            someone whose animal is dying.
          </p>
        </section>

        <div className="text-center py-4">
          <p className="text-gray-500 mb-4">Ready to report?</p>
          <Link to="/rescue/report">
            <Button variant="danger" size="lg" icon={Siren} iconRight={ArrowRight}>
              Report a Rescue Case
            </Button>
          </Link>
        </div>

      </div>
    </PageWrapper>
  );
}