/**
 * JSON Schema для удаления стикера.
 *
 * Используется в `DeleteStickerDto` как `static schema`
 * и применяется `WsValidationPipe` для валидации входящих
 * WebSocket-событий.
 *
 * Требует единственное поле:
 * - id — UUID стикера, который нужно удалить
 */
export const deleteStickerSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;