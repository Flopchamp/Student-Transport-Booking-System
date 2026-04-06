import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  User,
  Clock,
  MapPin,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import type { Booking } from '../../types';

type PaymentMethod = 'stripe' | 'mpesa';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('booking');

  const [method, setMethod] = useState<PaymentMethod>('stripe');
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Booking state
  const [unpaidBookings, setUnpaidBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Success state
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  const fetchUnpaidBookings = async () => {
    try {
      const res = await api.get('/bookings', { params: { status: 'pending', limit: 50 } });
      const raw = res.data.data;
      const bookings: Booking[] = Array.isArray(raw) ? raw : (raw?.bookings || []);
      setUnpaidBookings(bookings);

      // Auto-select if bookingId was passed as query param
      if (bookingIdParam) {
        const found = bookings.find((b) => b.id === bookingIdParam);
        if (found) setSelectedBooking(found);
      }

      // Auto-select if only one unpaid booking
      if (!bookingIdParam && bookings.length === 1) {
        setSelectedBooking(bookings[0]);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchUnpaidBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setProcessing(true);
    setError('');

    try {
      const payload: Record<string, string> = {
        booking_id: selectedBooking.id,
        payment_method: method,
      };

      if (method === 'mpesa' && mpesaPhone) {
        payload.phone_number = mpesaPhone;
      }

      const res = await api.post('/payments', payload);
      const payment = res.data.data?.payment;

      if (res.data.success) {
        setPaymentSuccess(true);
        setPaymentRef(payment?.transaction_reference || '');
      } else {
        setError(res.data.message || 'Payment failed. Please try again.');
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(apiErr.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
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

  /* ─── Derive booking display data ─── */
  const booking = selectedBooking;
  const baseFare = booking?.route?.price
    ? Number(booking.route.price)
    : (booking ? Number(booking.amount || booking.fare_amount || 0) : 0);
  const discount = -10.0;
  const serviceFeeRate = 0.025;
  const serviceFee = +(baseFare * serviceFeeRate).toFixed(2);
  const total = +(baseFare + discount + serviceFee).toFixed(2);

  const inputCls = 'w-full h-12 px-4 text-[15px] border border-slate-200 rounded-xl bg-white outline-none text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  /* ─── Loading ─── */
  if (loadingBookings) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── Payment Success ─── */
  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <CheckCircle className="w-16 h-16 text-emerald-500" />
        <h2 className="text-2xl font-bold text-slate-800">Payment Successful!</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Your payment has been processed and your booking is now confirmed.
          {paymentRef && <><br />Reference: <strong>{paymentRef}</strong></>}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => navigate('/my-bookings')}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => { setPaymentSuccess(false); setSelectedBooking(null); fetchUnpaidBookings(); }}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  /* ─── No Unpaid Bookings ─── */
  if (unpaidBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <CheckCircle className="w-14 h-14 text-emerald-400" />
        <h2 className="text-xl font-bold text-slate-800">All Caught Up!</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          You don't have any pending bookings that require payment.
        </p>
        <Link to="/book-transport" className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          Book Transport
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Process</div>

      {/* Back Link */}
      <Link to="/my-bookings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-[26px] font-extrabold text-slate-800">Complete Your Payment</h1>
        <p className="text-sm text-slate-500 mt-1">Please review your booking and choose a payment method to finalize.</p>
      </div>

      {/* Booking Selector (if multiple unpaid) */}
      {!selectedBooking && unpaidBookings.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Select Booking to Pay</h2>
          <p className="text-sm text-slate-500 mb-4">You have {unpaidBookings.length} pending bookings</p>
          <div className="flex flex-col gap-3">
            {unpaidBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">
                    {b.booking_reference} — {b.student?.first_name} {b.student?.last_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {b.route?.name || 'Route'} • Starting {b.start_date}
                  </div>
                </div>
                <div className="text-base font-bold text-blue-600">
                  ${Number(b.amount || b.fare_amount || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main payment flow (shown when booking is selected) */}
      {selectedBooking && (
        <>
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7 items-start">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6">
              {/* If multiple bookings, show change link */}
              {unpaidBookings.length > 1 && (
                <button onClick={() => setSelectedBooking(null)} className="text-sm text-blue-600 font-semibold hover:underline self-start">
                  ← Change selected booking
                </button>
              )}

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
                    onClick={() => setMethod('stripe')}
                    className={`relative flex items-center gap-3.5 p-4 rounded-xl cursor-pointer text-left transition
                      ${method === 'stripe' ? 'border-2 border-blue-600 bg-blue-50/50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="w-10 h-10 rounded-xl shrink-0 bg-blue-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Credit/Debit Card</div>
                      <div className="text-xs text-slate-400">Visa, Mastercard, Amex</div>
                    </div>
                    <div className={`absolute top-4 right-4 w-4.5 h-4.5 rounded-full bg-white
                      ${method === 'stripe' ? 'border-[5px] border-blue-600' : 'border-2 border-slate-300'}`} />
                  </button>

                  {/* M-Pesa */}
                  <button
                    type="button"
                    onClick={() => setMethod('mpesa')}
                    className={`relative flex items-center gap-3.5 p-4 rounded-xl cursor-pointer text-left transition
                      ${method === 'mpesa' ? 'border-2 border-blue-600 bg-blue-50/50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="w-10 h-10 rounded-xl shrink-0 bg-green-600 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">M-Pesa</div>
                      <div className="text-xs text-slate-400">Mobile Money Transfer</div>
                    </div>
                    <div className={`absolute top-4 right-4 w-4.5 h-4.5 rounded-full bg-white
                      ${method === 'mpesa' ? 'border-[5px] border-blue-600' : 'border-2 border-slate-300'}`} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-7">
                <form onSubmit={handlePay}>
                  {method === 'stripe' ? (
                    <>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">Card Details</div>

                      <div className="mb-4.5">
                        <label className="block text-xs font-semibold text-slate-600 tracking-wide mb-2">Cardholder Name</label>
                        <input type="text" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} placeholder="John Doe" className={inputCls} required />
                      </div>

                      <div className="mb-4.5">
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
                          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
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
                      className="h-12 px-9 rounded-xl border-none bg-blue-600 text-white text-[15px] font-bold cursor-pointer shrink-0 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processing && <Loader className="w-4 h-4 animate-spin" />}
                      {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    </button>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      By clicking Pay, you agree to our{' '}
                      <a href="#" className="text-blue-600 underline">Terms of Service</a>{' '}and{' '}
                      <a href="#" className="text-blue-600 underline">Refund Policy</a>.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              {/* Route image header */}
              <div className="h-35 relative bg-linear-to-br from-amber-400 via-amber-500 to-amber-700 flex items-end p-4">
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
                  <span className="text-[10px] font-bold text-white bg-green-600 px-2.5 py-0.5 rounded uppercase tracking-wide">Pending Payment</span>
                  <h3 className="text-xl font-extrabold text-white mt-1.5 drop-shadow">
                    {booking?.route?.name || 'Transport Route'}
                  </h3>
                </div>
              </div>

              {/* Booking details */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2.5 mb-3.5">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Student</div>
                    <div className="text-sm font-semibold text-slate-800">
                      {booking?.student?.first_name} {booking?.student?.last_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 mb-3.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Schedule</div>
                    <div className="text-[13px] font-medium text-slate-800 leading-relaxed">
                      Starting {booking?.start_date}<br />
                      Pickup at {booking?.pickup_time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Route</div>
                    <div className="text-[13px] font-medium text-slate-800">
                      {booking?.route?.start_location || booking?.pickup_location} → {booking?.route?.end_location || booking?.dropoff_location}
                    </div>
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
                    <span className="font-semibold text-slate-800">${baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Early Booking Discount</span>
                    <span className="font-semibold text-green-600">-${Math.abs(discount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Service Fee ({(serviceFeeRate * 100).toFixed(1)}%)</span>
                    <span className="font-semibold text-slate-800">${serviceFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="h-px bg-slate-200 my-3.5" />

                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-800">Total Amount</span>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-blue-600">${total.toFixed(2)}</div>
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
        </>
      )}
    </div>
  );
}
