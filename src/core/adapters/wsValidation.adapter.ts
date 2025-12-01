import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * WsValidationPipe
 *
 * Пайп для валидации WebSocket-событий через JSON Schema (AJV).
 * Работает с DTO-классами, у которых есть `static schema`.
 *
 * При ошибке выбрасывает `WsException` с массивом ошибок AJV.
 *
 * @example DTO со схемой:
 * ```ts
 * export class CreateStickerDto {
 *   static schema = {
 *     type: 'object',
 *     required: ['boardId', 'text'],
 *     additionalProperties: false,
 *     properties: {
 *       boardId: { type: 'integer' },
 *       text: { type: 'string' }
 *     }
 *   };
 *
 *   boardId: number;
 *   text: string;
 * }
 * ```
 *
 * @example Использование в gateway:
 * ```ts
 * @UsePipes(WsValidationPipe)
 * @SubscribeMessage('create_sticker')
 * handleCreate(@MessageBody() dto: CreateStickerDto) {
 *   ...
 * }
 * ```
 */
@Injectable()
export class WsValidationPipe implements PipeTransform {
  private readonly ajv: Ajv;
  private readonly validators = new Map<any, ValidateFunction>();

  constructor() {
    const ajv = new Ajv({
      strict: false,
      allErrors: true,
      coerceTypes: true,
    });

    addFormats(ajv);
    this.ajv = ajv;
  }

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') value = JSON.parse(value)

    const metatype = metadata.metatype as any;

    if (!metatype || typeof metatype !== 'function' || !metatype.schema) {
      return value;
    }

    let validate = this.validators.get(metatype);
    if (!validate) {
      validate = this.ajv.compile(metatype.schema);
      this.validators.set(metatype, validate);
    }

    const ok = validate(value);

    if (!ok) {
      throw new WsException({
        message: 'Validation failed',
        errors: validate.errors,
      });
    }

    return value;
  }
}
