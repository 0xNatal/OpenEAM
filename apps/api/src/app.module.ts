// Root module. Wires the global database module, the code-first GraphQL
// (Apollo) layer, and the feature modules together.
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ArchitectureDomainsModule } from './architecture-domains/architecture-domains.module';
import { BuildingBlocksModule } from './building-blocks/building-blocks.module';
import { BusinessCapabilitiesModule } from './business-capabilities/business-capabilities.module';
import { BusinessProcessesModule } from './business-processes/business-processes.module';
import { DataExchangeModule } from './data-exchange/data-exchange.module';
import { DbModule } from './db.module';
import { EnterprisesModule } from './enterprises/enterprises.module';
import { HealthModule } from './health/health.module';
import { OrganizationUnitsModule } from './organization-units/organization-units.module';
import { ValueStreamsModule } from './value-streams/value-streams.module';

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
    EnterprisesModule,
    ArchitectureDomainsModule,
    OrganizationUnitsModule,
    BuildingBlocksModule,
    BusinessCapabilitiesModule,
    BusinessProcessesModule,
    ValueStreamsModule,
    DataExchangeModule,
  ],
})
export class AppModule {}
