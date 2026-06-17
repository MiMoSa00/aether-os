import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are Aether AI, the intelligent core of Aether OS — a premium agency management platform. 
You are helpful, strategic, concise, and brilliant. You help agency owners manage clients, tasks, invoices, and revenue.
When given business context, use it to give smart, data-driven insights. All finances and calculations must be discussed in Nigerian Naira (₦).

You can perform actions on behalf of the user (creating tasks, clients, and proposals).
If the user asks you to create a task, client, or proposal, you MUST specify the action in your response.

To return actions, you MUST return a valid JSON object with the following keys:
1. "content": Your markdown-formatted text response to the user.
2. "actions": An array of action objects. Each action must have:
   - "type": "CREATE_TASK" | "CREATE_CLIENT" | "CREATE_PROPOSAL"
   - "payload": The parameters for the action:
     - For "CREATE_TASK": { "content": string, "priority": "High" | "Medium" | "Low" } (defaults to "Medium")
     - For "CREATE_CLIENT": { "name": string, "role": string, "email": string, "phone": string }
     - For "CREATE_PROPOSAL": { "client": string, "title": string, "scope": string, "deliverables": string, "timeline": string, "price": string }

Example response for creating a task:
{
  "content": "I have created the task **Review contracts** with **High** priority for you.",
  "actions": [
    {
      "type": "CREATE_TASK",
      "payload": { "content": "Review contracts", "priority": "High" }
    }
  ]
}

If the user does not request any action, return an empty actions array:
{
  "content": "Your regular response here...",
  "actions": []
}

