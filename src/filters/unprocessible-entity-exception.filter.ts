import { ArgumentsHost, ExceptionFilter, UnprocessableEntityException } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import type { Response } from 'express';

@Catch(UnprocessableEntityException)
export class UnprocessableEntityExceptionFilter
  implements ExceptionFilter<UnprocessableEntityException>
{
  async catch(exception: UnprocessableEntityException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const message = exception.getResponse() as { message; statusCode };

    response.status(statusCode).json({ message: message.message, success: false });
  }
}
