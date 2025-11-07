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

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  try {
    const { startupData } = await req.json()

    // Gemini API key hardcoded as requested for now.
    // IMPORTANT: For production, this should be stored as a Supabase secret.
    const geminiApiKey = "AIzaSyA1sBEnueJ6xeiy0DkU3pw4Z5OphB2cVjQ"; 

    const prompt = `Analyze the following startup data for its market trend and potential risks. Provide a market trend analysis (around 2-3 sentences) and an AI risk score (a number between 0 and 100, where 0 is low risk and 100 is high risk). Format the output as a JSON object with 'marketTrendAnalysis' (string) and 'aiRiskScore' (number).

Startup Name: ${startupData.name}
Tagline: ${startupData.tagline}
Pitch: ${startupData.pitch}
Category: ${startupData.category}
Description: ${startupData.description || 'N/A'}
Funding Stage: ${startupData.funding_stage || 'N/A'}
Amount Sought: ${startupData.amount_sought ? `${startupData.currency || '$'}${startupData.amount_sought}` : 'N/A'}

Example Output:
{
  "marketTrendAnalysis": "This startup is well-positioned...",
  "aiRiskScore": 45
}`;

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log("Gemini API Response Status:", geminiResponse.status);
    const geminiRawText = await geminiResponse.text();
    console.log("Gemini API Raw Response Body:", geminiRawText);

    const geminiResult = JSON.parse(geminiRawText);

    if (geminiResult.error) {
      console.error("Gemini API Error:", geminiResult.error);
      return new Response(JSON.stringify({ error: "Gemini API error: " + geminiResult.error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const textResponse = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return new Response(JSON.stringify({ error: "No text response from Gemini API." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    let parsedAnalysis;
    try {
      const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        parsedAnalysis = JSON.parse(jsonMatch[1]);
      } else {
        parsedAnalysis = JSON.parse(textResponse);
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError, "Raw response:", textResponse);
      return new Response(JSON.stringify({ error: "Failed to parse AI analysis response." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { marketTrendAnalysis, aiRiskScore } = parsedAnalysis;

    if (typeof marketTrendAnalysis !== 'string' || typeof aiRiskScore !== 'number') {
      return new Response(JSON.stringify({ error: "Invalid format from AI analysis." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({
      aiRiskScore,
      marketTrendAnalysis,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in analyze-startup function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})