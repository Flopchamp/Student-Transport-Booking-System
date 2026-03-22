import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, ShieldCheck, CalendarDays, Lock, Star, Play, Globe, Share2, MessageCircle, Mail, Phone, MapPinned } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const P = '#137fec';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f6f7f8', color: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' as const }}>

      {/* ═══════ HEADER ═══════ */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: '16px 80px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: P }}>
          <Bus style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.025em', color: '#0f172a' }}>EduTrans</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', textDecoration: 'none' }}>How It Works</a>
          <a href="#testimonials" style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', textDecoration: 'none' }}>Testimonials</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ fontSize: 14, fontWeight: 700, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#0f172a' }}>Login</button>
          <button onClick={() => navigate('/login')} style={{ fontSize: 14, fontWeight: 700, padding: '10px 20px', borderRadius: 8, border: 'none', background: P, color: '#fff', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(19,127,236,0.2)' }}>Get Started</button>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* ═══════ HERO ═══════ */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 80px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(19,127,236,0.1)', color: P, padding: '4px 12px', borderRadius: 9999, width: 'fit-content', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                <ShieldCheck style={{ width: 14, height: 14 }} />
                Trusted by 10,000+ Parents
              </div>
              <h1 style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.025em', color: '#0f172a', margin: 0 }}>
                Safe, Reliable Student Transport <span style={{ color: P }}>at Your Fingertips</span>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.75, color: '#475569', maxWidth: 480, margin: 0 }}>
                Peace of mind for parents with our trusted school commute solution. Every journey tracked, every student safe, every morning simplified.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => navigate('/login')} style={{ fontSize: 18, fontWeight: 700, padding: '16px 32px', borderRadius: 12, border: 'none', background: P, color: '#fff', cursor: 'pointer', boxShadow: '0 20px 25px -5px rgba(19,127,236,0.3)' }}>
                  Book Your First Ride
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, padding: '16px 32px', borderRadius: 12, border: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', color: '#0f172a' }}>
                  <Play style={{ width: 20, height: 20 }} />
                  See How It Works
                </button>
              </div>
            </div>
            {/* Right — hero image */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -16, background: 'rgba(19,127,236,0.1)', borderRadius: 24, filter: 'blur(24px)' }} />
              <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', aspectRatio: '4/3', border: '4px solid white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', background: '#e2e8f0' }}>
                <img
                  alt="Modern yellow school bus"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWZuZMEe7cug5zQjh2zYgEukrXK9GLdGCHQvTRIYzmv2orqPI4ZZXs2JoepkQ2sAl_g-pRxXsN3LuUPRx7DcDo0VXT7aGYIQRq1ULO_nDyzY3fOUpFm2o_Tqw0_0g1ux4nu9q45hBgsULEwT1nuuQC-BwfkrSidplX5h4HHGAgUF_KRA89VOmzMysD2_kLcBqd58NmqzFTEzVELV_na0EZle3M8UpB8U9B96HRN2SyYIXzofTkSwy-yqk53xKASsdBxauvq5ZQKzSA"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section id="features" style={{ backgroundColor: '#fff', padding: '96px 80px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.025em', color: '#0f172a', marginBottom: 16 }}>Why Parents Trust Us</h2>
              <p style={{ color: '#475569', maxWidth: 560, margin: '0 auto', fontSize: 16 }}>Designed with safety and convenience at the core of every student's daily commute.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {[
                { icon: MapPin, title: 'Real-time Tracking', desc: "Monitor your child's journey in real-time with live GPS tracking on your mobile device.", color: P, bg: 'rgba(19,127,236,0.1)' },
                { icon: ShieldCheck, title: 'Verified Drivers', desc: 'Every driver undergoes rigorous 5-point background checks and specialized safety training.', color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
                { icon: CalendarDays, title: 'Easy Booking', desc: 'Manage daily routes and seasonal schedules with just a few clicks in our intuitive app.', color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
                { icon: Lock, title: 'Secure Payments', desc: 'Fully encrypted payment processing for all your flexible subscription or one-time needs.', color: '#9333ea', bg: 'rgba(168,85,247,0.1)' },
              ].map((f) => (
                <div key={f.title} style={{ padding: 32, borderRadius: 16, border: '1px solid #f1f5f9', backgroundColor: '#fff' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: f.bg, color: f.color, marginBottom: 24 }}>
                    <f.icon style={{ width: 24, height: 24 }} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: '#475569' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section id="how-it-works" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 48, color: '#0f172a' }}>
                Your Child's Safety in <span style={{ color: P }}>3 Simple Steps</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 48, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 23, top: 16, bottom: 16, width: 2, backgroundColor: '#e2e8f0' }} />
                {[
                  { n: '1', title: 'Register Student', desc: "Create a secure profile with your child's school details and pick-up preferences." },
                  { n: '2', title: 'Choose Route', desc: 'Select from optimized existing routes or request a custom stop near your residence.' },
                  { n: '3', title: 'Book & Pay', desc: 'Confirm your seat, set your schedule, and complete the booking with secure payment.' },
                ].map((s) => (
                  <div key={s.n} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: P, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0, position: 'relative', zIndex: 1, boxShadow: '0 0 0 8px #f6f7f8' }}>{s.n}</div>
                    <div>
                      <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>{s.title}</h4>
                      <p style={{ color: '#475569', lineHeight: 1.65, fontSize: 15 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 24, padding: 16, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9' }}>
              <img
                alt="Mobile app tracking"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD09lYKas60F2KPe-MQCf8iDGizzZ5_fDLNiSIBOuvz1wMKltgse59RR9fJa0ghw2qeW1mNlopLdtNomBBhbWz_zT4_7FFFlT9Zv9OqcXvLBmYhQUalkgFwSFDIfuI6DjyeP_xwQIln1mrNhFMlawmkoN0dYeeRc9M76o_eXa7Uf13EYz2XbzIhdCCexWKgO17WVlltdwAe9pAvsmmgV1pzBTG3atIRawYo8v0EtfZ8tjG5qhAd8vJTQ8MyFKAwKebx_USGMNas9ygQ"
                style={{ borderRadius: 16, width: '100%', display: 'block' }}
              />
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section id="testimonials" style={{ backgroundColor: P, padding: '96px 80px', color: '#fff', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -96, right: -96, width: 384, height: 384, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(48px)' }} />
          <div style={{ position: 'absolute', bottom: -96, left: -96, width: 256, height: 256, background: 'rgba(0,0,0,0.1)', borderRadius: '50%', filter: 'blur(48px)' }} />
          <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>What Our Community Says</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 24, height: 24, color: '#facc15', fill: '#facc15' }} />)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
              {[
                { quote: '"EduTrans has completely changed our morning routine. No more rushing, and I love seeing exactly where the bus is at any time."', name: 'Sarah Jenkins', role: 'Mother of two', initials: 'SJ', bg: '#f472b6' },
                { quote: '"Safety was my top priority. After meeting the driver and seeing the vetting process, I felt 100% confident in choosing EduTrans."', name: 'David Chen', role: 'Parent at Lincoln High', initials: 'DC', bg: '#60a5fa' },
                { quote: '"The app is so easy to use. Rescheduling for after-school activities takes seconds. Worth every penny for the peace of mind."', name: 'Emma Wilson', role: 'Working Parent', initials: 'EW', bg: '#fbbf24' },
              ].map(t => (
                <div key={t.name} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', padding: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)' }}>
                  <p style={{ fontSize: 18, fontStyle: 'italic', marginBottom: 24, lineHeight: 1.65 }}>{t.quote}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>{t.initials}</div>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>{t.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section style={{ padding: '96px 80px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 24, color: '#0f172a' }}>Ready to simplify your school commute?</h2>
          <p style={{ fontSize: 20, color: '#475569', marginBottom: 40 }}>Join thousands of parents who have already switched to a safer, smarter way to travel.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button onClick={() => navigate('/login')} style={{ fontSize: 20, fontWeight: 700, padding: '20px 40px', borderRadius: 16, border: 'none', background: P, color: '#fff', cursor: 'pointer', boxShadow: '0 25px 50px -12px rgba(19,127,236,0.3)' }}>Start Your Free Trial</button>
            <button style={{ fontSize: 20, fontWeight: 700, padding: '20px 40px', borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#0f172a' }}>Contact Sales</button>
          </div>
        </section>
      </main>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '64px 80px 32px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48, marginBottom: 64 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Bus style={{ width: 28, height: 28, color: P }} />
              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>EduTrans</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>Redefining student safety and transportation efficiency for the modern generation of parents and schools.</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {[Globe, Share2, MessageCircle].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textDecoration: 'none' }}>
                  <Icon style={{ width: 20, height: 20 }} />
                </a>
              ))}
            </div>
          </div>
          {/* Company */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 24, fontSize: 16 }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['About Us', 'Safety Protocols', 'Careers', 'Press Kit'].map(l => <li key={l}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>{l}</a></li>)}
            </ul>
          </div>
          {/* Support */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 24, fontSize: 16 }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Help Center', 'Contact Support', 'Privacy Policy', 'Terms of Service'].map(l => <li key={l}><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>{l}</a></li>)}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 24, fontSize: 16 }}>Contact</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}><Mail style={{ width: 20, height: 20, color: P, flexShrink: 0 }} />hello@edutrans.app</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}><Phone style={{ width: 20, height: 20, color: P, flexShrink: 0 }} />1-800-EDUTRANS</li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14 }}><MapPinned style={{ width: 20, height: 20, color: P, flexShrink: 0, marginTop: 2 }} /><span>123 Transport Way, Suite 400<br />San Francisco, CA 94103</span></li>
            </ul>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 32, borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: 12, color: '#64748b' }}>
          <p>© 2024 EduTrans Technologies Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
