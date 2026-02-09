


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."cereal_enum" AS ENUM (
    'SOJA',
    'MAIZ',
    'TRIGO',
    'GIRASOL',
    'CEBADA',
    'SORGO',
    'MANI'
);


ALTER TYPE "public"."cereal_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_conversacion_enum" AS ENUM (
    'MENU_PRINCIPAL',
    'ESPERANDO_CEREAL',
    'ESPERANDO_TONELADAS',
    'ESPERANDO_TIPO_CAMION',
    'ESPERANDO_ORIGEN',
    'ESPERANDO_NOMBRE_DESTINO',
    'ESPERANDO_ROL',
    'ESPERANDO_NOMBRE',
    'ESPERANDO_CUIL',
    'ESPERANDO_PATENTE',
    'ESPERANDO_TIPO_CAMION_CARGA',
    'SOPORTE_HUMANO',
    'ESPERANDO_DESTINO',
    'ESPERANDO_NOMBRE_ORIGEN',
    'ESPERANDO_GPS_DESTINO_NUEVO',
    'ESPERANDO_GPS_ORIGEN_NUEVO'
);


ALTER TYPE "public"."estado_conversacion_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_oferta_enum" AS ENUM (
    'PENDIENTE',
    'ACEPTADA',
    'RECHAZADA',
    'CANCELADA'
);


ALTER TYPE "public"."estado_oferta_enum" OWNER TO "postgres";


CREATE TYPE "public"."estado_viaje_enum" AS ENUM (
    'SOLICITADO',
    'PUBLICADO',
    'ASIGNADO',
    'EN_VIAJE',
    'COMPLETADO',
    'CANCELADO',
    'PENDIENTE',
    'EN_CURSO'
);


ALTER TYPE "public"."estado_viaje_enum" OWNER TO "postgres";


CREATE TYPE "public"."rol_enum" AS ENUM (
    'CHOFER',
    'TRANSPORTISTA',
    'PRODUCTOR',
    'ADMIN'
);


ALTER TYPE "public"."rol_enum" OWNER TO "postgres";


CREATE TYPE "public"."tipo_camion_enum" AS ENUM (
    'CHASIS_Y_ACOPLADO',
    'BATEA',
    'TOLVA',
    'SEMIREMOLQUE'
);


ALTER TYPE "public"."tipo_camion_enum" OWNER TO "postgres";


CREATE TYPE "public"."ubicacion_tipo_enum" AS ENUM (
    'PUERTO',
    'ACOPIO',
    'CAMPO',
    'OTRO'
);


ALTER TYPE "public"."ubicacion_tipo_enum" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."camion" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "patente" "text",
    "patente_acoplado" "text",
    "toneladas" numeric(10,2),
    "tipo_camion" "public"."tipo_camion_enum"
);


ALTER TABLE "public"."camion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."oferta" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_viaje" "uuid" NOT NULL,
    "id_camionero" "uuid" NOT NULL,
    "fechahora" timestamp with time zone DEFAULT "now"() NOT NULL,
    "estado" "public"."estado_oferta_enum" DEFAULT 'PENDIENTE'::"public"."estado_oferta_enum" NOT NULL,
    "tarifa_ofertada" numeric(14,2) NOT NULL
);


ALTER TABLE "public"."oferta" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfil" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text",
    "apellido" "text",
    "telefono" "text",
    "cuit" "text",
    "estado_conversacion" "public"."estado_conversacion_enum" DEFAULT 'MENU_PRINCIPAL'::"public"."estado_conversacion_enum"
);


ALTER TABLE "public"."perfil" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rol_perfil" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_perfil" "uuid" NOT NULL,
    "rol" "public"."rol_enum" NOT NULL
);


ALTER TABLE "public"."rol_perfil" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tarifa" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "km_desde" integer NOT NULL,
    "km_hasta" integer NOT NULL,
    "precio_tonelada" numeric NOT NULL,
    "vigencia_desde" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tarifa" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transportista_camion" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_perfil" "uuid" NOT NULL,
    "id_camion" "uuid" NOT NULL,
    "nombre_fantasia" "text"
);


ALTER TABLE "public"."transportista_camion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ubicacion" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" "text" NOT NULL,
    "longitud" double precision,
    "latitud" double precision,
    "instrucciones_llegada" "text",
    "tipo" "public"."ubicacion_tipo_enum" NOT NULL
);


ALTER TABLE "public"."ubicacion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ubicacion_persona" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_perfil" "uuid" NOT NULL,
    "id_ubicacion" "uuid" NOT NULL
);


