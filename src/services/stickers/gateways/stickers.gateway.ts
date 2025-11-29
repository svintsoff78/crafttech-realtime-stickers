import { UsePipes } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';

import { JoinBoardDto } from '../dto/joinBoard/joinBoard.dto';
import { CreateStickerDto } from '../dto/createSticker/createSticker.dto';
import { UpdateStickerDto } from '../dto/updateSticker/updateSticker.dto';
import { DeleteStickerDto } from '../dto/deleteSticker/deleteSticker.dto';
import { WsValidationPipe } from '../../../core/adapters/wsValidation.adapter';
import { StickersService } from '../services/stickers.service';

/**
 * WebSocket-gateway для работы со стикерами интерактивной доски.
 * Клиенты подключаются к namespace `board`, входят в комнату вида
 * `board:{boardId}` и получают обновления в реальном времени.
 *
 * Gateway:
 * - валидирует входящие события через `WsValidationPipe`;
 * - отдаёт состояние доски при подключении;
 * - создаёт, обновляет и удаляет стикеры;
 * - рассылает обновления всем участникам комнаты;
 * - проверяет, что клиент работает только со своей доской.
 *
 * Используемые события:
 * - join_board
 * - create_sticker
 * - update_sticker
 * - delete_sticker
 *
 * Исходящие события:
 * - board_state
 * - sticker_created
 * - sticker_updated
 * - sticker_deleted
 */
@UsePipes(WsValidationPipe)
@WebSocketGateway({
  namespace: 'board',
  cors: {
    origin: '*',
  },
})
export class StickersGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly stickersService: StickersService) {}

  /**
   * Формирует имя комнаты для указанной доски.
   *
   * @param boardId ID доски
   * @returns строка формата `board:{boardId}`
   *
   * @example
   * this.getRoom(5) // "board:5"
   */
  private getRoom(boardId: number) {
    return `board:${boardId}`;
  }

  /**
   * Проверяет, что клиент состоит в комнате нужной доски.
   *
   * Если клиент пытается изменить данные доски,
   * не войдя в неё — выбрасывается WsException.
   *
   * @param client WebSocket-клиент
   * @param boardId ID доски
   *
   * @throws WsException если клиент не в комнате
   */
  private ensureInBoard(client: Socket, boardId: number) {
    const room = this.getRoom(boardId);

    if (!client.rooms.has(room)) {
      throw new WsException({
        message: 'Forbidden',
        code: 'NOT_IN_BOARD',
        boardId,
      });
    }
  }

  /**
   * Подключение к доске.
   *
   * Событие: `join_board`
   *
   * Клиент присоединяется к комнате `board:{boardId}`
   * и получает полное текущее состояние всех стикеров.
   *
   * @example запрос:
   * ```json
   * {
   *   "event": "join_board",
   *   "data": { "boardId": 3 }
   * }
   * ```
   *
   * @example ответ:
   * ```json
   * {
   *   "event": "board_state",
   *   "data": { "boardId": 3, "stickers": [...] }
   * }
   * ```
   */
  @SubscribeMessage('join_board')
  async handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: JoinBoardDto,
  ) {
    const room = this.getRoom(dto.boardId);

    await client.join(room);

    const stickers = await this.stickersService.getStickers(dto.boardId);

    client.emit('board_state', {
      boardId: dto.boardId,
      stickers,
    });
  }

  /**
   * Создание нового стикера.
   *
   * Событие: `create_sticker`
   *
   * Клиент должен быть подключён к доске к которой создаёт стикер.
   * После создания сервер рассылает обновление всем участникам комнаты.
   *
   * @example клиент:
   * ```json
   * {
   *   "event": "create_sticker",
   *   "data": {
   *     "boardId": 3,
   *     "authorId": 12,
   *     "x": 100,
   *     "y": 200,
   *     "text": "Hello"
   *   }
   * }
   * ```
   *
   * @example сервер:
   * ```json
   * {
   *   "event": "sticker_created",
   *   "data": { "boardId": 3, "sticker": {...} }
   * }
   * ```
   */
  @SubscribeMessage('create_sticker')
  async handleCreateSticker(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateStickerDto,
  ) {
    this.ensureInBoard(client, dto.boardId);

    const sticker = await this.stickersService.createSticker(dto);
    const room = this.getRoom(dto.boardId);

    this.server.to(room).emit('sticker_created', {
      boardId: dto.boardId,
      sticker,
    });

    return { ok: true, sticker };
  }

  /**
   * Обновление стикера.
   *
   * Событие: `update_sticker`
   *
   * Сервер:
   * - проверяет, что стикер существует
   * - проверяет, что клиент находится в нужной комнате
   * - обновляет запись
   * - уведомляет всех участников комнаты
   *
   * @example клиент:
   * ```json
   * {
   *   "event": "update_sticker",
   *   "data": {
   *     "id": "uuid",
   *     "x": 300,
   *     "y": 100
   *   }
   * }
   * ```
   *
   * @example сервер:
   * ```json
   * {
   *   "event": "sticker_updated",
   *   "data": { "boardId": 3, "sticker": {...} }
   * }
   * ```
   */
  @SubscribeMessage('update_sticker')
  async handleUpdateSticker(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: UpdateStickerDto,
  ) {
    const existing = await this.stickersService.getStickerById(dto.id);
    if (!existing) {
      throw new WsException({
        message: 'Sticker not found',
        code: 'NOT_FOUND',
      });
    }

    this.ensureInBoard(client, existing.boardId);

    const sticker = await this.stickersService.updateSticker(dto);
    const room = this.getRoom(sticker.boardId);

    this.server.to(room).emit('sticker_updated', {
      boardId: sticker.boardId,
      sticker,
    });

    return { ok: true, sticker };
  }

  /**
   * Удаление стикера.
   *
   * Событие: `delete_sticker`
   *
   * Сервер:
   * - проверяет существование
   * - проверяет принадлежность доске
   * - удаляет
   * - рассылает обновление
   *
   * @example клиент:
   * ```json
   * {
   *   "event": "delete_sticker",
   *   "data": { "id": "uuid" }
   * }
   * ```
   *
   * @example сервер:
   * ```json
   * {
   *   "event": "sticker_deleted",
   *   "data": { "boardId": 3, "id": "uuid" }
   * }
   * ```
   */
  @SubscribeMessage('delete_sticker')
  async handleDeleteSticker(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: DeleteStickerDto,
  ) {
    const existing = await this.stickersService.getStickerById(dto.id);

    if (!existing) {
      throw new WsException({
        message: 'Sticker not found',
        code: 'NOT_FOUND',
      });
    }

    this.ensureInBoard(client, existing.boardId);

    await this.stickersService.deleteSticker(dto.id);

    const room = this.getRoom(existing.boardId);

    this.server.to(room).emit('sticker_deleted', {
      boardId: existing.boardId,
      id: dto.id,
    });

    return { ok: true };
  }
}
