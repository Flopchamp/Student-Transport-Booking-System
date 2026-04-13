import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import {
  Navigation,
  MapPin,
  Loader2,
  Play,
  Square,
  Gauge,
  Compass,
} from 'lucide-react';

export default function DriverTracking() {
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number; speed: number; heading: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updating, setUpdating] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendLocation = async (lat: number, lng: number, speed: number, heading: number) => {
    setUpdating(true);
    try {
      await api.put('/driver-portal/location', {
        latitude: lat,
        longitude: lng,
        speed: Math.round(speed * 3.6), // m/s -> km/h
        heading: Math.round(heading),
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to send location:', err);
    } finally {
      setUpdating(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setTracking(true);

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        setPosition({
          lat: latitude,
          lng: longitude,
          speed: (speed ?? 0) * 3.6, // m/s -> km/h
          heading: heading ?? 0,
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error('Failed to get location. Enable GPS access.');
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    // Also send location updates every 15 seconds
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, speed, heading } = pos.coords;
          sendLocation(latitude, longitude, speed ?? 0, heading ?? 0);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }, 15000);

    // Send first location immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        sendLocation(latitude, longitude, speed ?? 0, heading ?? 0);
        setPosition({
          lat: latitude,
          lng: longitude,
          speed: (speed ?? 0) * 3.6,
          heading: heading ?? 0,
        });
      },
      () => toast.error('Could not get initial position'),
      { enableHighAccuracy: true }
    );

    toast.success('GPS tracking started');
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTracking(false);
    toast.success('GPS tracking stopped');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">GPS Tracking</h1>
        <p className="text-sm text-slate-500 mt-0.5">Share your live location with the system</p>
      </div>

      {/* Control Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              tracking ? 'bg-emerald-100' : 'bg-slate-100'
            }`}>
              <Navigation className={`w-6 h-6 ${tracking ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <div>
              <div className="text-base font-bold text-slate-800">
                {tracking ? 'Tracking Active' : 'Tracking Paused'}
              </div>
              <div className="text-xs text-slate-500">
                {tracking ? 'Your location is being shared every 15 seconds' : 'Start tracking to share your location'}
              </div>
            </div>
          </div>
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold border-none cursor-pointer transition-colors ${
              tracking
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {tracking ? (
              <>
                <Square className="w-4 h-4" />
                Stop Tracking
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Tracking
              </>
            )}
          </button>
        </div>

        {/* Position Data */}
        {position && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Latitude
              </div>
              <div className="text-sm font-bold text-slate-800">{position.lat.toFixed(6)}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Longitude
              </div>
              <div className="text-sm font-bold text-slate-800">{position.lng.toFixed(6)}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Gauge className="w-3.5 h-3.5" />
                Speed
              </div>
              <div className="text-sm font-bold text-slate-800">{position.speed.toFixed(0)} km/h</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Compass className="w-3.5 h-3.5" />
                Heading
              </div>
              <div className="text-sm font-bold text-slate-800">{position.heading.toFixed(0)}°</div>
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          {updating && (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sending...
            </span>
          )}
          {lastUpdate && (
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          )}
          {tracking && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">Your Location</h3>
        </div>
        <div className="h-72 bg-slate-100 relative flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 600 288" fill="none" className="absolute inset-0">
            <rect width="600" height="288" fill="#f1f5f9" />
            <line x1="0" y1="144" x2="600" y2="144" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="300" y1="0" x2="300" y2="288" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1="144" x2="600" y2="144" stroke="#cbd5e1" strokeWidth="4" />
            <line x1="300" y1="0" x2="300" y2="288" stroke="#cbd5e1" strokeWidth="4" />
          </svg>
          {position ? (
            <div className="absolute flex flex-col items-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                <Navigation className="w-6 h-6 text-white" style={{ transform: `rotate(${position.heading}deg)` }} />
              </div>
              <div className="mt-2 bg-white px-2 py-1 rounded shadow text-[10px] font-bold text-slate-600">
                You are here
              </div>
            </div>
          ) : (
            <div className="text-center z-10">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Start tracking to see your position</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
