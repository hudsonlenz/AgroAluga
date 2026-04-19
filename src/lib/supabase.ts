import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zmtqkgtavnzkxxcebzxm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdHFrZ3Rhdm56a3h4Y2VienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzYyNTQsImV4cCI6MjA5MjE1MjI1NH0.TRIzczXrUjqrI9yRPQpOSEBsSW3UeombX06I6HuYt-Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
