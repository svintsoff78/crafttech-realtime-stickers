import { deleteStickerSchema } from './deleteSticker.schema';

/**
 * DTO для удаления стикера по его идентификатору.
 * Валидируется через JSON Schema `deleteStickerSchema`
 * внутри WebSocket-пайпа `WsValidationPipe`.
 *
 * Поле:
 * - id — UUID стикера
 */
export class DeleteStickerDto {
  static schema = deleteStickerSchema;

  id: string;
}