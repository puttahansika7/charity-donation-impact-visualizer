import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Google GenAI on server-side only
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  genAI = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(apiKey),
  });
});

// AI Insights endpoint
app.post('/api/ai-insights', async (req: Request, res: Response) => {
  try {
    const { metrics, categoryBreakdown, recentDonations, customPrompt, queryType } = req.body;

    if (!metrics) {
      res.status(400).json({ error: 'Missing donation metrics payload' });
      return;
    }

    if (!genAI) {
      // Fallback calculated analysis when API key is not yet configured
      res.json({
        summary: `Current charity operations reflect strong financial health with $${Number(metrics.totalDonations).toLocaleString()} raised and $${Number(metrics.totalExpenses).toLocaleString()} expended, directly serving ${Number(metrics.totalBeneficiaries).toLocaleString()} beneficiaries.`,
        efficiencyScore: Math.round(((metrics.totalDonations - metrics.totalExpenses) / (metrics.totalDonations || 1)) * 100),
        keyFindings: [
          `Fund allocation efficiency is solid with ${Math.round((metrics.totalExpenses / (metrics.totalDonations || 1)) * 100)}% of raised funds deployed to on-the-ground programs.`,
          `Average cost per beneficiary helped stands at $${(metrics.totalExpenses / (metrics.totalBeneficiaries || 1)).toFixed(2)}.`,
          `Top funding recipient category is leading in community reach with consistent donor engagement.`,
        ],
        strategicRecommendations: [
          'Enhance recurring donor conversion for high-impact seasonal programs.',
          'Broaden transparency reports to showcase unit cost per beneficiary in donor newsletters.',
          'Maintain a 3-month operating reserve to buffer against emergency relief surges.',
        ],
        isFallback: true,
      });
      return;
    }

    // Build focused prompt for Gemini 3.8 Flash
    const prompt = `
You are a senior non-profit financial and impact analytics expert reviewing charity performance data.
Analyze the following charity donation and expense metrics:

=== FINANCIAL OVERVIEW ===
- Total Donations Received: $${Number(metrics.totalDonations).toLocaleString()}
- Total Program & Operational Expenses: $${Number(metrics.totalExpenses).toLocaleString()}
- Net Impact Capital / Reserve: $${(Number(metrics.totalDonations) - Number(metrics.totalExpenses)).toLocaleString()}
- Total Beneficiaries Reached: ${Number(metrics.totalBeneficiaries).toLocaleString()}
- Number of Donations Logged: ${metrics.recordCount || 'N/A'}
- Average Donation: $${metrics.averageDonation ? Number(metrics.averageDonation).toFixed(2) : 'N/A'}

=== CATEGORY BREAKDOWN ===
${JSON.stringify(categoryBreakdown || [], null, 2)}

=== RECENT HIGHLIGHTED INITIATIVES ===
${JSON.stringify((recentDonations || []).slice(0, 5), null, 2)}

${customPrompt ? `=== SPECIFIC USER INQUIRY ===\n"${customPrompt}"\nProvide a focused direct response to this inquiry alongside the impact data.` : ''}

Task:
Produce an objective, insightful, and actionable evaluation.
Respond in valid JSON format matching this exact schema:
{
  "summary": "2-3 concise sentences summarizing overall financial health, execution velocity, and direct beneficiary outcomes.",
  "efficiencyScore": 92, // integer between 0 and 100 representing capital-to-impact efficiency
  "costPerBeneficiary": "$XX.XX",
  "fundDeploymentRate": "XX%",
  "keyFindings": [
    "Concrete observation 1 about expense allocation vs donation momentum",
    "Concrete observation 2 about category impact ROI or beneficiary reach",
    "Concrete observation 3 regarding donor retention or average gift size"
  ],
  "strategicRecommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "impactMilestoneNarrative": "A compelling 2-sentence narrative suitable for public transparency reports detailing what these donations achieved in real human terms."
}
`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // If parsing fails, extract JSON cleanly
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: rawText };
    }

    res.json({
      ...parsedData,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate AI insights',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Charity Donation Impact Visualizer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
