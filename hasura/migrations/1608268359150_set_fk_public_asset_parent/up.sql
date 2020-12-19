alter table "public"."asset"
           add constraint "asset_parent_fkey"
           foreign key ("parent")
           references "public"."asset"
           ("id") on update cascade on delete cascade;
