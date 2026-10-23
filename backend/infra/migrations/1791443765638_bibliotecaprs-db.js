import { PgLiteral } from 'node-pg-migrate';

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = {
    id: { type: 'uuid', primaryKey: true, default: PgLiteral.create('gen_random_uuid()') }, };

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('users', {
        id: 'id',
        name: { type: 'varchar(1000)', notNull: true },
        email: { type: 'varchar(256)', notNull: true, unique: true },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
        password_hash: { type: 'varchar(72)', notNull: true },
        course: { type: 'varchar(256)' },
        role: { type: 'varchar(20)', notNull: true, check: "(role IN('reader', 'technician'))", default: "reader" },
        active: { type: 'boolean', notNull: true, default: true },
        updateAt: { type: 'timestampTz' },
    })

    pgm.createTable('books', {
        id: 'id', title: { type: 'text', notNull: true },
        author: { type: 'text', notNull: true },
        edition: { type: 'text' },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
        updateAt: { type: 'timestampTz' },
    })

    pgm.createTable('exemplars', {
        id: 'id',
        books_id: { type: 'uuid', notNull: true, references: 'books(id)' },
        volume: { type: 'text' },
        print_run: { type: 'text' },
        print_year: { type: 'integer' },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
        updateAt: { type: 'timestampTz' },
    })

    pgm.createTable('loans', {
        id: 'id',
        reader_id: { type: 'uuid', notNull: true },
        exemplar_id: { type: 'uuid', notNull: true, references: 'exemplars(id)' },
        due_at: { type: 'timestampTz' },
        renewal_count: { type: 'integer', notNull: true, check: 'renewal_count >=0', default: 0 },
        status: { type: 'text', notNull: true, check: "(status In('active', 'returned', 'lost', 'damaged'))" },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
    })

    pgm.createTable('fines', {
        id: 'id',
        loan_id: { type: 'uuid', unique: true, notNull: true, references: 'loans(id)' },
        reader_id: { type: 'uuid', notNull: true, references: 'users(id)' },
        amount: { type: 'numeric(13,2)', notNull: true, check: 'amount >= 0' },
        lates_days: { type: 'int', notNull: true, check: 'lates_days >= 0' },
        status: { type: 'text', notNull: true, check: "status IN ('pending', 'paid', 'cancelled')", default: 'pending' },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
        paidAt: { type: 'timestampTz' },
    })

    pgm.createTable('reservations', {
        id: 'id',
        reader_id: { type: 'uuid', notNull: true, },
        exemplar_id: { type: 'uuid', notNull: true, references: 'exemplars(id)' },
        status: { type: 'text', notNull: true, check: "status IN ('active', 'ready', 'cancelled', 'expired', 'completed')" },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
        cancelledAt: { type: 'timestampTz' },
        ready_at: { type: 'timestampTz' },
        expiresAt: { type: 'timestampTz' },
    })

    pgm.createTable('charges', {
        id: 'id',
        fine_id: { type: 'uuid', notNull: true, unique: true, references: 'fines(id)' },
        session_id: { type: 'uuid', notNull: true, unique: true },
        checkout_url: { type: 'text', notNull: true },
        status: { type: 'text', notNull: true, check: "status IN ('pending', 'paid')", default: 'pending' },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
    })

    pgm.createTable('notifications', {
        id: 'id',
        type: { type: 'text', notNull: true },
        entity_id: { type: 'uuid', notNull: true },
        reader_id: { type: 'uuid', notNull: true },
        channel: { type: 'text', notNull: true },
        status: { type: 'text', notNull: true, check: "status IN ('delivered', 'failed')", default: 'delivered' },
        attempts: { type: 'int', notNull: true, default: 1, check: 'attempts >= 1' },
        playload: { type: 'jsonb' },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
        deliveredAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') }
    })
    pgm.addConstraint('notifications', 'notifications_type_entity_id_unique', { unique: ['type', 'entity_id'] });

    pgm.createTable('audit_events', {
        id: 'id',
        operation: { type: 'text', notNull: true },
        actor_id: { type: 'uuid' },
        actor_role: { type: 'text' },
        entity_type: { type: 'text', notNull: true },
        entity_id: { type: 'text', notNull: true },
        result: { type: 'text', notNull: true, check: "result IN('success','denied', 'error')" },
        correlation_id: { type: 'text' },
        details: { type: 'JSONB' },
        occured_at: { type: 'timestampTz', notNull: true, default: pgm.func('now()') }
    })

    pgm.createTable('book_covers', {
        id: 'id',
        book_id: { type: 'uuid', notNull: true, references: "books(id)", onDelete: 'CASCADE' },
        purpose: { type: 'text', notNull: true },
        object_key: { type: 'text', notNull: true },
        url: { type: 'text', notNull: true },
        content_type: { type: 'text', notNull: true },
        size_bytes: { type: 'int', notNull: true },
        width_px: { type: 'int', notNull: true },
        height_px: { type: 'int', notNull: true },
        checksum: { type: 'text', notNull: true },
        createdAt: { type: 'timestampTz', notNull: true, default: pgm.func('now()') },
    });
    pgm.addConstraint('book_covers', 'book_covers_book_id_purpose_unique', { unique: ['book_id', 'purpose'] });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = false;