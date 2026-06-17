import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are Aether AI, the intelligent core of Aether OS — a premium agency management platform. 
You are helpful, strategic, concise, and brilliant. You help agency owners manage clients, tasks, invoices, and revenue.
When given business context (clients, invoices, tasks), use it to give smart, data-driven insights.
Always respond in a professional yet personable tone. Use markdown formatting where helpful.`;

// Robust simulated response generator for Simulation Mode
function generateSimulationResponse(message: string, context: any): string {
  const msg = message.toLowerCase();
  
  // Extract context details safely
  const clients = context?.clients || [];
  const invoices = context?.invoices || [];
  const tasksObj = context?.tasks || {};
  
  // Parse invoices
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'Paid') || [];
  const pendingInvoices = invoices.filter((inv: any) => inv.status === 'Pending') || [];
  
  const revenue = paidInvoices.reduce((acc: number, inv: any) =>
    acc + parseFloat((inv.amount || '0').toString().replace(/[$,₦]/g, '')), 0);
    
  const pendingRevenue = pendingInvoices.reduce((acc: number, inv: any) =>
    acc + parseFloat((inv.amount || '0').toString().replace(/[$,₦]/g, '')), 0);

  // Parse tasks
  const allTasks = Object.values(tasksObj).flat() as any[];
  const highTasks = allTasks.filter((t: any) => t.priority === 'High');
  const mediumTasks = allTasks.filter((t: any) => t.priority === 'Medium');
  const lowTasks = allTasks.filter((t: any) => t.priority === 'Low');

  // Detect currency symbol from first invoice or default to $
  const currencySymbol = invoices[0]?.amount?.startsWith('₦') ? '₦' : '$';

  if (msg.includes('client') || msg.includes('customer')) {
    if (clients.length === 0) {
      return `### Aether AI · Simulation Mode\n\nNo clients found in your workspace database.\n\n💡 **Tip:** Add some clients on the **Clients** dashboard page to see them listed and analyzed here.`;
    }
    
    let clientList = clients.map((c: any) => `- **${c.name}** (${c.role}) — Email: \`${c.email}\` | Phone: \`${c.phone}\``).join('\n');
    return `### Aether AI · Simulation Mode\n\nHere is a list of your **${clients.length} clients**:\n\n${clientList}\n\n**Strategic Recommendation:** Keeping active engagement with these key stakeholders is crucial. Let me know if you would like me to draft a follow-up email template for any of them!`;
  }

  if (msg.includes('task') || msg.includes('todo') || msg.includes('progress') || msg.includes('board') || msg.includes('pipeline')) {
    if (allTasks.length === 0) {
      return `### Aether AI · Simulation Mode\n\nNo tasks found in your project board.\n\n💡 **Tip:** Add tasks on the **Tasks** board page to track your pipeline!`;
    }

    let taskBreakdown = ``;
    if (highTasks.length > 0) {
      taskBreakdown += `\n🚨 **High Priority:**\n` + highTasks.map((t: any) => `- [ ] ${t.content}`).join('\n');
    }
    if (mediumTasks.length > 0) {
      taskBreakdown += `\n⚡ **Medium Priority:**\n` + mediumTasks.map((t: any) => `- [ ] ${t.content}`).join('\n');
    }
    if (lowTasks.length > 0) {
      taskBreakdown += `\n🌱 **Low Priority:**\n` + lowTasks.map((t: any) => `- [ ] ${t.content}`).join('\n');
    }

    return `### Aether AI · Simulation Mode\n\nYou have **${allTasks.length} active tasks** in your agency pipeline:\n${taskBreakdown}\n\n**Aether Suggestion:** Focus on completing your High Priority tasks first to minimize project delivery bottlenecks.`;
  }

  if (msg.includes('revenue') || msg.includes('invoice') || msg.includes('money') || msg.includes('finance') || msg.includes('paid') || msg.includes('earnings')) {
    if (invoices.length === 0) {
      return `### Aether AI · Simulation Mode\n\nNo invoices found in your database.\n\n💡 **Tip:** Create a new invoice on the **Finance** page to begin generating revenue projections!`;
    }

    let invoiceList = invoices.map((inv: any) => `- **${inv.id}** for *${inv.client}*: **${inv.amount}** (${inv.status === 'Paid' ? '✅ Paid' : '⏳ Pending'})`).join('\n');
    return `### Aether AI · Simulation Mode\n\n### Financial Overview:\n- **Realized Revenue:** ${currencySymbol}${revenue.toLocaleString()}\n- **Outstanding Revenue:** ${currencySymbol}${pendingRevenue.toLocaleString()} (${pendingInvoices.length} pending invoices)\n\n**Invoice breakdown:**\n${invoiceList}\n\n**Aether Advice:** Send reminders for the pending invoices to accelerate your agency's cash flow.`;
  }

  if (msg.includes('strategy') || msg.includes('grow') || msg.includes('marketing') || msg.includes('improve') || msg.includes('advice') || msg.includes('insight')) {
    return `### Aether AI · Simulation Mode\n\nBased on your dashboard metrics:\n- **Client count:** ${clients.length} active accounts\n- **Pipeline load:** ${allTasks.length} tasks (${highTasks.length} urgent)\n- **Financial health:** ${currencySymbol}${revenue.toLocaleString()} realized | ${currencySymbol}${pendingRevenue.toLocaleString()} pending\n\n**Aether's Growth Recommendations:**\n1. **Leverage current clients:** Reach out to your existing ${clients.length} clients for upselling opportunities or testimonials to build social proof.\n2. **Clear the pipeline:** Tackle the ${highTasks.length} high priority tasks to prevent project bottlenecks.\n3. **Collect pending bills:** Follow up on the **${pendingInvoices.length} outstanding invoices** worth **${currencySymbol}${pendingRevenue.toLocaleString()}** to maintain healthy working capital.`;
  }

  // Default simulated chat response
  return `### Aether AI · Simulation Mode\n\nHello! I'm Aether AI, running in **Simulation Mode** (no API key required).\n\nSince your external API keys have run out of credits or are not configured, I'm analyzing your agency's local database directly. I can help you with:\n\n* 👥 **Client Summaries**: Ask me about your *clients*\n* 📝 **Task Pipeline**: Ask me about your *tasks*\n* 📈 **Revenue & Invoices**: Ask me about *finances* or *revenue*\n* 💡 **Strategic Advice**: Ask for *growth advice* or *strategy*\n\nHow can I help you manage your agency today?`;
}