ALTER TABLE "public"."ubicacion_persona" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."viaje" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id_camionero" "uuid",
    "id_productor" "uuid",
    "cereal" "public"."cereal_enum",
    "id_origen" "uuid",
    "id_destino" "uuid",
    "toneladas" numeric(10,2),
    "tarifa_base" numeric(14,2),
    "estado" "public"."estado_viaje_enum" DEFAULT 'SOLICITADO'::"public"."estado_viaje_enum",
    "fecha_carga" timestamp with time zone,
    "id_transportista" "uuid",
    "tipo_camion" "public"."tipo_camion_enum"
);


ALTER TABLE "public"."viaje" OWNER TO "postgres";


ALTER TABLE ONLY "public"."camion"
    ADD CONSTRAINT "camion_patente_unique" UNIQUE ("patente");



ALTER TABLE ONLY "public"."camion"
    ADD CONSTRAINT "camion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oferta"
    ADD CONSTRAINT "oferta_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oferta"
    ADD CONSTRAINT "oferta_unique_camionero_viaje" UNIQUE ("id_viaje", "id_camionero", "fechahora");



ALTER TABLE ONLY "public"."perfil"
    ADD CONSTRAINT "perfil_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rol_perfil"
    ADD CONSTRAINT "rol_perfil_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rol_perfil"
    ADD CONSTRAINT "rol_perfil_unique" UNIQUE ("id_perfil", "rol");



ALTER TABLE ONLY "public"."tarifa"
    ADD CONSTRAINT "tarifa_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transportista_camion"
    ADD CONSTRAINT "transportista_camion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transportista_camion"
    ADD CONSTRAINT "transportista_camion_unique" UNIQUE ("id_perfil", "id_camion");



ALTER TABLE ONLY "public"."ubicacion_persona"
    ADD CONSTRAINT "ubicacion_persona_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ubicacion_persona"
    ADD CONSTRAINT "ubicacion_persona_unique" UNIQUE ("id_perfil", "id_ubicacion");



ALTER TABLE ONLY "public"."ubicacion"
    ADD CONSTRAINT "ubicacion_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."viaje"
    ADD CONSTRAINT "viaje_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_oferta_estado" ON "public"."oferta" USING "btree" ("estado");



CREATE INDEX "idx_oferta_id_viaje" ON "public"."oferta" USING "btree" ("id_viaje");



CREATE INDEX "idx_rol_perfil_id_perfil" ON "public"."rol_perfil" USING "btree" ("id_perfil");



CREATE INDEX "idx_tarifa_kms" ON "public"."tarifa" USING "btree" ("km_desde", "km_hasta");



CREATE INDEX "idx_transportista_camion_id_camion" ON "public"."transportista_camion" USING "btree" ("id_camion");



CREATE INDEX "idx_transportista_camion_id_perfil" ON "public"."transportista_camion" USING "btree" ("id_perfil");



CREATE INDEX "idx_ubicacion_persona_id_perfil" ON "public"."ubicacion_persona" USING "btree" ("id_perfil");



CREATE INDEX "idx_ubicacion_persona_id_ubicacion" ON "public"."ubicacion_persona" USING "btree" ("id_ubicacion");



CREATE INDEX "idx_viaje_destino" ON "public"."viaje" USING "btree" ("id_destino");



CREATE INDEX "idx_viaje_estado" ON "public"."viaje" USING "btree" ("estado");



CREATE INDEX "idx_viaje_origen" ON "public"."viaje" USING "btree" ("id_origen");



