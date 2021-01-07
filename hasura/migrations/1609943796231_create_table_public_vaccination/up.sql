CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE "public"."vaccination"("id" uuid NOT NULL DEFAULT gen_random_uuid(), "vaccine_id" uuid NOT NULL, "vaccinator_id" uuid NOT NULL, "health_center_id" uuid NOT NULL, "vaccinated_id" uuid NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("vaccine_id") REFERENCES "public"."asset"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("vaccinator_id") REFERENCES "public"."user"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("health_center_id") REFERENCES "public"."organization"("id") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("vaccinated_id") REFERENCES "public"."person"("id") ON UPDATE restrict ON DELETE restrict);
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
CREATE TRIGGER "set_public_vaccination_updated_at"
BEFORE UPDATE ON "public"."vaccination"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_vaccination_updated_at" ON "public"."vaccination" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
