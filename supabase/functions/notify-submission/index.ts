import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const adminLink = `${SUPABASE_URL.replace('.supabase.co', '')}/admin/dashboard`;

    switch (type) {
      case 'job_application':
        subject = `📋 New Job Application: ${data.full_name}`;
        body = `
          <h2>New Job Application Received</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${data.full_name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.phone || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">City</td><td style="padding:8px;border-bottom:1px solid #eee">${data.city || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Job</td><td style="padding:8px;border-bottom:1px solid #eee">${data.job_title || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Cover Letter</td><td style="padding:8px;border-bottom:1px solid #eee">${data.cover_letter || '—'}</td></tr>
            ${data.resume_url ? `<tr><td style="padding:8px;font-weight:bold">CV</td><td style="padding:8px"><a href="${data.resume_url}">Download CV</a></td></tr>` : ''}
          </table>
        `;
        break;

      case 'employer_request':
        subject = `🏢 New Employer Request: ${data.company_name}`;
        body = `
          <h2>New Employer Request Received</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Company</td><td style="padding:8px;border-bottom:1px solid #eee">${data.company_name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Contact</td><td style="padding:8px;border-bottom:1px solid #eee">${data.contact_person}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.phone || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Industry</td><td style="padding:8px;border-bottom:1px solid #eee">${data.industry || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Job Title</td><td style="padding:8px;border-bottom:1px solid #eee">${data.job_title || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Employees Needed</td><td style="padding:8px;border-bottom:1px solid #eee">${data.employees_needed || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Urgency</td><td style="padding:8px;border-bottom:1px solid #eee">${data.urgency || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Comments</td><td style="padding:8px">${data.comments || '—'}</td></tr>
          </table>
        `;
        break;

      case 'candidate_registration':
        subject = `👤 New Candidate Registration: ${data.full_name}`;
        body = `
          <h2>New Candidate Registration Received</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${data.full_name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.phone}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Availability</td><td style="padding:8px;border-bottom:1px solid #eee">${data.availability || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Industry</td><td style="padding:8px;border-bottom:1px solid #eee">${data.industry || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Work Location</td><td style="padding:8px;border-bottom:1px solid #eee">${data.work_location || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">License</td><td style="padding:8px;border-bottom:1px solid #eee">${data.license_class || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Comments</td><td style="padding:8px">${data.comments || '—'}</td></tr>
          </table>
        `;
        break;

      case 'contact_message':
        subject = `✉️ New Contact Message: ${data.subject}`;
        body = `
          <h2>New Contact Message</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Name</td><td style="padding:8px;border-bottom:1px solid #eee">${data.name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Phone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.phone || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Subject</td><td style="padding:8px;border-bottom:1px solid #eee">${data.subject}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${data.message}</td></tr>
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

    // Send email using Supabase's built-in email (via database insert for logging)
    // For actual email delivery, we log the notification. 
    // In production, integrate with Resend or similar service.
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
