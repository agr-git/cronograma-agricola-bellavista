require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/cronograma.db');

/**
 * Get database connection
 */
function getDb() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Database connection error:', err.message);
            throw err;
        }
    });
}

/**
 * Run a query that doesn't return results (INSERT, UPDATE, DELETE)
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
            db.close();
        });
    });
}

/**
 * Get a single row
 */
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
            db.close();
        });
    });
}

/**
 * Get multiple rows
 */
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
}

module.exports = {
    getDb,
    run,
    get,
    all
};
