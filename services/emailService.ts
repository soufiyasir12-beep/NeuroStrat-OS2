import { Email, Task } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Sends a real email by calling our local Next.js API route.
 * This avoids CORS issues and keeps the API key secure on the server.
 */
export const sendEmailViaApi = async (email: Email): Promise<{ success: boolean; id?: string }> => {
  // We strictly fetch our own backend endpoint. 
  // We send the 'from' address selected by the user.
  const response = await fetch('/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: email.from, // Sending the selected identity
      to: [email.to], // Resend expects an array for 'to'
      subject: email.subject,
      html: `<div style="font-family: sans-serif; color: #111; line-height: 1.6;">
              <h2 style="color: #000; font-weight: bold;">Neurostrat Transmission</h2>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
              <p>${email.body.replace(/\n/g, '<br/>')}</p>
              <footer style="margin-top: 40px; font-size: 12px; color: #666;">
                Sent via Neurostrat OS Command Center
              </footer>
            </div>`
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server Error: ${response.status}`);
  }

  const data = await response.json();
  return { success: true, id: data.id };
};

/**
 * Uses Gemini to generate context-aware incoming emails.
 */
export const fetchIncomingEmails = async (existingTasks: Task[]): Promise<Email[]> => {
  try {
    const apiKey = (process.env as any).API_KEY;
    if (!apiKey) {
        // Fallback if no API key is available
        throw new Error("Gemini API Key missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const taskSummary = existingTasks.map(t => t.title).join(', ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 2 highly realistic business emails I just "received" in my inbox. 
      Context: My project management dashboard (Neurostrat OS) currently has these tasks: ${taskSummary}.
      Make them feel like high-stakes communications, maybe from a stakeholder, a partner, or an automated system warning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING },
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
            },
            required: ["from", "subject", "body"]
          }
        }
      }
    });

    const raw = JSON.parse(response.text || "[]");
    return raw.map((item: any) => ({
      ...item,
      to: 'me@neurostrat.os',
      status: 'received',
      createdAt: new Date()
    }));
  } catch (e) {
    console.error("Failed to sync transmissions:", e);
    // Return a mock system message if the AI generation fails
    return [
        {
            to: 'me@neurostrat.os',
            from: 'System Admin',
            subject: 'Encryption Key Update',
            body: 'The local encryption keys have been rotated successfully. No action required.',
            status: 'received',
            createdAt: new Date()
        }
    ];
  }
};