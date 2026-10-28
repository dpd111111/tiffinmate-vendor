/**
 * =========================================================================
 * SERVER MODULAR ARCHITECTURE INDEX
 * =========================================================================
 * Organizes backend logic into safe, isolated modules:
 * - /server/auth: Core authentication & role resolution
 * - /server/database: Authoritative persistent JSON & Firestore adapters
 * - /server/routes: Customer, Owner, and Management API controllers
 */

export * from './auth/core_auth';
export * from './database/core_database';
export * from './routes/customer_routes';
export * from './routes/owner_routes';
export * from './routes/management_routes';
