
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file manually (since we're using Node.js directly)
const envContent = fs.readFileSync(path.join(__dirname, '.env.development'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);

// We need to use the service_role key for admin operations! Wait, let's check...
// Oh wait, anon key probably doesn't have permissions to create tables!
// Hmm, let's check if there's a .env file with service_role key?

let supabase;

try {
    // Try with anon key first, but note: anon key can't create tables
    // For creating tables, user needs to use SQL Editor or have service role key
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Connected to Supabase!');
    
    // Let's try to list existing tables to test
    console.log('\nChecking existing tables...');
    const { data, error } = await supabase
        .from('profiles')
        .select('count');
    
    if (error) {
        if (error.code === '42P01') {
            console.log('Table "profiles" does not exist - we need to run schema.sql!');
            console.log('Please run schema.sql in Supabase SQL Editor first!');
        } else {
            console.error('Error checking tables:', error);
        }
    } else {
        console.log('Tables exist!');
    }

} catch (err) {
    console.error('Error:', err);
}
