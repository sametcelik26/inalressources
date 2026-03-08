import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Escape HTML special characters to prevent injection */
function esc(value: unknown): string {
  const str = String(value ?? '—');
  if (str === '' || str === 'undefined' || str === 'null') return '—';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Sanitize a URL — only allow http(s) schemes */
function escUrl(value: unknown): string {
  const str = String(value ?? '');
  if (!str) return '';
  try {
    const url = new URL(str);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href.replace(/"/g, '%22').replace(/'/g, '%27');
    }
  } catch { /* invalid URL */ }
  return '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    // Build email content based on submission type
    let subject = '';
    let body = '';

    const row = (label: string, val: unknown) =>
      `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">${esc(label)}</td><td style="padding:8px;border-bottom:1px solid #eee">${esc(val)}</td></tr>`;

    const rowLast = (label: string, val: unknown) =>
      `<tr><td style="padding:8px;font-weight:bold">${esc(label)}</td><td style="padding:8px">${esc(val)}</td></tr>`;

    switch (type) {
      case 'job_application': {
        subject = `📋 New Job Application: ${esc(data.full_name)}`;
        const cvUrl = escUrl(data.resume_url);
        body = `
          <h2>New Job Application Received</h2>
          <table style="border-collapse:collapse;width:100%">
            ${row('Name', data.full_name)}
            ${row('Email', data.email)}
            ${row('Phone', data.phone)}
            ${row('City', data.city)}
            ${row('Job', data.job_title)}
            ${row('Cover Letter', data.cover_letter)}
            ${cvUrl ? `<tr><td style="padding:8px;font-weight:bold">CV</td><td style="padding:8px"><a href="${cvUrl}">Download CV</a></td></tr>` : ''}
          </table>
        `;
        break;
      }

      case 'employer_request':
        subject = `🏢 New Employer Request: ${esc(data.company_name)}`;
        body = `
          <h2>New Employer Request Received</h2>
          <table style="border-collapse:collapse;width:100%">
            ${row('Company', data.company_name)}
            ${row('Contact', data.contact_person)}
            ${row('Email', data.email)}
            ${row('Phone', data.phone)}
            ${row('Industry', data.industry)}
            ${row('Job Title', data.job_title)}
            ${row('Employees Needed', data.employees_needed)}
            ${row('Urgency', data.urgency)}
            ${rowLast('Comments', data.comments)}
          </table>
        `;
        break;

      case 'candidate_registration':
        subject = `👤 New Candidate Registration: ${esc(data.full_name)}`;
        body = `
          <h2>New Candidate Registration Received</h2>
          <table style="border-collapse:collapse;width:100%">
            ${row('Name', data.full_name)}
            ${row('Email', data.email)}
            ${row('Phone', data.phone)}
            ${row('Availability', data.availability)}
            ${row('Industry', data.industry)}
            ${row('Work Location', data.work_location)}
            ${row('License', data.license_class)}
            ${rowLast('Comments', data.comments)}
          </table>
        `;
        break;

      case 'contact_message':
        subject = `✉️ New Contact Message: ${esc(data.subject)}`;
        body = `
          <h2>New Contact Message</h2>
          <table style="border-collapse:collapse;width:100%">
            ${row('Name', data.name)}
            ${row('Email', data.email)}
            ${row('Phone', data.phone)}
            ${row('Subject', data.subject)}
            ${rowLast('Message', data.message)}
          </table>
        `;
        break;

      default:
        throw new Error(`Unknown submission type: ${type}`);
    }

    // Build full HTML email
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
        <div style="background:#0D3B66;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:20px">Inal Ressources</h1>
          <p style="margin:5px 0 0;font-size:12px;opacity:0.8">Notification System</p>
        </div>
        <div style="background:white;padding:24px;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px">
          ${body}
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;text-align:center">
            <a href="https://inalressources.info/admin/dashboard" style="display:inline-block;background:#F95738;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">View in Admin Panel</a>
          </div>
        </div>
        <p style="text-align:center;color:#999;font-size:11px;margin-top:16px">
          This is an automated notification from inalressources.info
        </p>
      </body>
      </html>
    `;

    console.log(`Email notification prepared: ${subject}`);
    console.log(`To: info@inalressources.com`);
    console.log(`Body length: ${htmlEmail.length}`);

    // Try to send via Resend if API key is available
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Inal Ressources <notifications@inalressources.info>',
          to: ['info@inalressources.com'],
          subject,
          html: htmlEmail,
        }),
      });
      const emailResult = await emailRes.json();
      console.log('Resend result:', emailResult);
    } else {
      console.log('RESEND_API_KEY not configured — email notification logged but not sent');
    }

    return new Response(
      JSON.stringify({ success: true, subject }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Notification error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