IMPORTANT: You must ONLY output the raw JSON object. Do not include markdown codeblocks (like \`\`\`json) in your raw response, just output the JSON directly. All references to financial values must be represented in Nigerian Naira (₦).`;

interface SimResponse {
  content: string;
  actions?: any[];
}

// Robust simulated response generator for Simulation Mode
function generateSimulationResponse(message: string, context: any): SimResponse {
  const msg = message.toLowerCase();
  
  // Extract context details safely
  const clients = context?.clients || [];
  const invoices = context?.invoices || [];
  const tasksObj = context?.tasks || {};
  const payments = context?.payments || [];
  
  // Parse invoices + payments
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'Paid') || [];
  const pendingInvoices = invoices.filter((inv: any) => inv.status === 'Pending') || [];
  
  const invoiceRevenue = paidInvoices.reduce((acc: number, inv: any) =>
    acc + parseFloat((inv.amount || '0').toString().replace(/[$,₦]/g, '')), 0);

  const subscriptionRevenue = payments
    .filter((pmt: any) => pmt.status === 'success')
    .reduce((acc: number, pmt: any) => acc + (pmt.amount_ngn || 0), 0);

  const revenue = invoiceRevenue + subscriptionRevenue;
    
  const pendingRevenue = pendingInvoices.reduce((acc: number, inv: any) =>
    acc + parseFloat((inv.amount || '0').toString().replace(/[$,₦]/g, '')), 0);

  // Parse tasks
  const allTasks = Object.values(tasksObj).flat() as any[];
  const highTasks = allTasks.filter((t: any) => t.priority === 'High');
  const mediumTasks = allTasks.filter((t: any) => t.priority === 'Medium');
  const lowTasks = allTasks.filter((t: any) => t.priority === 'Low');

  const currencySymbol = '₦';

  // Triggers for creating items in Simulation Mode
  if (msg.includes('create task') || msg.includes('add task')) {
    const rawContent = message.replace(/(create task|add task)[:\s]*/i, '').trim();
    if (rawContent) {
      let content = rawContent;
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      
      // Check priority keywords
      if (msg.includes('high')) {
        priority = 'High';
        content = rawContent.replace(/\(?high\)?/i, '').trim();
      } else if (msg.includes('low')) {
        priority = 'Low';
        content = rawContent.replace(/\(?low\)?/i, '').trim();
      } else if (msg.includes('medium')) {
        content = rawContent.replace(/\(?medium\)?/i, '').trim();
      }
      
      return {
        content: `### Aether AI · Simulation Mode\n\nI have created a new task on your Kanban board:\n- **Task:** "${content}"\n- **Priority:** ${priority}\n\nThis has been saved in real-time.`,
        actions: [{
          type: 'CREATE_TASK',
          payload: { content, priority }
        }]
      };
    }
  }

  if (msg.includes('create client') || msg.includes('add client')) {
    const rawContent = message.replace(/(create client|add client)[:\s]*/i, '').trim();
    if (rawContent) {
      const parts = rawContent.split(',').map(p => p.trim());
      const name = parts[0] || 'New Client';
      const role = parts[1] || 'Consultant';
      const email = parts[2] || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`;
      const phone = parts[3] || '+234 800 000 0000';
      
      return {
        content: `### Aether AI · Simulation Mode\n\nI have registered a new client node:\n- **Name:** ${name}\n- **Role:** ${role}\n- **Email:** ${email}\n- **Phone:** ${phone}\n\nThis client has been logged.`,
        actions: [{
          type: 'CREATE_CLIENT',
          payload: { name, role, email, phone }
        }]
      };
    }
  }

  if (msg.includes('create proposal') || msg.includes('add proposal')) {
    const rawContent = message.replace(/(create proposal|add proposal)[:\s]*/i, '').trim();
    if (rawContent) {
      const parts = rawContent.split(',').map(p => p.trim());
      const client = parts[0] || 'Client Name';
      const title = parts[1] || 'Project Brief';
      const scope = parts[2] || 'Detailed project design and deployment';
      const deliverables = parts[3] || 'Completed build, source code, deployment assets';
      const timeline = parts[4] || '4 Weeks';
      const price = parts[5] || '500000';
      
      return {
        content: `### Aether AI · Simulation Mode\n\nI have generated a new business proposal for **${client}**:\n- **Title:** "${title}"\n- **Project Scope:** ${scope}\n- **Price:** ₦${parseFloat(price).toLocaleString()}\n\nThis proposal has been drafted.`,
        actions: [{
          type: 'CREATE_PROPOSAL',
          payload: { client, title, scope, deliverables, timeline, price }
        }]
      };
    }
  }

  if (msg.includes('client') || msg.includes('customer')) {
    if (clients.length === 0) {
      return {
        content: `### Aether AI · Simulation Mode\n\nNo clients found in your workspace database.\n\n💡 **Tip:** Add some clients on the **Clients** dashboard page, or tell me: \`create client: John Doe, Designer, john@doe.com, +2348012345678\``
      };
    }
    
    let clientList = clients.map((c: any) => `- **${c.name}** (${c.role}) — Email: \`${c.email}\` | Phone: \`${c.phone}\``).join('\n');
    return {
      content: `### Aether AI · Simulation Mode\n\nHere is a list of your **${clients.length} clients**:\n\n${clientList}\n\n**Strategic Recommendation:** Keeping active engagement with these key stakeholders is crucial. Let me know if you would like me to draft a follow-up email template for any of them!`
    };
  }

  if (msg.includes('task') || msg.includes('todo') || msg.includes('progress') || msg.includes('board') || msg.includes('pipeline')) {
    if (allTasks.length === 0) {
      return {
        content: `### Aether AI · Simulation Mode\n\nNo tasks found in your project board.\n\n💡 **Tip:** Add tasks on the **Tasks** board page, or tell me: \`create task: Design User Interface (High)\``
      };
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

    return {
      content: `### Aether AI · Simulation Mode\n\nYou have **${allTasks.length} active tasks** in your agency pipeline:\n${taskBreakdown}\n\n**Aether Suggestion:** Focus on completing your High Priority tasks first to minimize project delivery bottlenecks.`
    };
  }

  if (msg.includes('revenue') || msg.includes('invoice') || msg.includes('money') || msg.includes('finance') || msg.includes('paid') || msg.includes('earnings') || msg.includes('balance') || msg.includes('payments')) {
    if (invoices.length === 0 && payments.length === 0) {
      return {
        content: `### Aether AI · Simulation Mode\n\nNo financial activity found in your database.\n\n💡 **Tip:** Create a new invoice on the **Finance** page or make a test subscription on the **Billing** page to update revenue metrics!`
      };
    }

    let invoiceList = invoices.map((inv: any) => `- **${inv.id}** for *${inv.client}*: **${inv.amount}** (${inv.status === 'Paid' ? '✅ Paid' : '⏳ Pending'})`).join('\n');
    let paymentList = payments.map((pmt: any) => `- **Subscription Checkout** for *${pmt.plan_id.toUpperCase()}*: **₦${pmt.amount_ngn.toLocaleString()}** (${pmt.status === 'success' ? '✅ Successful' : '⏳ Failed'})`).join('\n');
    
    return {
      content: `### Aether AI · Simulation Mode\n\n### Financial Overview:\n- **Realized Revenue:** ${currencySymbol}${revenue.toLocaleString()}\n- **Outstanding Revenue:** ${currencySymbol}${pendingRevenue.toLocaleString()} (${pendingInvoices.length} pending invoices)\n\n**Invoice breakdown:**\n${invoiceList || 'No invoices logged'}\n\n**Subscription Checkouts:**\n${paymentList || 'No subscription checkouts logged'}\n\n**Aether Advice:** Keep track of your client milestones to keep inflows coming.`
    };
  }

  if (msg.includes('strategy') || msg.includes('grow') || msg.includes('marketing') || msg.includes('improve') || msg.includes('advice') || msg.includes('insight')) {
    return {
      content: `### Aether AI · Simulation Mode\n\nBased on your dashboard metrics:\n- **Client count:** ${clients.length} active accounts\n- **Pipeline load:** ${allTasks.length} tasks (${highTasks.length} urgent)\n- **Financial health:** ${currencySymbol}${revenue.toLocaleString()} realized | ${currencySymbol}${pendingRevenue.toLocaleString()} pending\n\n**Aether's Growth Recommendations:**\n1. **Leverage current clients:** Reach out to your existing ${clients.length} clients for upselling opportunities or testimonials to build social proof.\n2. **Clear the pipeline:** Tackle the ${highTasks.length} high priority tasks to prevent project bottlenecks.\n3. **Collect pending bills:** Follow up on the **${pendingInvoices.length} outstanding invoices** worth **${currencySymbol}${pendingRevenue.toLocaleString()}** to maintain healthy working capital.`
    };
  }

  // Default simulated chat response
  return {
    content: `### Aether AI · Simulation Mode\n\nHello! I'm Aether AI, running in **Simulation Mode** (no API key required).\n\nSince your external API keys have run out of credits or are not configured, I'm analyzing your agency's local database directly. I can help you with:\n\n* 👥 **Client Summaries**: Ask me about your *clients*\n* 📝 **Task Pipeline**: Ask me about your *tasks*\n* 📈 **Revenue & Invoices**: Ask me about *finances* or *revenue*\n* 💡 **Strategic Advice**: Ask for *growth advice* or *strategy*\n\n**Interactive Action Commands:**\n* To add a task, try: \`create task: Design User Interface (High)\`\n* To add a client, try: \`create client: John Doe, Lead developer, john@aether.com, +234 812 345 6789\`\n* To add a proposal, try: \`create proposal: John Doe, Website Build, Design & code landing page, Figma assets + Next.js build, 3 weeks, 450000\``
  };
}

