import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, ShieldCheck, CalendarDays, Lock, Star, PlayCircle, Globe, Share2, MessageCircle, Mail, Phone, MapPinned } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-bg text-text">

      {/* ═══════ HEADER ═══════ */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <Bus className="w-7 h-7" />
          <h2 className="text-xl font-black tracking-tight text-text">EduRide</h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'Testimonials'].map((label) => (
            <a key={label} href={`#${label.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium no-underline hover:text-primary transition-colors">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-bold px-4 py-2 rounded-lg border-none bg-transparent cursor-pointer hover:bg-slate-100 transition-colors">Login</button>
          <button onClick={() => navigate('/login')} className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-lg border-none cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Get Started</button>
        </div>
      </header>

      <main className="flex-1">

        {/* ═══════ HERO ═══════ */}
        <section className="px-6 md:px-20 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full w-fit text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Trusted by 10,000+ Parents
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">
                Safe, Reliable Student Transport <span className="text-primary">at Your Fingertips</span>
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
                Peace of mind for parents with our trusted school commute solution. Every journey tracked, every student safe, every morning simplified.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/login')} className="bg-primary text-white text-lg font-bold px-8 py-4 rounded-xl border-none cursor-pointer shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform">
                  Book Your First Ride
                </button>
                <button className="flex items-center justify-center gap-2 border border-slate-200 px-8 py-4 rounded-xl font-bold cursor-pointer bg-transparent hover:bg-white transition-colors">
                  <PlayCircle className="w-5 h-5" />
                  See How It Works
                </button>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl group-hover:bg-primary/20 transition-all" />
              <div className="relative bg-slate-200 rounded-3xl overflow-hidden aspect-4/3 shadow-2xl border-4 border-white">
                <img
                  alt="Modern yellow school bus on a clean city street"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWZuZMEe7cug5zQjh2zYgEukrXK9GLdGCHQvTRIYzmv2orqPI4ZZXs2JoepkQ2sAl_g-pRxXsN3LuUPRx7DcDo0VXT7aGYIQRq1ULO_nDyzY3fOUpFm2o_Tqw0_0g1ux4nu9q45hBgsULEwT1nuuQC-BwfkrSidplX5h4HHGAgUF_KRA89VOmzMysD2_kLcBqd58NmqzFTEzVELV_na0EZle3M8UpB8U9B96HRN2SyYIXzofTkSwy-yqk53xKASsdBxauvq5ZQKzSA"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section id="features" className="bg-white py-24 px-6 md:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Why Parents Trust Us</h2>
              <p className="text-text-secondary max-w-2xl mx-auto">Designed with safety and convenience at the core of every student's daily commute.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: MapPin, title: 'Real-time Tracking', desc: "Monitor your child's journey in real-time with live GPS tracking on your mobile device.", color: 'text-primary', bg: 'bg-primary/10', hoverBg: 'group-hover:bg-primary' },
                { icon: ShieldCheck, title: 'Verified Drivers', desc: 'Every driver undergoes rigorous 5-point background checks and specialized safety training.', color: 'text-green-600', bg: 'bg-green-500/10', hoverBg: 'group-hover:bg-green-600' },
                { icon: CalendarDays, title: 'Easy Booking', desc: 'Manage daily routes and seasonal schedules with just a few clicks in our intuitive app.', color: 'text-blue-600', bg: 'bg-blue-500/10', hoverBg: 'group-hover:bg-blue-600' },
                { icon: Lock, title: 'Secure Payments', desc: 'Fully encrypted payment processing for all your flexible subscription or one-time needs.', color: 'text-purple-600', bg: 'bg-purple-500/10', hoverBg: 'group-hover:bg-purple-600' },
              ].map((f) => (
                <div key={f.title} className="p-8 rounded-2xl border border-slate-100 bg-white hover:shadow-xl transition-shadow group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.bg} ${f.color} mb-6 ${f.hoverBg} group-hover:text-white transition-colors`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section id="how-it-works" className="py-24 px-6 md:px-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-12 tracking-tight">
                Your Child's Safety in <span className="text-primary">3 Simple Steps</span>
              </h2>
              <div className="space-y-12 relative">
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 hidden sm:block" />
                {[
                  { n: '1', title: 'Register Student', desc: "Create a secure profile with your child's school details and pick-up preferences." },
                  { n: '2', title: 'Choose Route', desc: 'Select from optimized existing routes or request a custom stop near your residence.' },
                  { n: '3', title: 'Book & Pay', desc: 'Confirm your seat, set your schedule, and complete the booking with secure payment.' },
                ].map((s) => (
                  <div key={s.n} className="relative flex gap-6 items-start">
                    <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl ring-8 ring-bg shrink-0">{s.n}</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                      <p className="text-text-secondary">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-100">
              <img
                alt="Mobile app interface showing live bus tracking map"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD09lYKas60F2KPe-MQCf8iDGizzZ5_fDLNiSIBOuvz1wMKltgse59RR9fJa0ghw2qeW1mNlopLdtNomBBhbWz_zT4_7FFFlT9Zv9OqcXvLBmYhQUalkgFwSFDIfuI6DjyeP_xwQIln1mrNhFMlawmkoN0dYeeRc9M76o_eXa7Uf13EYz2XbzIhdCCexWKgO17WVlltdwAe9pAvsmmgV1pzBTG3atIRawYo8v0EtfZ8tjG5qhAd8vJTQ8MyFKAwKebx_USGMNas9ygQ"
                className="rounded-2xl w-full"
              />
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section id="testimonials" className="bg-primary py-24 px-6 md:px-20 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">What Our Community Says</h2>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: '"EduRide has completely changed our morning routine. No more rushing, and I love seeing exactly where the bus is at any time."',
                  name: 'Sarah Jenkins',
                  role: 'Mother of two',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD8Fqo6Ziv-dJtSAXGxCjnVy0ArAolKYRKESiMwGkDBMdY1tcJbhXtvb11Z4StbCexvO5bc8aCg9S3mF9OONNcdUTnsnfg0chgiezY09g7Iozozl9b8Ch49l_DBY7_JMo_iOwF2LitogPq-zhFo27YpM1rA15JxNfW-0VojBzgvhCUN55IwFixIr2oXUor3PLaCI-QHICkFIQ4hsCkL5MHTO806YksZnBWXgZZ2sGBTDbfnZTi4bcth3LuWFzqMmkHFc1PNB_v3MzA',
                },
                {
                  quote: '"Safety was my top priority. After meeting the driver and seeing the vetting process, I felt 100% confident in choosing EduRide."',
                  name: 'David Chen',
                  role: 'Parent at Lincoln High',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi6oCv5KsF_4yxR8KyQSha1vs7-4W0wHQmx5Naafnb65B-_e4GQ2neSTngvAerjiA0GeTLl3QqFjCgQ41ER69nPDDDOpddeSBrAORFHxw1Z1B1bPHMGtb98ZH53jI0W7a7HUD_QO2sKCYANjEGr2sBSa6H6ePE_RSTtiZp3nFSuU55049yu8NjiYXDAcuvfa0SJp5E2Oo8i1EmkVrsycaxrRLP0BWbVNAuiwu7aZ7bPcU0Fy4QIfQ4WHFEDKjMGqyS2gGONcXhLsWW',
                },
                {
                  quote: '"The app is so easy to use. Rescheduling for after-school activities takes seconds. Worth every penny for the peace of mind."',
                  name: 'Emma Wilson',
                  role: 'Working Parent',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfmcVr7OL3-ahZllCNu6ig7GQDNccqTizmStJoBrSzIxEvo1VKF8fmjaE_RcgZL1Itt5NYlkRAPXZ08OoAfGmfFUCO71LfV76e7pYktUPL3cG2k543Vxkn9lHsvxbhzDGYp3hOS7bBBfHNeqpZ3kCgC-mWLZQJn7pyV5_ThroxiGiEMbBULQMUO-VT3oPSQtJKTnlmKygPtyh7xxp4KTMPvQPWjIb1phsi5sE9gqrkc9IjvnVTmQN7yxdYztCkgIdBniBdxMdq01sC',
                },
              ].map(t => (
                <div key={t.name} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
                  <p className="text-lg italic mb-6 leading-relaxed">{t.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden shrink-0">
                      <img alt={t.name} src={t.img} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-white/70 text-sm">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section className="py-24 px-6 md:px-20 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to simplify your school commute?</h2>
          <p className="text-xl text-text-secondary mb-10">Join thousands of parents who have already switched to a safer, smarter way to travel.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/login')} className="bg-primary text-white text-xl font-bold px-10 py-5 rounded-2xl border-none cursor-pointer shadow-2xl shadow-primary/30 hover:scale-105 transition-all">Start Your Free Trial</button>
            <button className="bg-white border border-slate-200 text-xl font-bold px-10 py-5 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">Contact Sales</button>
          </div>
        </section>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6 md:px-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
              <Bus className="w-7 h-7" />
              <h2 className="text-xl font-black tracking-tight text-white">EduRide</h2>
            </div>
            <p className="text-sm leading-relaxed">Redefining student safety and transportation efficiency for the modern generation of parents and schools.</p>
            <div className="flex gap-4">
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center no-underline text-slate-300 hover:bg-primary hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm list-none p-0 m-0">
              {['About Us', 'Safety Protocols', 'Careers', 'Press Kit'].map(l => (
                <li key={l}><a href="#" className="text-slate-300 no-underline hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm list-none p-0 m-0">
              {['Help Center', 'Contact Support', 'Privacy Policy', 'Terms of Service'].map(l => (
                <li key={l}><a href="#" className="text-slate-300 no-underline hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm list-none p-0 m-0">
              <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary shrink-0" />hello@eduride.app</li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary shrink-0" />1-800-EDURIDE</li>
              <li className="flex items-start gap-3"><MapPinned className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>123 Transport Way, Suite 400<br />San Francisco, CA 94103</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EduRide Technologies Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
