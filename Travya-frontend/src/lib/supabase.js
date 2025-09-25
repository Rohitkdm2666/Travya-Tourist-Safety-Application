import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://bdvyohjudxyvahicqxsj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkdnlvaGp1ZHh5dmFoaWNxeHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDQwNzEsImV4cCI6MjA3NDI4MDA3MX0.71tPP2gE8qgTrbE9yDdDhBACQQejSQi1N68idoeeJ7A"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


