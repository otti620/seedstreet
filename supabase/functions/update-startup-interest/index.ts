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
    const { startupId, newInterestsCount, founderId, startupName, isInterested, investorName, investorEmail } = await req.json()

    if (!startupId || typeof newInterestsCount !== 'number' || !founderId || !startupName) {
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

    // Update the interests count for the startup
    const { error: startupUpdateError } = await supabaseClient
      .from('startups')
      .update({ interests: newInterestsCount })
      .eq('id', startupId);

    if (startupUpdateError) {
      console.error("Error updating startup interests:", startupUpdateError);
      return new Response(JSON.stringify({ error: 'Failed to update startup interests' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Send notification to founder if interest was signaled (not removed)
    if (!isInterested) { // isInterested here means "was already interested", so !isInterested means "now signaling interest"
      await supabaseClient.from('notifications').insert({
        user_id: founderId,
        type: 'new_interest',
        message: `${investorName || investorEmail?.split('@')[0]} is interested in your startup ${startupName}!`,
        link: `/startup/${startupId}`,
        related_entity_id: startupId,
      });
    }

    return new Response(JSON.stringify({
      message: `Startup interest updated successfully for ${startupName}`,
      newInterestsCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in update-startup-interest function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})