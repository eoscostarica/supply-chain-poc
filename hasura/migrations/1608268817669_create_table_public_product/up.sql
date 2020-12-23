CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."product"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" varchar NOT NULL, "types" jsonb, "manufacturer_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturer"("id") ON UPDATE cascade ON DELETE restrict);
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
CREATE TRIGGER "set_public_product_updated_at"
BEFORE UPDATE ON "public"."product"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_product_updated_at" ON "public"."product" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