export async function POST(req: Request) {
  try {
    const { message, messages, context, model = 'gpt-4o-mini' } = await req.json();

    // ─── EXPLICIT SIMULATION MODE ─────────────────────────────────────────
    if (model === 'simulation') {
      const simulatedResponse = generateSimulationResponse(message, context);
      return NextResponse.json({
        content: simulatedResponse,
        source: 'simulation',
        model,
      });
    }

    // Build message history for context
    const history = (messages || []).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Build context summary to inject into system prompt
    const paidInvoices = context?.invoices?.filter((inv: any) => inv.status === 'Paid') || [];
    const revenue = paidInvoices.reduce((acc: number, inv: any) =>
      acc + parseFloat((inv.amount || '0').toString().replace(/[$,]/g, '')), 0);
    const clientCount = context?.clients?.length || 0;
    const taskCount = context?.tasks ? Object.values(context.tasks).flat().length : 0;

    const contextPrompt = clientCount > 0
      ? `\n\nCurrent business context: ${clientCount} clients, ${taskCount} active tasks, $${revenue.toLocaleString()} in realized revenue.`
      : '';

    const fullSystemPrompt = SYSTEM_PROMPT + contextPrompt;

    // ─── OPENAI ───────────────────────────────────────────────────────────
    if (model.startsWith('gpt')) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...history,
          { role: 'user', content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      });

      return NextResponse.json({
        content: completion.choices[0].message.content,
        source: 'openai',
        model,
      });
    }

    // ─── CLAUDE (ANTHROPIC) ───────────────────────────────────────────────
    if (model.startsWith('claude')) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const response = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        system: fullSystemPrompt,
        messages: [
          ...history,
          { role: 'user', content: message },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      return NextResponse.json({
        content: textContent?.text || 'No response generated.',
        source: 'claude',
        model,
      });
    }

    // ─── FALLBACK SIMULATION ──────────────────────────────────────────────
    const simulatedResponse = generateSimulationResponse(message, context);
    return NextResponse.json({
      content: simulatedResponse,
      source: 'simulation',
      model: 'simulation',
    });

  } catch (error: any) {
    console.error('Aether AI Error:', error?.message || error);

    const msg = (error?.message || '').toLowerCase();
    const status = error?.status;
    const errorCode = error?.code || '';

    // Handle Anthropic credit issue
    if (msg.includes('credit balance') || msg.includes('too low') || msg.includes('anthropic') || msg.includes('credit_balance')) {
      return NextResponse.json({
        content: '⚠️ **Anthropic Credit Balance Empty**\n\nYour Anthropic (Claude) account is out of credits.\n\n**How to resolve:**\n1. Go to your [Anthropic Console Billing](https://console.anthropic.com/settings/billing) to add credits.\n2. **Or switch to Simulation Mode** (or OpenAI if you have credits) using the model picker in the top right to keep testing the app!',
        source: 'error',
        model: 'error',
      });
    }

    // Handle Anthropic 404 / Model Not Found (e.g. Tier 0 / Unfunded Account restriction)
    if (status === 404 || msg.includes('not_found_error') || msg.includes('model: claude')) {
      return NextResponse.json({
        content: '⚠️ **Anthropic Model Access / Tier Limitation**\n\nThe Anthropic API returned a **404 Not Found** error for this model. This usually happens for one of two reasons:\n\n1. **Separate API Billing Required:** A consumer **Claude Pro subscription** (for the web interface at claude.ai) is **completely separate** from the **Anthropic Console API**. You need to deposit a minimum of **$5** onto your API developer account at [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing) to enable API access.\n2. **Tier 0 Restrictions:** New or unfunded API developer accounts are restricted from accessing newer/large models like Claude 4.6 Sonnet or Claude 4.8 Opus. Try switching to **Claude 4.5 Haiku** or **Simulation Mode** using the model picker in the top right to test the application for free!',
        source: 'error',
        model: 'error',
      });
    }

    // Handle OpenAI quota/billing issue
    if (msg.includes('quota') || msg.includes('billing') || msg.includes('exceeded your current quota') || errorCode === 'insufficient_quota') {
      return NextResponse.json({
        content: '⚠️ **OpenAI Quota Exceeded / Billing Issue**\n\nYour OpenAI API key has exceeded its usage quota or doesn\'t have enough credits loaded.\n\n**How to resolve:**\n1. Go to the [OpenAI Billing Dashboard](https://platform.openai.com/settings/organization/billing) and add credits or check your monthly limit.\n2. Make sure you have a credit balance set up for API usage (Note: a ChatGPT Plus subscription is separate from API usage).\n3. **Or switch to Simulation Mode** (or Claude) using the model picker in the top right to keep testing the app for free!',
        source: 'error',
        model: 'error',
      });
    }

    // Handle invalid key issue
    if (status === 401 || msg.includes('api key') || msg.includes('api_key') || msg.includes('unauthorized') || msg.includes('invalid api key')) {
      return NextResponse.json({
        content: '⚠️ **Invalid API Key**\n\nPlease check your `.env.local` file and verify that your OpenAI or Anthropic API key is correct, then restart your Next.js server.\n\n*Tip: You can switch to **Simulation Mode** using the model picker in the top right, which works offline and doesn\'t require any API keys.*',
        source: 'error',
        model: 'error',
      });
    }

    // General rate limit / 429 catch
    if (status === 429) {
      return NextResponse.json({
        content: '⚠️ **Rate Limit or Quota Reached**\n\nYou have sent too many requests or run out of credits. Please check your billing settings or wait a moment and try again.\n\n*Tip: You can switch to **Simulation Mode** using the model picker to avoid rate limits entirely!*',
        source: 'error',
        model: 'error',
      });
    }

    // Default fallback error message
    return NextResponse.json({
      content: `⚠️ **Aether AI Connection Error:** ${error?.message || 'Something went wrong.'}\n\nPlease check your API keys in your \`.env.local\` file or switch to **Simulation Mode** in the model picker to keep testing.`,
      source: 'error',
      model: 'error',
    });
  }
}

