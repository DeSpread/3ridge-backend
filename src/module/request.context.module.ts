import { Module } from '@nestjs/common';
import { RequestContextProvider } from '../common/request.context';

@Module({
  imports: [],
  providers: [RequestContextProvider],
  exports: [RequestContextProvider],
})
export class RequestContextModule {}
