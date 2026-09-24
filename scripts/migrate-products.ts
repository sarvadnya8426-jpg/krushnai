import { createClient } from "@supabase/supabase-js";
import { products } from "../src/data/products";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateProducts() {
  console.log(`Found ${products.length} products.`);

  const productsForSupabase = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand ?? null,
    type: product.type,
    application: product.application,
    description: product.description,
    specs: product.specs ?? null,
    tags: product.tags ?? null,
    image: product.image,
  }));

  const { data, error } = await supabase
    .from("products")
    .upsert(productsForSupabase, {
      onConflict: "id",
    })
    .select();

  if (error) {
    console.error("Migration failed:", error);
    throw error;
  }

  console.log(`Successfully migrated ${data?.length ?? 0} products.`);
}

migrateProducts().catch((error) => {
  console.error(error);
  process.exit(1);
});