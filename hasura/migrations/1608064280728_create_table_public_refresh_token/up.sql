CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."refresh_token"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "token" varchar NOT NULL, "expired_at" timestamptz NOT NULL, "user_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON UPDATE cascade ON DELETE cascade);
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
CREATE TRIGGER "set_public_refresh_token_updated_at"
BEFORE UPDATE ON "public"."refresh_token"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_refresh_token_updated_at" ON "public"."refresh_token" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
