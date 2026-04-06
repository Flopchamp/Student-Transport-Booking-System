const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Route = require('./Route');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Booking = require('./Booking');
const Payment = require('./Payment');

// =============================================
// ASSOCIATIONS
// =============================================

// User (Parent) <-> Students
User.hasMany(Student, { foreignKey: 'parent_id', as: 'students', onDelete: 'RESTRICT' });
Student.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

// Vehicle <-> Driver (one-to-one)
Vehicle.hasOne(Driver, { foreignKey: 'vehicle_id', as: 'driver', onDelete: 'SET NULL' });
Driver.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// User (Parent) <-> Bookings
User.hasMany(Booking, { foreignKey: 'parent_id', as: 'bookings', onDelete: 'RESTRICT' });
Booking.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

// Student <-> Bookings
Student.hasMany(Booking, { foreignKey: 'student_id', as: 'bookings', onDelete: 'RESTRICT' });
Booking.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Route <-> Bookings
Route.hasMany(Booking, { foreignKey: 'route_id', as: 'bookings', onDelete: 'RESTRICT' });
Booking.belongsTo(Route, { foreignKey: 'route_id', as: 'route' });

// Vehicle <-> Bookings
Vehicle.hasMany(Booking, { foreignKey: 'vehicle_id', as: 'bookings', onDelete: 'SET NULL' });
Booking.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Driver <-> Bookings
Driver.hasMany(Booking, { foreignKey: 'driver_id', as: 'bookings', onDelete: 'SET NULL' });
Booking.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

// Booking <-> Payments
Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments', onDelete: 'RESTRICT' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User (Parent) <-> Payments
User.hasMany(Payment, { foreignKey: 'parent_id', as: 'payments', onDelete: 'RESTRICT' });
Payment.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

module.exports = {
  sequelize,
  User,
  Student,
  Route,
  Vehicle,
  Driver,
  Booking,
  Payment,
};
