/**
 * JSON Schema для подключения к доске.
 *
 * Используется в `JoinBoardDto` как `static schema`,
 * валидируется через `WsValidationPipe`.
 *
 * Требует одно обязательное поле:
 * - boardId — идентификатор доски (целое число)
 */
export const joinBoardSchema = {
  type: 'object',
  required: ['boardId'],
  additionalProperties: false,
  properties: {
    boardId: { type: 'integer' },
  },
} as const;
