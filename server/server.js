const app = require('./src/app');
const env = require('./src/config/env');
const { sequelize } = require('./src/models');

const PORT = env.PORT;

/**
 * Drop accumulated duplicate indexes that `sync({ alter: true })` creates on
 * every restart.  MySQL caps at 64 keys per table.
 *
 * Root cause: Sequelize re-runs `ALTER TABLE … CHANGE col col … UNIQUE` and
 * each run adds a NEW unique index (`booking_reference_2`, `_3`, …).
 * This also cleans up orphaned FK indexes.
 */
const cleanDuplicateKeys = async () => {
  // Find tables with too many indexes
  const [bloated] = await sequelize.query(
    `SELECT TABLE_NAME, COUNT(DISTINCT INDEX_NAME) AS idx_count
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND INDEX_NAME != 'PRIMARY'
     GROUP BY TABLE_NAME
     HAVING idx_count > 10`,
  );

  for (const { TABLE_NAME } of bloated) {
    let dropped = 0;

    // Get all non-primary indexes
    const [indexes] = await sequelize.query(
      `SELECT DISTINCT INDEX_NAME, NON_UNIQUE, COLUMN_NAME
       FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = '${TABLE_NAME}'
         AND INDEX_NAME != 'PRIMARY'
       ORDER BY INDEX_NAME`,
    );

    // Group indexes by column — keep only the first per column, drop the rest
    const seenByCol = new Map();
    for (const idx of indexes) {
      const key = `${idx.COLUMN_NAME}:${idx.NON_UNIQUE}`;
      if (seenByCol.has(key)) {
        // This is a duplicate index on the same column — drop it
        try {
          await sequelize.query(`ALTER TABLE \`${TABLE_NAME}\` DROP INDEX \`${idx.INDEX_NAME}\``);
          dropped++;
        } catch { /* already gone */ }
      } else {
        seenByCol.set(key, idx.INDEX_NAME);
      }
    }

    if (dropped) {
      console.log(`🧹 Cleaned ${dropped} duplicate indexes from \`${TABLE_NAME}\``);
    }
  }
};

/**
 * Start the server and test database connection.
 */
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models with associations (in development only — use migrations in production)
    if (env.NODE_ENV === 'development') {
      // Clean up any duplicate foreign keys accumulated by previous sync runs
      await cleanDuplicateKeys();

      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }

    // Start Express server
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
