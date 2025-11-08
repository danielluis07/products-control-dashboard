ALTER TABLE "products" DROP CONSTRAINT "products_created_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "is_approved";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "created_by_user_id";