ALTER TABLE ONLY "public"."oferta"
    ADD CONSTRAINT "oferta_id_camionero_fkey" FOREIGN KEY ("id_camionero") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."oferta"
    ADD CONSTRAINT "oferta_id_viaje_fkey" FOREIGN KEY ("id_viaje") REFERENCES "public"."viaje"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rol_perfil"
    ADD CONSTRAINT "rol_perfil_id_perfil_fkey" FOREIGN KEY ("id_perfil") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transportista_camion"
    ADD CONSTRAINT "transportista_camion_id_camion_fkey" FOREIGN KEY ("id_camion") REFERENCES "public"."camion"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transportista_camion"
    ADD CONSTRAINT "transportista_camion_id_perfil_fkey" FOREIGN KEY ("id_perfil") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ubicacion_persona"
    ADD CONSTRAINT "ubicacion_persona_id_perfil_fkey" FOREIGN KEY ("id_perfil") REFERENCES "public"."perfil"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ubicacion_persona"
    ADD CONSTRAINT "ubicacion_persona_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "public"."ubicacion"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."viaje"
    ADD CONSTRAINT "viaje_id_camionero_fkey" FOREIGN KEY ("id_camionero") REFERENCES "public"."perfil"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."viaje"
    ADD CONSTRAINT "viaje_id_destino_fkey" FOREIGN KEY ("id_destino") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."viaje"
    ADD CONSTRAINT "viaje_id_origen_fkey" FOREIGN KEY ("id_origen") REFERENCES "public"."ubicacion"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."viaje"
    ADD CONSTRAINT "viaje_id_productor_fkey" FOREIGN KEY ("id_productor") REFERENCES "public"."perfil"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."viaje"
    ADD CONSTRAINT "viaje_id_transportista_fkey" FOREIGN KEY ("id_transportista") REFERENCES "public"."transportista_camion"("id") ON DELETE SET NULL;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."camion" TO "service_role";



GRANT ALL ON TABLE "public"."oferta" TO "service_role";



GRANT ALL ON TABLE "public"."perfil" TO "service_role";



GRANT ALL ON TABLE "public"."rol_perfil" TO "service_role";



GRANT ALL ON TABLE "public"."tarifa" TO "service_role";



GRANT ALL ON TABLE "public"."transportista_camion" TO "service_role";



GRANT ALL ON TABLE "public"."ubicacion" TO "service_role";



GRANT ALL ON TABLE "public"."ubicacion_persona" TO "service_role";



GRANT ALL ON TABLE "public"."viaje" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";




























drop extension if exists "pg_net";

revoke delete on table "public"."camion" from "anon";

revoke insert on table "public"."camion" from "anon";

revoke references on table "public"."camion" from "anon";

revoke select on table "public"."camion" from "anon";

revoke trigger on table "public"."camion" from "anon";

revoke truncate on table "public"."camion" from "anon";

revoke update on table "public"."camion" from "anon";

revoke delete on table "public"."camion" from "authenticated";

revoke insert on table "public"."camion" from "authenticated";

revoke references on table "public"."camion" from "authenticated";

revoke select on table "public"."camion" from "authenticated";

revoke trigger on table "public"."camion" from "authenticated";

revoke truncate on table "public"."camion" from "authenticated";

revoke update on table "public"."camion" from "authenticated";

revoke delete on table "public"."oferta" from "anon";

revoke insert on table "public"."oferta" from "anon";

revoke references on table "public"."oferta" from "anon";

revoke select on table "public"."oferta" from "anon";

revoke trigger on table "public"."oferta" from "anon";

revoke truncate on table "public"."oferta" from "anon";

revoke update on table "public"."oferta" from "anon";

revoke delete on table "public"."oferta" from "authenticated";

revoke insert on table "public"."oferta" from "authenticated";

revoke references on table "public"."oferta" from "authenticated";

revoke select on table "public"."oferta" from "authenticated";

revoke trigger on table "public"."oferta" from "authenticated";

revoke truncate on table "public"."oferta" from "authenticated";

revoke update on table "public"."oferta" from "authenticated";

revoke delete on table "public"."perfil" from "anon";

revoke insert on table "public"."perfil" from "anon";

revoke references on table "public"."perfil" from "anon";

revoke select on table "public"."perfil" from "anon";

revoke trigger on table "public"."perfil" from "anon";

revoke truncate on table "public"."perfil" from "anon";

revoke update on table "public"."perfil" from "anon";

revoke delete on table "public"."perfil" from "authenticated";

revoke insert on table "public"."perfil" from "authenticated";

revoke references on table "public"."perfil" from "authenticated";

revoke select on table "public"."perfil" from "authenticated";

revoke trigger on table "public"."perfil" from "authenticated";

revoke truncate on table "public"."perfil" from "authenticated";

revoke update on table "public"."perfil" from "authenticated";

revoke delete on table "public"."rol_perfil" from "anon";

revoke insert on table "public"."rol_perfil" from "anon";

revoke references on table "public"."rol_perfil" from "anon";

revoke select on table "public"."rol_perfil" from "anon";

revoke trigger on table "public"."rol_perfil" from "anon";

revoke truncate on table "public"."rol_perfil" from "anon";

revoke update on table "public"."rol_perfil" from "anon";

revoke delete on table "public"."rol_perfil" from "authenticated";

revoke insert on table "public"."rol_perfil" from "authenticated";

revoke references on table "public"."rol_perfil" from "authenticated";

