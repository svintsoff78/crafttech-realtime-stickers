import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { stickers } from '../../../db/schema/stickers.schema';
import type { Drizzle } from '../../../core/drizzle/drizzle.types';
import { CreateStickerDto } from '../dto/createSticker/createSticker.dto';
import { UpdateStickerDto } from '../dto/updateSticker/updateSticker.dto';

/**
 * Сервис для работы со стикерами доски.
 * Отвечает только за логику БД, без WebSocket-проверок и комнат.
 *
 * Возможности:
 * - получить все стикеры конкретной доски;
 * - создать новый стикер;
 * - частично обновить существующий стикер;
 * - получить стикер по id;
 * - удалить стикер.
 *
 * Сервис не проверяет, что клиент подключён к доске —
 * это делает WebSocket-gateway.
 */
@Injectable()
export class StickersService {
  constructor(
    @Inject('DRIZZLE')

    private readonly databaseService: Drizzle,
  ) {}

  /**
   * Получить все стикеры доски.
   *
   * @param boardId ID доски
   * @returns массив стикеров, отсортированных по zIndex и времени создания
   *
   * @example
   * const items = await stickersService.getStickers(3);
   */
  async getStickers(boardId: number) {
    return this.databaseService
      .select()
      .from(stickers)
      .where(eq(stickers.boardId, boardId))
      .orderBy(stickers.zIndex, stickers.createdAt);
  }

  /**
   * Создать новый стикер.
   *
   * @param dto CreateStickerDto
   * @returns созданный стикер
   *
   * @example
   * await stickersService.createSticker({
   *   boardId: 1,
   *   authorId: 42,
   *   x: 50, y: 100,
   *   text: 'Hello'
   * });
   */
  async createSticker(dto: CreateStickerDto) {
    const [created] = await this.databaseService
      .insert(stickers)
      .values({
        boardId: dto.boardId,
        authorId: dto.authorId,
        x: dto.x,
        y: dto.y,
        text: dto.text,
        color: dto.color ?? 0,
        zIndex: dto.zIndex ?? 0,
      })
      .returning();

    return created;
  }

  /**
   * Частично обновить существующий стикер.
   *
   * Обновляет только переданные поля,
   * если стикер существует.
   *
   * @param dto UpdateStickerDto
   * @throws NotFoundException если стикер не найден
   *
   * @example
   * await stickersService.updateSticker({
   *   id: 'uuid',
   *   x: 200,
   *   text: 'Updated'
   * });
   */
  async updateSticker(dto: UpdateStickerDto) {
    const [existing] = await this.databaseService
      .select()
      .from(stickers)
      .where(eq(stickers.id, dto.id));

    if (!existing) {
      throw new NotFoundException('Sticker not found');
    }

    const [updated] = await this.databaseService
      .update(stickers)
      .set({
        x: dto.x ?? existing.x,
        y: dto.y ?? existing.y,
        text: dto.text ?? existing.text,
        color: dto.color ?? existing.color,
        zIndex: dto.zIndex ?? existing.zIndex,
        updatedAt: new Date(),
      })
      .where(eq(stickers.id, dto.id))
      .returning();

    return updated;
  }

  /**
   * Получить один стикер по id.
   *
   * @param id UUID стикера
   * @returns стикер или null
   *
   * @example
   * const sticker = await stickersService.getStickerById('uuid');
   */
  async getStickerById(id: string) {
    const [sticker] = await this.databaseService
      .select()
      .from(stickers)
      .where(eq(stickers.id, id));

    return sticker ?? null;
  }

  /**
   * Удалить стикер.
   *
   * @param id UUID стикера
   * @returns id удалённого стикера
   *
   * @throws NotFoundException если стикер отсутствует
   *
   * @example
   * await stickersService.deleteSticker('uuid');
   */
  async deleteSticker(id: string) {
    const [deleted] = await this.databaseService
      .delete(stickers)
      .where(eq(stickers.id, id))
      .returning({ id: stickers.id });

    if (!deleted) {
      throw new NotFoundException('Sticker not found');
    }

    return deleted.id;
  }
}