export async function POST(req: Request) {
  try {
    const { message, messages, context, model = 'gpt-4o-mini' } = await req.json();

    // ─── EXPLICIT SIMULATION MODE ─────────────────────────────────────────
    if (model === 'simulation') {
      const simulatedResult = generateSimulationResponse(message, context);
      return NextResponse.json({
        content: simulatedResult.content,
        actions: simulatedResult.actions || [],
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
    const invoiceRevenue = paidInvoices.reduce((acc: number, inv: any) =>
      acc + parseFloat((inv.amount || '0').toString().replace(/[$,₦]/g, '')), 0);

    const subscriptionRevenue = (context?.payments || [])
      .filter((pmt: any) => pmt.status === 'success')
      .reduce((acc: number, pmt: any) => acc + (pmt.amount_ngn || 0), 0);

    const revenue = invoiceRevenue + subscriptionRevenue;

    const clientCount = context?.clients?.length || 0;
    const taskCount = context?.tasks ? Object.values(context.tasks).flat().length : 0;

    const contextPrompt = clientCount > 0 || revenue > 0
      ? `\n\nCurrent business context: ${clientCount} clients, ${taskCount} active tasks, ₦${revenue.toLocaleString()} in realized revenue (which includes invoice settlements and subscription payments).`
      : '';

    const fullSystemPrompt = SYSTEM_PROMPT + contextPrompt;

    let replyText = '';
    let apiSource = 'unknown';

    // ─── OPENAI ───────────────────────────────────────────────────────────
    if (model.startsWith('gpt')) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      apiSource = 'openai';

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...history,
          { role: 'user', content: message },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1024,
        temperature: 0.7,
      });

      replyText = completion.choices[0].message.content || '{}';
    }
    // ─── CLAUDE (ANTHROPIC) ───────────────────────────────────────────────
    else if (model.startsWith('claude')) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      apiSource = 'claude';

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
      replyText = textContent?.text || '{}';
    }
    // ─── FALLBACK SIMULATION ──────────────────────────────────────────────
    else {
      const simulatedResult = generateSimulationResponse(message, context);
      return NextResponse.json({
        content: simulatedResult.content,
        actions: simulatedResult.actions || [],
        source: 'simulation',
        model: 'simulation',
      });
    }

    // Parse JSON safely from LLM response
    let parsedReply = { content: replyText, actions: [] };
    try {
      let cleanText = replyText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      parsedReply = JSON.parse(cleanText.trim());
    } catch (e) {
      console.warn('Failed to parse AI response as JSON, falling back to text:', replyText);
      parsedReply = { content: replyText, actions: [] };
    }

    return NextResponse.json({
      content: parsedReply.content || replyText,
      actions: parsedReply.actions || [],
      source: apiSource,
      model,
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
        content: '⚠️ **Anthropic Model Access / Tier Limitation**\n\nThe Anthropic API returned a **404 Not Found** error for this model. Try switching to **Claude 4.5 Haiku** or **Simulation Mode** using the model picker in the top right to test the application for free!',
        source: 'error',
        model: 'error',
      });
    }

    // Handle OpenAI quota/billing issue
    if (msg.includes('quota') || msg.includes('billing') || msg.includes('exceeded your current quota') || errorCode === 'insufficient_quota') {
      return NextResponse.json({
        content: '⚠️ **OpenAI Quota Exceeded / Billing Issue**\n\nYour OpenAI API key has exceeded its usage quota or doesn\'t have enough credits loaded.\n\n**How to resolve:**\n1. Go to the [OpenAI Billing Dashboard](https://platform.openai.com/settings/organization/billing) and add credits.\n2. **Or switch to Simulation Mode** using the model picker in the top right to keep testing the app for free!',
        source: 'error',
        model: 'error',
      });
    }

    // Handle invalid key issue
    if (status === 401 || msg.includes('api key') || msg.includes('api_key') || msg.includes('unauthorized') || msg.includes('invalid api key')) {
      return NextResponse.json({
        content: '⚠️ **Invalid API Key**\n\nPlease check your `.env.local` file and verify that your OpenAI or Anthropic API key is correct.\n\n*Tip: You can switch to **Simulation Mode** using the model picker in the top right, which works offline and doesn\'t require any API keys.*',
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