revoke select on table "public"."rol_perfil" from "authenticated";

revoke trigger on table "public"."rol_perfil" from "authenticated";

revoke truncate on table "public"."rol_perfil" from "authenticated";

revoke update on table "public"."rol_perfil" from "authenticated";

revoke delete on table "public"."tarifa" from "anon";

revoke insert on table "public"."tarifa" from "anon";

revoke references on table "public"."tarifa" from "anon";

revoke select on table "public"."tarifa" from "anon";

revoke trigger on table "public"."tarifa" from "anon";

revoke truncate on table "public"."tarifa" from "anon";

revoke update on table "public"."tarifa" from "anon";

revoke delete on table "public"."tarifa" from "authenticated";

revoke insert on table "public"."tarifa" from "authenticated";

revoke references on table "public"."tarifa" from "authenticated";

revoke select on table "public"."tarifa" from "authenticated";

revoke trigger on table "public"."tarifa" from "authenticated";

revoke truncate on table "public"."tarifa" from "authenticated";

revoke update on table "public"."tarifa" from "authenticated";

revoke delete on table "public"."transportista_camion" from "anon";

revoke insert on table "public"."transportista_camion" from "anon";

revoke references on table "public"."transportista_camion" from "anon";

revoke select on table "public"."transportista_camion" from "anon";

revoke trigger on table "public"."transportista_camion" from "anon";

revoke truncate on table "public"."transportista_camion" from "anon";

revoke update on table "public"."transportista_camion" from "anon";

revoke delete on table "public"."transportista_camion" from "authenticated";

revoke insert on table "public"."transportista_camion" from "authenticated";

revoke references on table "public"."transportista_camion" from "authenticated";

revoke select on table "public"."transportista_camion" from "authenticated";

revoke trigger on table "public"."transportista_camion" from "authenticated";

revoke truncate on table "public"."transportista_camion" from "authenticated";

revoke update on table "public"."transportista_camion" from "authenticated";

revoke delete on table "public"."ubicacion" from "anon";

revoke insert on table "public"."ubicacion" from "anon";

revoke references on table "public"."ubicacion" from "anon";

revoke select on table "public"."ubicacion" from "anon";

revoke trigger on table "public"."ubicacion" from "anon";

revoke truncate on table "public"."ubicacion" from "anon";

revoke update on table "public"."ubicacion" from "anon";

revoke delete on table "public"."ubicacion" from "authenticated";

revoke insert on table "public"."ubicacion" from "authenticated";

revoke references on table "public"."ubicacion" from "authenticated";

revoke select on table "public"."ubicacion" from "authenticated";

revoke trigger on table "public"."ubicacion" from "authenticated";

revoke truncate on table "public"."ubicacion" from "authenticated";

revoke update on table "public"."ubicacion" from "authenticated";

revoke delete on table "public"."ubicacion_persona" from "anon";

revoke insert on table "public"."ubicacion_persona" from "anon";

revoke references on table "public"."ubicacion_persona" from "anon";

revoke select on table "public"."ubicacion_persona" from "anon";

revoke trigger on table "public"."ubicacion_persona" from "anon";

revoke truncate on table "public"."ubicacion_persona" from "anon";

revoke update on table "public"."ubicacion_persona" from "anon";

revoke delete on table "public"."ubicacion_persona" from "authenticated";

revoke insert on table "public"."ubicacion_persona" from "authenticated";

revoke references on table "public"."ubicacion_persona" from "authenticated";

revoke select on table "public"."ubicacion_persona" from "authenticated";

revoke trigger on table "public"."ubicacion_persona" from "authenticated";

revoke truncate on table "public"."ubicacion_persona" from "authenticated";

revoke update on table "public"."ubicacion_persona" from "authenticated";

revoke delete on table "public"."viaje" from "anon";

revoke insert on table "public"."viaje" from "anon";

revoke references on table "public"."viaje" from "anon";

revoke select on table "public"."viaje" from "anon";

revoke trigger on table "public"."viaje" from "anon";

revoke truncate on table "public"."viaje" from "anon";

revoke update on table "public"."viaje" from "anon";

revoke delete on table "public"."viaje" from "authenticated";

revoke insert on table "public"."viaje" from "authenticated";

revoke references on table "public"."viaje" from "authenticated";

revoke select on table "public"."viaje" from "authenticated";

revoke trigger on table "public"."viaje" from "authenticated";

revoke truncate on table "public"."viaje" from "authenticated";

revoke update on table "public"."viaje" from "authenticated";
