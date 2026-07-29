import { IsInt, Matches, Min } from 'class-validator';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class CreateRentalDto {
  @IsInt()
  @Min(1)
  bookId!: number;

  @Matches(DATE_ONLY_PATTERN, {
    message: 'dateStart должна быть указана в формате YYYY-MM-DD',
  })
  dateStart!: string;

  @Matches(DATE_ONLY_PATTERN, {
    message: 'dateEnd должна быть указана в формате YYYY-MM-DD',
  })
  dateEnd!: string;
}
