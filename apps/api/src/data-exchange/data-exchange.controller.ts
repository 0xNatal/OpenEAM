import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { dataBundleSchema } from './data-bundle.schema';
import { DataExchangeService } from './data-exchange.service';

// Namespaced under /api to avoid colliding with the web SPA's /data-exchange route.
@Controller('api/data-exchange')
export class DataExchangeController {
  constructor(private readonly service: DataExchangeService) {}

  @Get('export')
  export() {
    return this.service.export();
  }

  @Post('import')
  async import(@Body() body: unknown) {
    const result = dataBundleSchema.safeParse(body);
    if (!result.success) {
      throw new HttpException(
        { message: 'Invalid data bundle', issues: result.error.issues },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.service.import(result.data);
    return { ok: true };
  }
}
