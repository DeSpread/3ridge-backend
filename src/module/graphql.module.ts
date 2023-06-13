import { Module } from '@nestjs/common';
import {
  FieldMiddleware,
  GraphQLModule,
  MiddlewareContext,
  NextFn,
} from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

const loggerMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  console.log(value);
  return value;
};

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: './schema.gql',
      sortSchema: true,
      debug: true,
      playground: true,
      buildSchemaOptions: {
        dateScalarMode: 'isoDate',
        fieldMiddleware: [loggerMiddleware],
      },
      context: ({ req, connection }) => {
        if (req) {
          const user = req.headers.authorization;
          return { ...req, user };
        } else {
          return connection;
        }
      },
    }),
  ],
})
export class GraphqlModule {}
