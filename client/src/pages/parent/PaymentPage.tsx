import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  User,
  Clock,
  MapPin,
  Shield,
} from 'lucide-react';

type PaymentMethod = 'card' | 'mpesa';

export default function PaymentPage() {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [cardForm, setCardForm] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment
    setTimeout(() => {
      setProcessing(false);
      alert('Payment successful! (Demo)');
    }, 2000);
  };

  /* ─── formatting helpers ─── */
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  /* ─── styles ─── */
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    fontSize: 15,
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fff',
    outline: 'none',
    color: '#1e293b',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    letterSpacing: '0.02em',
    marginBottom: 8,
    display: 'block',
  };

  /* ─── demo booking data (right column) ─── */
  const booking = {
    routeName: 'Downtown Express',
    studentName: 'Alex Johnson',
    schedulePickup: 'Mon-Fri, 7:30 AM (Pickup)',
    scheduleDropoff: 'Mon-Fri, 3:45 PM (Dropoff)',
    stops: "Maple Heights to St. Jude's",
    baseFare: 120.0,
    discount: -10.0,
    serviceFeeRate: 0.025,
  };
  const serviceFee = +(booking.baseFare * booking.serviceFeeRate).toFixed(2);
  const total = +(booking.baseFare + booking.discount + serviceFee).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ─── Breadcrumb ─── */}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Payment Process
      </div>

      {/* ─── Back Link ─── */}
      <Link
        to="/my-bookings"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#137fec', textDecoration: 'none' }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Booking
      </Link>

      {/* ─── Header ─── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>Complete Your Payment</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Please review your booking and choose a payment method to finalize.
        </p>
      </div>

      {/* ═══════ Two-Column Layout ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* ── Payment Method Selection ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CreditCard style={{ width: 20, height: 20, color: '#1e293b' }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Select Payment Method</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Credit/Debit Card option */}
              <button
                type="button"
                onClick={() => setMethod('card')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  border: method === 'card' ? '2px solid #137fec' : '1px solid #e2e8f0',
                  background: method === 'card' ? '#f0f7ff' : '#fff',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: '#137fec', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CreditCard style={{ width: 20, height: 20, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Credit/Debit Card</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Visa, Mastercard, Amex</div>
                </div>
                {/* Radio indicator */}
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 18, height: 18, borderRadius: '50%',
                  border: method === 'card' ? '5px solid #137fec' : '2px solid #cbd5e1',
                  background: '#fff',
                }} />
              </button>

              {/* M-Pesa option */}
              <button
                type="button"
                onClick={() => setMethod('mpesa')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  border: method === 'mpesa' ? '2px solid #137fec' : '1px solid #e2e8f0',
                  background: method === 'mpesa' ? '#f0f7ff' : '#fff',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Smartphone style={{ width: 20, height: 20, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>M-Pesa</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Mobile Money Transfer</div>
                </div>
                <div style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 18, height: 18, borderRadius: '50%',
                  border: method === 'mpesa' ? '5px solid #137fec' : '2px solid #cbd5e1',
                  background: '#fff',
                }} />
              </button>
            </div>
          </div>

          {/* ── Card / M-Pesa Details Form ── */}
          <div style={{ ...card, padding: 28 }}>
            <form onSubmit={handlePay}>
              {method === 'card' ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
                    Card Details
                  </div>

                  {/* Cardholder Name */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Cardholder Name</label>
                    <input
                      type="text"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                      placeholder="John Doe"
                      style={inputStyle}
                      required
                    />
                  </div>

                  {/* Card Number */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Card Number</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        style={inputStyle}
                        required
                      />
                      {/* Card brand icons */}
                      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                        <div style={{ width: 32, height: 20, borderRadius: 4, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                            <rect x="0" y="0" width="20" height="14" rx="2" fill="#1a1f71"/>
                            <text x="3" y="10" fontSize="7" fontWeight="bold" fill="#fff">V</text>
                          </svg>
                        </div>
                        <div style={{ width: 32, height: 20, borderRadius: 4, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                            <circle cx="8" cy="7" r="5" fill="#eb001b" opacity="0.8"/>
                            <circle cx="12" cy="7" r="5" fill="#f79e1b" opacity="0.8"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expiry + CVV row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                    <div>
                      <label style={labelStyle}>Expiry Date</label>
                      <input
                        type="text"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        style={inputStyle}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>CVV</label>
                      <input
                        type="text"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        maxLength={4}
                        style={inputStyle}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
                    M-Pesa Details
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <label style={labelStyle}>M-Pesa Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Smartphone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="+254 7XX XXX XXX"
                        style={{ ...inputStyle, paddingLeft: 42 }}
                        required
                      />
                    </div>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                      You will receive an STK push prompt on your phone to confirm payment.
                    </p>
                  </div>
                </>
              )}

              {/* Pay Now button + terms */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  type="submit"
                  disabled={processing}
                  style={{
                    height: 48, padding: '0 36px', borderRadius: 10, border: 'none',
                    background: '#137fec', color: '#fff', fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', opacity: processing ? 0.6 : 1, flexShrink: 0,
                  }}
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                  By clicking Pay Now, you agree to our{' '}
                  <a href="#" style={{ color: '#137fec', textDecoration: 'underline' }}>Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" style={{ color: '#137fec', textDecoration: 'underline' }}>Refund Policy</a>.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Order Summary ─── */}
        <div style={{ ...card, overflow: 'hidden', position: 'sticky', top: 24 }}>
          {/* Route image header */}
          <div style={{
            height: 140, position: 'relative',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
            display: 'flex', alignItems: 'flex-end', padding: 16,
          }}>
            {/* Bus illustration overlay */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
              <svg width="100%" height="100%" viewBox="0 0 340 140" fill="none">
                <rect x="60" y="40" width="120" height="70" rx="8" fill="#fff"/>
                <rect x="65" y="48" width="30" height="25" rx="3" fill="#87ceeb"/>
                <rect x="100" y="48" width="30" height="25" rx="3" fill="#87ceeb"/>
                <rect x="135" y="48" width="30" height="25" rx="3" fill="#87ceeb"/>
                <circle cx="85" cy="115" r="10" fill="#333"/>
                <circle cx="155" cy="115" r="10" fill="#333"/>
              </svg>
            </div>

            <div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#fff', background: '#16a34a',
                padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                Active Route
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '6px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                {booking.routeName}
              </h3>
            </div>
          </div>

          {/* Booking details */}
          <div style={{ padding: '20px 20px 16px' }}>
            {/* Student */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <User style={{ width: 16, height: 16, color: '#137fec', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Student</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{booking.studentName}</div>
              </div>
            </div>

            {/* Schedule */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <Clock style={{ width: 16, height: 16, color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Schedule</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', lineHeight: 1.6 }}>
                  {booking.schedulePickup}<br />
                  {booking.scheduleDropoff}
                </div>
              </div>
            </div>

            {/* Stops */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin style={{ width: 16, height: 16, color: '#8b5cf6', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stops</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{booking.stops}</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#e2e8f0', margin: '0 20px' }} />

          {/* Pricing Breakdown */}
          <div style={{ padding: '16px 20px 20px' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 14px' }}>Pricing Breakdown</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Monthly Base Fare</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>${booking.baseFare.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Early Booking Discount</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>-${Math.abs(booking.discount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Service Fee ({(booking.serviceFeeRate * 100).toFixed(1)}%)</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>${serviceFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#e2e8f0', margin: '14px 0' }} />

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Total Amount</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#137fec' }}>${total.toFixed(2)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  USD Per Month
                </div>
              </div>
            </div>

            {/* SSL badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
              padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
            }}>
              <Shield style={{ width: 16, height: 16, color: '#94a3b8', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                Secure 256-bit SSL Encrypted Payment
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
