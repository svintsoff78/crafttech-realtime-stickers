import { joinBoardSchema } from './joinBoard.schema';

/**
 * DTO для подключения клиента к комнате-доске.
 * Валидируется через JSON Schema `joinBoardSchema`
 * в `WsValidationPipe`.
 *
 * Поле:
 * - boardId — идентификатор доски, в комнату которой нужно войти
 */
export class JoinBoardDto {
  static schema = joinBoardSchema;

  boardId: number;
}
