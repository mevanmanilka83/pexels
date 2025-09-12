import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('users.db');

// Create users table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// User model functions
export const User = {
  // Create a new user
  create: (email, password) => {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
      const result = stmt.run(email, hashedPassword);
      return { id: result.lastInsertRowid, email };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  },

  // Find user by email
  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Find user by ID
  findById: (id) => {
    const stmt = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Verify password
  verifyPassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  }
};

export default db;
