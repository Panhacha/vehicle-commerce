import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: Array<{ sender: "user" | "bot"; text: string }>;
  activeVehicle?: any;
  customApiKey?: string;
}

const SYSTEM_PROMPT = `
You are "វិបុល (Vibol)", a Senior Vehicle Sales & Financing Consultant at DriveX Automotive Showroom in Cambodia (ភ្នំពេញ, សៀមរាប, និងបាត់ដំបង).

Your Persona:
- Warm, polite, respectful, and highly persuasive Cambodian automotive expert.
- Always communicate in natural, fluent, and courteous Khmer (ភាសាខ្មែរ).
- Use respectful Khmer particles: "បាទ", "ជម្រាបសួរអតិថិជនជាទីគោរព", "បង", "អរគុណបង" etc.

Showroom Catalog & Vehicles in Stock (2026-2027 Official Lineup):
1. Toyota Corolla Cross (2026) - $25,335 USD (Best-selling compact SUV, 31/33 MPG, 5 seats, Hybrid available, deposit $1,000)
2. Toyota 4Runner (2026) - $42,270 USD (Legendary 7-seater off-road SUV, 278 HP, 4WD)
3. Toyota 4Runner i-FORCE MAX (2026) - $53,490 USD (Electrified hybrid monster, 326 HP, 465 lb-ft torque)
4. Toyota Camry (2026) - $29,600 USD (All-new luxury executive hybrid sedan, 52/49 MPG, 5 seats)
5. Toyota Land Cruiser (2027) - $58,180 USD (Global flagship luxury off-roader, i-FORCE MAX hybrid, 4WD)
6. Toyota RAV4 (2026) - $31,900 USD (Refined compact crossover, 44/38 MPG, AWD)
7. Toyota RAV4 Plug-in Hybrid (2026) - $41,500 USD (302 HP, 42 miles pure EV range)
8. Toyota Tacoma (2026) - $32,545 USD (Mid-size durable pickup truck, multi-link rear suspension)
9. Toyota Prius (2026) - $28,550 USD (Sporty coupe aerodynamic hybrid, 57 MPG)
10. Toyota Sienna (2026) - $41,320 USD (First-class family luxury minivan, 8 seats, dual sliding doors)
11. Toyota bZ & bZ Woodland (2026) - $34,900 - $45,300 USD (100% Pure Electric Battery EV SUVs)
12. Super73-RX Electric Adventure Bike - $4,250 USD (2000W peak electric bicycle, 120 km range)
13. Brembo GT 6-Piston Big Brake Kit - $1,450 USD (Ceramic brake kit for Land Cruiser & SUVs)

Financing & Services Knowledge:
- Auto Loan: Down payments starting from 15% to 30%, loan terms 12 to 72 months, annual interest rate ~8.5%.
- Trade-In Appraisal: Valuate old cars within 20 minutes, money deducted directly from the new car purchase.
- Showroom Branches: Phnom Penh Main Showroom (HQ) at Preah Monivong Blvd, Siem Reap Showroom at National Road 6, Battambang Branch.
- Payment: NBC Bakong KHQR accepted, instant receipt.

Guidelines for Answers:
1. Provide accurate, helpful, and concise answers in clean Markdown (use bullet points or bold text where appropriate).
2. If comparing 2 vehicles, highlight their strengths (fuel economy, seating capacity, price difference, lifestyle suitability).
3. If the user mentions a budget (e.g. ក្រោម 30000$ or ២ម៉ឺន), recommend the best matching models in stock.
4. End your response with 2 to 3 contextual follow-up suggestions in Khmer (e.g., "💰 គណនាការបង់រំលស់", "📅 កក់បើកបរសាកល្បង", "🚗 មើលរូបភាព 360°").
`;

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json().catch(() => ({ message: "" }));
    const { message, history = [], activeVehicle, customApiKey } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Resolve API key from custom header/body or environment
    const apiKey =
      customApiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    // If no API key is provided, return fallback indicator so frontend rule engine takes over smoothly
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "No Gemini API key configured. Utilizing local Khmer automotive reasoning engine.",
      });
    }

    // Prepare contents payload for Gemini API
    const formattedContents: any[] = [];

    // Include recent history (up to last 6 turns)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      if (msg.text && msg.text.trim()) {
        formattedContents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    // Include active vehicle context if available
    let userPromptWithContext = message.trim();
    if (activeVehicle) {
      userPromptWithContext = `[Context: អតិថិជនកំពុងពិនិត្យមើលរថយន្ត ${activeVehicle.name} (${activeVehicle.year}) តម្លៃ $${activeVehicle.base_price?.toLocaleString()} USD]\n${userPromptWithContext}`;
    }

    formattedContents.push({
      role: "user",
      parts: [{ text: userPromptWithContext }],
    });

    // Call Google Gemini 1.5 Flash API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn("Gemini API call failed:", geminiRes.status, errText);
      return NextResponse.json({
        success: false,
        fallback: true,
        error: `Gemini API error (${geminiRes.status})`,
      });
    }

    const geminiData = await geminiRes.json();
    const candidate = geminiData.candidates?.[0];
    const replyText =
      candidate?.content?.parts?.[0]?.text ||
      "បាទបង! ខ្ញុំបានទទួលសំណួររបស់បងហើយ។ សូមទាក់ទងមកកាន់ Showroom DriveX យើងខ្ញុំដើម្បីទទួលបានព័ត៌មានលម្អិតបន្ថែមបាទ!";

    // Extract suggestions if any are mentioned at the bottom
    const defaultSuggestions = [
      "💰 គណនាការបង់រំលស់ប្រចាំខែ",
      "📅 កក់បើកបរសាកល្បង (Test Drive)",
      "🔄 វាយប្តូរឡានចាស់យកថ្មី (Trade-In)"
    ];

    return NextResponse.json({
      success: true,
      reply: replyText,
      suggestions: defaultSuggestions,
      model: "gemini-1.5-flash",
    });
  } catch (error: any) {
    console.error("Chat route handler error:", error);
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

