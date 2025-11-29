// board-stickers/stickers.schema.ts
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

/**
 * Таблица стикеров для интерактивной доски.
 *
 * Один стикер привязан к доске (`boardId`) и имеет:
 * - позицию (x, y)
 * - текстовое содержимое
 * - цвет и порядок отображения (zIndex)
 * - автора (authorId)
 *
 * Также есть индексы по:
 * - boardId — быстрые выборки всех стикеров на доске
 * - authorId — выборки по автору (опционально для статистики/фильтрации)
 */
export const stickers = pgTable(
  'stickers',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    boardId: integer('board_id').notNull(),

    authorId: integer('author_id').notNull(),

    x: integer('x').notNull().default(0),
    y: integer('y').notNull().default(0),

    text: text('text').notNull().default(''),

    color: integer('color').notNull().default(0),
    zIndex: integer('z_index').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    boardIdIdx: index('stickers_board_id_idx').on(table.boardId),
    authorIdIdx: index('stickers_author_id_idx').on(table.authorId),
  }),
);
