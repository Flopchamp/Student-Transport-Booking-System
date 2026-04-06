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
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert('Payment successful! (Demo)');
    }, 2000);
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  /* ─── demo booking data ─── */
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

  const inputCls = 'w-full h-12 px-4 text-[15px] border border-slate-200 rounded-[10px] bg-white outline-none text-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent';

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Process</div>

      {/* Back Link */}
      <Link to="/my-bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Booking
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-[26px] font-extrabold text-slate-800">Complete Your Payment</h1>
        <p className="text-sm text-slate-500 mt-1">Please review your booking and choose a payment method to finalize.</p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7 items-start">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* Payment Method Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-800">Select Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Credit/Debit Card */}
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`relative flex items-center gap-3.5 p-4 rounded-xl cursor-pointer text-left transition
                  ${method === 'card' ? 'border-2 border-primary bg-blue-50/50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="w-10 h-10 rounded-[10px] shrink-0 bg-primary flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Credit/Debit Card</div>
                  <div className="text-xs text-slate-400">Visa, Mastercard, Amex</div>
                </div>
                <div className={`absolute top-4 right-4 w-[18px] h-[18px] rounded-full bg-white
                  ${method === 'card' ? 'border-[5px] border-primary' : 'border-2 border-slate-300'}`} />
              </button>

              {/* M-Pesa */}
              <button
                type="button"
                onClick={() => setMethod('mpesa')}
                className={`relative flex items-center gap-3.5 p-4 rounded-xl cursor-pointer text-left transition
                  ${method === 'mpesa' ? 'border-2 border-primary bg-blue-50/50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="w-10 h-10 rounded-[10px] shrink-0 bg-green-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">M-Pesa</div>
                  <div className="text-xs text-slate-400">Mobile Money Transfer</div>
                </div>
                <div className={`absolute top-4 right-4 w-[18px] h-[18px] rounded-full bg-white
                  ${method === 'mpesa' ? 'border-[5px] border-primary' : 'border-2 border-slate-300'}`} />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-7">
            <form onSubmit={handlePay}>
              {method === 'card' ? (
                <>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">Card Details</div>

                  <div className="mb-[18px]">
                    <label className="block text-xs font-semibold text-slate-600 tracking-wide mb-2">Cardholder Name</label>
                    <input type="text" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} placeholder="John Doe" className={inputCls} required />
                  </div>

                  <div className="mb-[18px]">
                    <label className="block text-xs font-semibold text-slate-600 tracking-wide mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className={inputCls}
                        required
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex gap-1.5">
                        <div className="w-8 h-5 rounded bg-slate-100 flex items-center justify-center">
                          <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="0" y="0" width="20" height="14" rx="2" fill="#1a1f71"/><text x="3" y="10" fontSize="7" fontWeight="bold" fill="#fff">V</text></svg>
                        </div>
                        <div className="w-8 h-5 rounded bg-slate-100 flex items-center justify-center">
                          <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><circle cx="8" cy="7" r="5" fill="#eb001b" opacity="0.8"/><circle cx="12" cy="7" r="5" fill="#f79e1b" opacity="0.8"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 mb-7">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 tracking-wide mb-2">Expiry Date</label>
                      <input type="text" value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })} placeholder="MM/YY" maxLength={5} className={inputCls} required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 tracking-wide mb-2">CVV</label>
                      <input type="text" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123" maxLength={4} className={inputCls} required />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">M-Pesa Details</div>
                  <div className="mb-7">
                    <label className="block text-xs font-semibold text-slate-600 tracking-wide mb-2">M-Pesa Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                      <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className={`${inputCls} pl-10`} required />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">You will receive an STK push prompt on your phone to confirm payment.</p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="h-12 px-9 rounded-[10px] border-none bg-primary text-white text-[15px] font-bold cursor-pointer shrink-0 hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
                <p className="text-xs text-slate-400 leading-relaxed">
                  By clicking Pay Now, you agree to our{' '}
                  <a href="#" className="text-primary underline">Terms of Service</a>{' '}and{' '}
                  <a href="#" className="text-primary underline">Refund Policy</a>.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
          {/* Route image header */}
          <div className="h-[140px] relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-end p-4">
            <div className="absolute inset-0 opacity-15">
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
              <span className="text-[10px] font-bold text-white bg-green-600 px-2.5 py-0.5 rounded uppercase tracking-wide">Active Route</span>
              <h3 className="text-xl font-extrabold text-white mt-1.5 drop-shadow">{booking.routeName}</h3>
            </div>
          </div>

          {/* Booking details */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5 mb-3.5">
              <User className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Student</div>
                <div className="text-sm font-semibold text-slate-800">{booking.studentName}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 mb-3.5">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Schedule</div>
                <div className="text-[13px] font-medium text-slate-800 leading-relaxed">
                  {booking.schedulePickup}<br />
                  {booking.scheduleDropoff}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-violet-500 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Stops</div>
                <div className="text-[13px] font-medium text-slate-800">{booking.stops}</div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 mx-5" />

          {/* Pricing Breakdown */}
          <div className="px-5 pt-4 pb-5">
            <h4 className="text-sm font-bold text-slate-800 mb-3.5">Pricing Breakdown</h4>
            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between text-slate-600">
                <span>Monthly Base Fare</span>
                <span className="font-semibold text-slate-800">${booking.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Early Booking Discount</span>
                <span className="font-semibold text-green-600">-${Math.abs(booking.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service Fee ({(booking.serviceFeeRate * 100).toFixed(1)}%)</span>
                <span className="font-semibold text-slate-800">${serviceFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="h-px bg-slate-200 my-3.5" />

            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-800">Total Amount</span>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">USD Per Month</div>
              </div>
            </div>

            {/* SSL badge */}
            <div className="flex items-center gap-2 mt-4 px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <Shield className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-400 leading-snug">Secure 256-bit SSL Encrypted Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
