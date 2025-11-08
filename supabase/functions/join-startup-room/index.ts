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
    const { startupId, userId } = await req.json()

    if (!startupId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing startupId or userId' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Create a Supabase client with the service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch current room_members count
    const { data: startupData, error: fetchError } = await supabaseClient
      .from('startups')
      .select('room_members')
      .eq('id', startupId)
      .single();

    if (fetchError) {
      console.error("Error fetching startup for room join:", fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch startup data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const newRoomMembersCount = (startupData?.room_members || 0) + 1;

    // Update the room_members count
    const { data: updatedStartup, error: updateError } = await supabaseClient
      .from('startups')
      .update({ room_members: newRoomMembersCount })
      .eq('id', startupId)
      .select('id, name, room_members') // Select relevant fields to return
      .single(); // Use single here as we expect exactly one row to be updated

    if (updateError) {
      console.error("Error updating room members:", updateError);
      return new Response(JSON.stringify({ error: 'Failed to update room members' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({
      message: `Successfully joined room for startup ${updatedStartup.name}`,
      startup: updatedStartup,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in join-startup-room function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})