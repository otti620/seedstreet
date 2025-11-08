import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { startupId, activeChats, roomMembers } = await req.json()

    if (!startupId || typeof activeChats !== 'number' || typeof roomMembers !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update the active_chats and room_members counts for the startup
    const { data: updatedStartup, error: startupUpdateError } = await supabaseClient
      .from('startups')
      .update({ active_chats: activeChats, room_members: roomMembers })
      .eq('id', startupId)
      .select('id, name, active_chats, room_members')
      .single();

    if (startupUpdateError) {
      console.error("Error updating startup chat metrics:", startupUpdateError);
      return new Response(JSON.stringify({ error: 'Failed to update startup chat metrics' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({
      message: `Startup chat metrics updated successfully for ${updatedStartup.name}`,
      startup: updatedStartup,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in update-startup-chat-metrics function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})