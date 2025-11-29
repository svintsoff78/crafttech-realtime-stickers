/**
 * JSON Schema для создания стикера.
 *
 * Используется в `CreateStickerDto` как `static schema`
 * и применяется `WsValidationPipe` для валидации входящих
 * WebSocket-событий.
 *
 * Требует обязательных полей:
 * - boardId  — номер доски
 * - authorId — идентификатор автора
 * - x, y     — координаты стикера
 * - text     — текстовое содержимое (минимум 1 символ)
 *
 * Дополнительные поля:
 * - color    — числовой код цвета
 * - zIndex   — порядок отрисовки
 */
export const createStickerSchema = {
  type: 'object',
  required: ['boardId', 'authorId', 'x', 'y', 'text'],
  additionalProperties: false,
  properties: {
    boardId: { type: 'integer' },
    authorId: { type: 'integer' },
    x: { type: 'integer' },
    y: { type: 'integer' },
    text: { type: 'string', minLength: 1 },
    color: { type: 'integer' },
    zIndex: { type: 'integer' },
  },
} as const;