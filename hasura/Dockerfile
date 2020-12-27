FROM hasura/graphql-engine:v1.3.3.cli-migrations-v2

ARG hasura_graphql_migrations_dir
ARG hasura_graphql_metadata_dir
ARG hasura_action_base_url

ENV HASURA_GRAPHQL_MIGRATIONS_DIR $hasura_graphql_migrations_dir
ENV HASURA_GRAPHQL_METADATA_DIR $hasura_graphql_metadata_dir
ENV HASURA_ACTION_BASE_URL $hasura_action_base_url
ENV PORT 8080

EXPOSE $PORT

COPY migrations $HASURA_GRAPHQL_MIGRATIONS_DIR
COPY metadata $HASURA_GRAPHQL_METADATA_DIR

CMD graphql-engine \
  serve \
  --database-url $HASURA_GRAPHQL_DATABASE_URL \
  --hasura_action_base_url $HASURA_ACTION_BASE_URL