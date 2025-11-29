import { createStickerSchema } from './createSticker.schema';

/**
 * DTO для создания стикера на доске.
 * Валидируется через JSON Schema (`createStickerSchema`)
 * в WebSocket-пайпе `WsValidationPipe`.
 *
 * Поля:
 * - boardId  — идентификатор доски
 * - authorId — автор стикера
 * - x, y     — координаты стикера
 * - text     — содержимое
 * - color    — произвольный числовой код цвета
 * - zIndex   — порядок отображения
 */
export class CreateStickerDto {
  static schema = createStickerSchema;

  boardId: number;
  authorId: number;
  x: number;
  y: number;
  text: string;
  color?: number;
  zIndex?: number;
}
