import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gkjqlpmoaljvgihegbuw.supabase.co";
const supabaseKey = "sb_publishable_WG7n2ApIedXyQxbWXgZ0ow_P6h74t7h";

export const supabase = createClient(supabaseUrl, supabaseKey);