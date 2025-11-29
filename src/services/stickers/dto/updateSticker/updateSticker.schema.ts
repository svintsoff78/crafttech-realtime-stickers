/**
 * JSON Schema для частичного обновления стикера.
 *
 * Используется в `UpdateStickerDto` как `static schema`
 * и применяется `WsValidationPipe` для валидации данных
 * входящих WebSocket-событий.
 *
 * Обязательное поле:
 * - id — UUID стикера
 *
 * Необязательные поля (любые могут отсутствовать):
 * - x, y     — новые координаты
 * - text     — новый текст (минимум 1 символ)
 * - color    — цвет
 * - zIndex   — порядок отображения
 */
export const updateStickerSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', format: 'uuid' },
    x: { type: 'integer' },
    y: { type: 'integer' },
    text: { type: 'string', minLength: 1 },
    color: { type: 'integer' },
    zIndex: { type: 'integer' },
  },
} as const;