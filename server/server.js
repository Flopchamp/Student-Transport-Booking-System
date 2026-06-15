const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize, Setting } = require('./src/models');

const PORT = env.PORT;

/**
 * Start the server and verify the database connection.
 * Schema is managed by migrations — run `npm run db:migrate` before first boot.
 * On a fresh database: npm run db:migrate
 * To mark an existing database as migrated: npx sequelize-cli db:migrate:status
 * then manually insert migration names into the SequelizeMeta table.
 */
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Seed default settings (idempotent — uses findOrCreate)
    await Setting.seedDefaults();
    console.log('✅ Default settings seeded.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
