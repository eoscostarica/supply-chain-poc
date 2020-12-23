CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."asset"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "key" varchar NOT NULL, "author" varchar NOT NULL, "owner" varchar NOT NULL, "offered_to" varchar, "category" varchar NOT NULL, "idata" jsonb NOT NULL, "mdata" jsonb NOT NULL, "status" varchar NOT NULL, "parent" uuid, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") );
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_asset_updated_at"
BEFORE UPDATE ON "public"."asset"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_asset_updated_at" ON "public"."asset" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';

