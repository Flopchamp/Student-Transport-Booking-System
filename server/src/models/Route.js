const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: { msg: 'Route name already exists' },
    validate: {
      notEmpty: { msg: 'Route name is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  start_location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Start location is required' },
    },
  },
  start_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  start_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  end_location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'End location is required' },
    },
  },
  end_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  end_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  stops: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of { name, address, lat, lng, order }',
  },
  distance_km: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  estimated_duration_min: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price cannot be negative' },
    },
  },
  // ── Pricing Tier Fields ──
  pricing_type: {
    type: DataTypes.ENUM('flat', 'per_km', 'zone'),
    defaultValue: 'flat',
    allowNull: false,
    comment: 'flat = single price, per_km = base + rate*distance, zone = zone-based pricing',
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Base fare for per_km pricing',
  },
  price_per_km: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Rate per km for per_km pricing',
  },
  zone_prices: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Array of { zone_name, price } for zone-based pricing',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'routes',
});

/**
 * Calculate the effective price based on pricing type.
 * For 'flat' → returns `price`.
 * For 'per_km' → returns `base_price + price_per_km * distance_km`.
 * For 'zone' → returns the zone price if a zone name is given, otherwise `price`.
 */
Route.prototype.calculatePrice = function (zoneName) {
  const type = this.pricing_type || 'flat';

  if (type === 'per_km') {
    const base = parseFloat(this.base_price) || 0;
    const ratePerKm = parseFloat(this.price_per_km) || 0;
    const distance = parseFloat(this.distance_km) || 0;
    return Math.round((base + ratePerKm * distance) * 100) / 100;
  }

  if (type === 'zone' && Array.isArray(this.zone_prices) && zoneName) {
    const zone = this.zone_prices.find(
      (z) => z.zone_name?.toLowerCase() === zoneName.toLowerCase()
    );
    if (zone) return parseFloat(zone.price) || parseFloat(this.price);
  }

  return parseFloat(this.price);
};

module.exports = Route;
