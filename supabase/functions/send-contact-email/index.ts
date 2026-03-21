import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Save to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({ name, email, phone: phone || null, subject, message });

    if (dbError) {
      console.error('DB insert error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Send email via mail.ru SMTP
    // Credentials stored in Supabase Secrets (never in code):
    //   supabase secrets set SMTP_USER=mmosow@mail.ru SMTP_PASS=<app_password>
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');

    if (smtpUser && smtpPass) {
      const client = new SmtpClient();
      await client.connectTLS({
        hostname: 'smtp.mail.ru',
        port: 465,
        username: smtpUser,
        password: smtpPass,
      });

      // Notification to hotel
      await client.send({
        from: smtpUser,
        to: smtpUser,
        subject: `[Меганом] Новое сообщение: ${subject}`,
        content: 'text/html',
        html: `
          <h2>Новое сообщение с сайта Меганом Эко-дом</h2>
          <p><strong>Имя:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Телефон:</strong> ${phone || '—'}</p>
          <p><strong>Тема:</strong> ${subject}</p>
          <p><strong>Сообщение:</strong></p>
          <p>${message}</p>
        `,
      });

      // Auto-reply to user
      await client.send({
        from: smtpUser,
        to: email,
        subject: 'Мы получили ваше сообщение — Меганом Эко-дом',
        content: 'text/html',
        html: `
          <h2>Здравствуйте, ${name}!</h2>
          <p>Благодарим за обращение. Мы получили ваше сообщение и свяжемся с вами в ближайшее время.</p>
          <p>С уважением,<br/>Команда Меганом Эко-дом</p>
        `,
      });

      await client.close();
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
