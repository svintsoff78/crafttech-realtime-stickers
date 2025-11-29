import { updateStickerSchema } from './updateSticker.schema';

/**
 * DTO для частичного обновления стикера.
 * Валидируется через JSON Schema `updateStickerSchema`
 * в `WsValidationPipe`.
 *
 * Поля:
 * - id      — UUID стикера (обязательное)
 * - x, y    — новые координаты (опционально)
 * - text    — новый текст (опционально)
 * - color   — новый цвет (опционально)
 * - zIndex  — порядок отображения (опционально)
 *
 * Любое из необязательных полей может отсутствовать —
 * сервер обновит только переданные значения.
 */
export class UpdateStickerDto {
  static schema = updateStickerSchema;

  id: string;
  x?: number;
  y?: number;
  text?: string;
  color?: number;
  zIndex?: number;
}
