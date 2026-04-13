const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Route = require('./Route');
const Vehicle = require('./Vehicle');
const Driver = require('./Driver');
const Booking = require('./Booking');
const Payment = require('./Payment');
const AuditLog = require('./AuditLog');
const Complaint = require('./Complaint');
const Setting = require('./Setting');
const Announcement = require('./Announcement');
const VehicleLocation = require('./VehicleLocation');
const Notification = require('./Notification');
const Trip = require('./Trip');

// =============================================
// ASSOCIATIONS
// =============================================

// User (Parent) <-> Students
User.hasMany(Student, { foreignKey: 'parent_id', as: 'students', onDelete: 'RESTRICT' });
Student.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

// Vehicle <-> Driver (one-to-one)
Vehicle.hasOne(Driver, { foreignKey: 'vehicle_id', as: 'driver', onDelete: 'SET NULL' });
Driver.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// Route <-> Driver (one route can have many drivers)
Route.hasMany(Driver, { foreignKey: 'route_id', as: 'drivers', onDelete: 'SET NULL' });
Driver.belongsTo(Route, { foreignKey: 'route_id', as: 'route' });

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

// Booking <-> Recurring Child Bookings (self-reference)
Booking.hasMany(Booking, { foreignKey: 'parent_booking_id', as: 'childBookings', onDelete: 'SET NULL' });
Booking.belongsTo(Booking, { foreignKey: 'parent_booking_id', as: 'parentBooking' });

// Booking <-> Payments
Booking.hasMany(Payment, { foreignKey: 'booking_id', as: 'payments', onDelete: 'RESTRICT' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User (Parent) <-> Payments
User.hasMany(Payment, { foreignKey: 'parent_id', as: 'payments', onDelete: 'RESTRICT' });
Payment.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

// User <-> AuditLogs
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs', onDelete: 'CASCADE' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User (Parent) <-> Complaints
User.hasMany(Complaint, { foreignKey: 'parent_id', as: 'complaints', onDelete: 'CASCADE' });
Complaint.belongsTo(User, { foreignKey: 'parent_id', as: 'parent' });

// Booking <-> Complaints
Booking.hasMany(Complaint, { foreignKey: 'booking_id', as: 'complaints', onDelete: 'SET NULL' });
Complaint.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// User (Admin) <-> Announcements
User.hasMany(Announcement, { foreignKey: 'author_id', as: 'announcements', onDelete: 'CASCADE' });
Announcement.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Vehicle <-> VehicleLocation (one-to-one: latest location per vehicle)
Vehicle.hasOne(VehicleLocation, { foreignKey: 'vehicle_id', as: 'location', onDelete: 'CASCADE' });
VehicleLocation.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

// User <-> Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User (Driver role) <-> Driver record
User.hasOne(Driver, { foreignKey: 'user_id', as: 'driverProfile', onDelete: 'SET NULL' });
Driver.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Trip associations
Driver.hasMany(Trip, { foreignKey: 'driver_id', as: 'trips', onDelete: 'RESTRICT' });
Trip.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

Vehicle.hasMany(Trip, { foreignKey: 'vehicle_id', as: 'trips', onDelete: 'RESTRICT' });
Trip.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

Route.hasMany(Trip, { foreignKey: 'route_id', as: 'trips', onDelete: 'RESTRICT' });
Trip.belongsTo(Route, { foreignKey: 'route_id', as: 'route' });

module.exports = {
  sequelize,
  User,
  Student,
  Route,
  Vehicle,
  Driver,
  Booking,
  Payment,
  AuditLog,
  Complaint,
  Setting,
  Announcement,
  VehicleLocation,
  Notification,
  Trip,
};
