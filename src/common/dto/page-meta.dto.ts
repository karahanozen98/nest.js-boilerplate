import { ApiProperty } from '@nestjs/swagger';
import type { IPageMetaDto, IPageOptions } from 'interface';

interface IPageMetaDtoParameters {
  pageOptions: IPageOptions;
  itemCount: number;
}

export class PageMetaDto implements IPageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptions, itemCount }: IPageMetaDtoParameters) {
    this.page = pageOptions.page;
    this.take = pageOptions.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
