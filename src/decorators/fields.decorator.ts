/* eslint-disable @typescript-eslint/ban-types */
import { applyDecorators } from '@nestjs/common';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { supportedLanguageCount } from '../common/constants';
import { ApiEnumProperty, ApiUUIDProperty } from './property.decorator';
import {
  PhoneNumberSerializer,
  ToArray,
  ToBoolean,
  ToLowerCase,
  ToUpperCase,
  Trim,
} from './transform.decorator';
import { IsPassword, IsPhoneNumber } from './validator.decorator';

interface IStringFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  swagger?: boolean;
}

interface INumberFieldOptions {
  each?: boolean;
  minimum?: number;
  maximum?: number;
  int?: boolean;
  isPositive?: boolean;
  swagger?: boolean;
}

export function NumberField(
  options: ApiPropertyOptions & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [Type(() => Number)];

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { each, int, minimum, maximum, isPositive, swagger } = options;

  if (swagger !== false) {
    decorators.push(ApiProperty({ type: 'number', ...options, example: int ? 1 : 1.2 }));
  }

  if (each) {
    decorators.push(ToArray());
  }

  if (int) {
    decorators.push(IsInt({ each }));
  } else {
    decorators.push(IsNumber({}, { each }));
  }

  if (typeof minimum === 'number') {
    decorators.push(Min(minimum, { each }));
  }

  if (typeof maximum === 'number') {
    decorators.push(Max(maximum, { each }));
  }

  if (isPositive) {
    decorators.push(IsPositive({ each }));
  }

  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    Partial<{
      each: boolean;
      int: boolean;
      isPositive: boolean;
    }> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), NumberField({ ...options }));
}

export function StringField(
  options: ApiPropertyOptions & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsNotEmpty(), IsString(), Trim()];

  if (options?.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  if (options?.minLength) {
    decorators.push(MinLength(options.minLength));
  }

  if (options?.maxLength) {
    decorators.push(MaxLength(options.maxLength));
  }

  if (options?.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options?.toUpperCase) {
    decorators.push(ToUpperCase());
  }

  return applyDecorators(...decorators);
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), StringField({ required: false, ...options }));
}

export function PasswordField(
  options: ApiPropertyOptions & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    StringField({ format: '^[\\d!#$%&*@A-Z^a-z]*$', ...options }),
    IsPassword(),
  );
}

export function PasswordFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'minLength'> & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), PasswordField({ required: false, ...options }));
}

export function BooleanField(
  options: ApiPropertyOptions & Partial<{ swagger: boolean }> = {},
): PropertyDecorator {
  const decorators = [IsBoolean(), ToBoolean()];

  if (options?.swagger !== false) {
    decorators.push(ApiProperty({ type: Boolean, ...options }));
  }

  return applyDecorators(...decorators);
}

export function BooleanFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & Partial<{ swagger: boolean }> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), BooleanField({ required: false, ...options }));
}

export function TranslationsField(
  options: ApiPropertyOptions & Partial<{ swagger: boolean }>,
): PropertyDecorator {
  const decorators = [
    ArrayMinSize(supportedLanguageCount),
    ArrayMaxSize(supportedLanguageCount),
    ValidateNested({
      each: true,
    }),
    Type(() => options.type as FunctionConstructor),
  ];

  if (options?.swagger !== false) {
    decorators.push(ApiProperty({ isArray: true, ...options }));
  }

  return applyDecorators(...decorators);
}

export function TranslationsFieldOptional(
  options: ApiPropertyOptions & Partial<{ swagger: boolean }>,
): PropertyDecorator {
  return applyDecorators(IsOptional(), TranslationsField({ ...options }));
}

export function EnumField<TEnum>(
  getEnum: () => TEnum,
  options: ApiPropertyOptions &
    Partial<{
      each: boolean;
      swagger: boolean;
    }> = {},
): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enumValue = getEnum() as any;
  const decorators = [IsEnum(enumValue as object, { each: options.each })];

  if (options?.swagger !== false) {
    decorators.push(ApiEnumProperty(getEnum, options));
  }

  if (options.each) {
    decorators.push(ToArray());
  }

  return applyDecorators(...decorators);
}

export function EnumFieldOptional<TEnum>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required' | 'enum' | 'enumName'> &
    Partial<{ each: boolean; swagger: boolean }> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), EnumField(getEnum, { required: false, ...options }));
}

export function EmailField(
  options: ApiPropertyOptions & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsEmail(), StringField({ toLowerCase: true, ...options })];

  if (options?.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  return applyDecorators(...decorators);
}

export function EmailFieldOptional(
  options: ApiPropertyOptions & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), EmailField({ ...options }));
}

export function PhoneField(
  options: ApiPropertyOptions & Partial<{ swagger: boolean }> = {},
): PropertyDecorator {
  const decorators = [IsPhoneNumber(), PhoneNumberSerializer()];

  if (options?.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  return applyDecorators(...decorators);
}

export function PhoneFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & Partial<{ swagger: boolean }> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), PhoneField({ required: false, ...options }));
}

export function UUIDField(options: ApiPropertyOptions): PropertyDecorator {
  const decorators = [IsUUID('4', { each: options?.isArray })];

  decorators.push(ApiUUIDProperty(options));

  if (options?.isArray) {
    decorators.push(ArrayNotEmpty(), ToArray());
  }

  return applyDecorators(...decorators);
}

export function UUIDFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    Partial<{ each: boolean; swagger: boolean }> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), UUIDField({ required: false, ...options }));
}

export function URLField(
  options: ApiPropertyOptions & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(StringField(options), IsUrl());
}

export function URLFieldOptional(
  options: ApiPropertyOptions & IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), URLField({ ...options }));
}

export function DateField(options: ApiPropertyOptions): PropertyDecorator {
  const decorators = [Type(() => Date), IsDate()];
  decorators.push(ApiProperty(options));
  return applyDecorators(...decorators);
}

export function DateFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & Partial<{ swagger: false }> = {},
): PropertyDecorator {
  return applyDecorators(IsOptional(), DateField({ ...options, required: false }));
}
