import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, ShieldCheck, CalendarDays, Lock, Star, Play, Globe, Share2, MessageCircle, Mail, Phone, MapPinned } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="font-sans bg-bg text-text min-h-screen flex flex-col overflow-x-hidden">

      {/* ═══════ HEADER ═══════ */}
      <header className="flex items-center justify-between border-b border-border bg-white/85 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <Bus className="w-7 h-7" />
          <span className="text-xl font-black tracking-tight text-text">EduTrans</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text no-underline hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-text no-underline hover:text-primary transition-colors">How It Works</a>
          <a href="#testimonials" className="text-sm font-medium text-text no-underline hover:text-primary transition-colors">Testimonials</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-sm font-bold px-4 py-2 rounded-lg border-none bg-transparent cursor-pointer text-text hover:bg-gray-100 transition-colors">Login</button>
          <button onClick={() => navigate('/login')} className="text-sm font-bold px-5 py-2.5 rounded-lg border-none bg-primary text-white cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">Get Started</button>
        </div>
      </header>

      <main className="flex-1">

        {/* ═══════ HERO ═══════ */}
        <section className="max-w-7xl mx-auto px-6 md:px-20 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full w-fit text-xs font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                Trusted by 10,000+ Parents
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black leading-[1.1] tracking-tight text-text m-0">
                Safe, Reliable Student Transport <span className="text-primary">at Your Fingertips</span>
              </h1>
              <p className="text-lg leading-relaxed text-text-secondary max-w-lg m-0">
                Peace of mind for parents with our trusted school commute solution. Every journey tracked, every student safe, every morning simplified.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/login')} className="text-lg font-bold px-8 py-4 rounded-xl border-none bg-primary text-white cursor-pointer shadow-xl shadow-primary/30 hover:bg-primary/90 transition-colors">
                  Book Your First Ride
                </button>
                <button className="flex items-center gap-2 text-base font-bold px-8 py-4 rounded-xl border border-border bg-transparent cursor-pointer text-text hover:bg-gray-50 transition-colors">
                  <Play className="w-5 h-5" />
                  See How It Works
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border-4 border-white shadow-2xl bg-gray-200">
                <img
                  alt="Modern yellow school bus"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWZuZMEe7cug5zQjh2zYgEukrXK9GLdGCHQvTRIYzmv2orqPI4ZZXs2JoepkQ2sAl_g-pRxXsN3LuUPRx7DcDo0VXT7aGYIQRq1ULO_nDyzY3fOUpFm2o_Tqw0_0g1ux4nu9q45hBgsULEwT1nuuQC-BwfkrSidplX5h4HHGAgUF_KRA89VOmzMysD2_kLcBqd58NmqzFTEzVELV_na0EZle3M8UpB8U9B96HRN2SyYIXzofTkSwy-yqk53xKASsdBxauvq5ZQKzSA"
                  className="w-full h-full object-cover block"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section id="features" className="bg-white py-24 px-6 md:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-text mb-4">Why Parents Trust Us</h2>
              <p className="text-text-secondary max-w-xl mx-auto text-base">Designed with safety and convenience at the core of every student's daily commute.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: MapPin, title: 'Real-time Tracking', desc: "Monitor your child's journey in real-time with live GPS tracking on your mobile device.", color: 'text-primary', bg: 'bg-primary/10' },
                { icon: ShieldCheck, title: 'Verified Drivers', desc: 'Every driver undergoes rigorous 5-point background checks and specialized safety training.', color: 'text-green-600', bg: 'bg-green-500/10' },
                { icon: CalendarDays, title: 'Easy Booking', desc: 'Manage daily routes and seasonal schedules with just a few clicks in our intuitive app.', color: 'text-blue-600', bg: 'bg-blue-500/10' },
                { icon: Lock, title: 'Secure Payments', desc: 'Fully encrypted payment processing for all your flexible subscription or one-time needs.', color: 'text-purple-600', bg: 'bg-purple-500/10' },
              ].map((f) => (
                <div key={f.title} className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.bg} ${f.color} mb-6`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-text">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 md:px-20 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12 text-text">
                Your Child's Safety in <span className="text-primary">3 Simple Steps</span>
              </h2>
              <div className="flex flex-col gap-12 relative">
                <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-border" />
                {[
                  { n: '1', title: 'Register Student', desc: "Create a secure profile with your child's school details and pick-up preferences." },
                  { n: '2', title: 'Choose Route', desc: 'Select from optimized existing routes or request a custom stop near your residence.' },
                  { n: '3', title: 'Book & Pay', desc: 'Confirm your seat, set your schedule, and complete the booking with secure payment.' },
                ].map((s) => (
                  <div key={s.n} className="flex gap-6 items-start relative">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shrink-0 relative z-10 shadow-[0_0_0_8px_var(--color-bg)]">{s.n}</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-text">{s.title}</h4>
                      <p className="text-text-secondary leading-relaxed text-[15px]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-100">
              <img
                alt="Mobile app tracking"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD09lYKas60F2KPe-MQCf8iDGizzZ5_fDLNiSIBOuvz1wMKltgse59RR9fJa0ghw2qeW1mNlopLdtNomBBhbWz_zT4_7FFFlT9Zv9OqcXvLBmYhQUalkgFwSFDIfuI6DjyeP_xwQIln1mrNhFMlawmkoN0dYeeRc9M76o_eXa7Uf13EYz2XbzIhdCCexWKgO17WVlltdwAe9pAvsmmgV1pzBTG3atIRawYo8v0EtfZ8tjG5qhAd8vJTQ8MyFKAwKebx_USGMNas9ygQ"
                className="rounded-2xl w-full block"
              />
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section id="testimonials" className="bg-primary py-24 px-6 md:px-20 text-white overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[48px]" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-[48px]" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">What Our Community Says</h2>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: '"EduTrans has completely changed our morning routine. No more rushing, and I love seeing exactly where the bus is at any time."', name: 'Sarah Jenkins', role: 'Mother of two', initials: 'SJ', bg: 'bg-pink-400' },
                { quote: '"Safety was my top priority. After meeting the driver and seeing the vetting process, I felt 100% confident in choosing EduTrans."', name: 'David Chen', role: 'Parent at Lincoln High', initials: 'DC', bg: 'bg-blue-400' },
                { quote: '"The app is so easy to use. Rescheduling for after-school activities takes seconds. Worth every penny for the peace of mind."', name: 'Emma Wilson', role: 'Working Parent', initials: 'EW', bg: 'bg-yellow-400' },
              ].map(t => (
                <div key={t.name} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                  <p className="text-lg italic mb-6 leading-relaxed">{t.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${t.bg} flex items-center justify-center font-bold text-sm text-white`}>{t.initials}</div>
                    <div>
                      <p className="font-bold m-0">{t.name}</p>
                      <p className="text-white/70 text-sm m-0">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section className="py-24 px-6 md:px-20 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-[44px] font-black tracking-tight mb-6 text-text leading-tight">Ready to simplify your school commute?</h2>
          <p className="text-xl text-text-secondary mb-10">Join thousands of parents who have already switched to a safer, smarter way to travel.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/login')} className="text-xl font-bold px-10 py-5 rounded-2xl border-none bg-primary text-white cursor-pointer shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-colors">Start Your Free Trial</button>
            <button className="text-xl font-bold px-10 py-5 rounded-2xl border border-border bg-white cursor-pointer text-text hover:bg-gray-50 transition-colors">Contact Sales</button>
          </div>
        </section>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-slate-900 text-slate-400 px-6 md:px-20 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Bus className="w-7 h-7 text-primary" />
              <span className="text-xl font-black text-white">EduTrans</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">Redefining student safety and transportation efficiency for the modern generation of parents and schools.</p>
            <div className="flex gap-4">
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 no-underline hover:bg-slate-700 hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-base">Company</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-4">
              {['About Us', 'Safety Protocols', 'Careers', 'Press Kit'].map(l => <li key={l}><a href="#" className="text-slate-400 no-underline text-sm hover:text-white transition-colors">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-base">Support</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-4">
              {['Help Center', 'Contact Support', 'Privacy Policy', 'Terms of Service'].map(l => <li key={l}><a href="#" className="text-slate-400 no-underline text-sm hover:text-white transition-colors">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-base">Contact</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-4">
              <li className="flex items-center gap-3 text-sm"><Mail className="w-5 h-5 text-primary shrink-0" />hello@edutrans.app</li>
              <li className="flex items-center gap-3 text-sm"><Phone className="w-5 h-5 text-primary shrink-0" />1-800-EDUTRANS</li>
              <li className="flex items-start gap-3 text-sm"><MapPinned className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>123 Transport Way, Suite 400<br />San Francisco, CA 94103</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EduTrans Technologies Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
