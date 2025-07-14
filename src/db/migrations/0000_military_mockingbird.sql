CREATE TABLE "payment_method" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_product_id" integer,
	"name" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"SKU" varchar NOT NULL,
	"name" varchar NOT NULL,
	"cost_per_unit" numeric(10, 2),
	"cost_peer_pound" numeric(10, 2),
	"qty_unit" integer,
	"qty_pound" numeric(10, 2),
	"out_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "product_item_SKU_unique" UNIQUE("SKU")
);
--> statement-breakpoint
CREATE TABLE "product_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "product_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "product_type_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_type_id" integer NOT NULL,
	"product_item_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_product" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"qty" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_type_id" integer,
	"payment_method_id" integer,
	"sub_total" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_type_product_id_product_type_id_fk" FOREIGN KEY ("type_product_id") REFERENCES "public"."product_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_item" ADD CONSTRAINT "product_type_item_product_type_id_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_type_item" ADD CONSTRAINT "product_type_item_product_item_id_product_item_id_fk" FOREIGN KEY ("product_item_id") REFERENCES "public"."product_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_product" ADD CONSTRAINT "sale_product_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_product" ADD CONSTRAINT "sale_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_sale_type_id_sale_type_id_fk" FOREIGN KEY ("sale_type_id") REFERENCES "public"."sale_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_payment_method_id_payment_method_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_method"("id") ON DELETE no action ON UPDATE no action;