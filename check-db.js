const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjectsTable() {
  console.log('🔍 Checking "projects" table...');

  const { data, error } = await supabase.from("projects").select("*").limit(1);

  if (error) {
    console.error("❌ Error selecting from projects:", error.message);
    if (error.code === "PGRST116" || error.message.includes("does not exist")) {
      console.log('⚠️ The "projects" table likely does not exist.');
    }
  } else {
    console.log('✅ "projects" table exists!');
    console.log("📊 Sample data:", data);
  }

  console.log('\n🔍 Checking "project_divisions" table...');
  const { data: pdData, error: pdError } = await supabase.from("project_divisions").select("*").limit(1);

  if (pdError) {
    console.error("❌ Error selecting from project_divisions:", pdError.message);
  } else {
    console.log('✅ "project_divisions" table exists!');
  }
}

checkProjectsTable();
