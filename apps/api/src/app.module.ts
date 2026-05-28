// Root module. Wires the global database module, the code-first GraphQL
// (Apollo) layer, and the feature modules together.
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { DbModule } from './db.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    DbModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Emit the SDL to a committed file: reviewable in PRs and the anchor for
      // future GraphQL Codegen (see docs/IDEAS.md). sortSchema keeps diffs stable.
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      playground: false,
      graphiql: true,
    }),
    HealthModule,
  ],
})
export class AppModule {}
