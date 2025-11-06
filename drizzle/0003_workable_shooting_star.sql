CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text,
	"private_key" text,
	"created_at" timestamp NOT NULL
);
