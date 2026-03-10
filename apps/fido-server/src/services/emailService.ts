interface WelcomeEmailParams {
  to: string;
  firstName: string;
  defaultPassword: string;
}

async function sendWithResend({ to, firstName, defaultPassword }: WelcomeEmailParams) {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  await resend.emails.send({
    from,
    to,
    subject: 'Bienvenue chez WL Bank - Vos identifiants',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #277777; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">WL Bank</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Powered by Worldline</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">Bonjour ${firstName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Nous avons le plaisir de vous accueillir chez WL Bank. Votre compte a été créé avec succès.
          </p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #6b7280; margin: 0 0 8px; font-size: 14px;">Votre mot de passe temporaire :</p>
            <p style="color: #1f2937; font-size: 24px; font-weight: bold; margin: 0; font-family: monospace; letter-spacing: 2px;">${defaultPassword}</p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            Nous vous recommandons de configurer une passkey dès votre première connexion pour une authentification plus sécurisée.
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 30px;">
            Cordialement,<br>L'équipe WL Bank
          </p>
        </div>
      </div>
    `,
  });
}

function logWelcomeEmail({ to, firstName, defaultPassword }: WelcomeEmailParams) {
  console.log('──────────────────────────────────────────');
  console.log(`📧 Welcome email (dev mode)`);
  console.log(`   To: ${to}`);
  console.log(`   Name: ${firstName}`);
  console.log(`   Password: ${defaultPassword}`);
  console.log('──────────────────────────────────────────');
}

export async function sendWelcomeEmail(to: string, firstName: string, defaultPassword: string) {
  const params = { to, firstName, defaultPassword };

  if (process.env.RESEND_API_KEY) {
    await sendWithResend(params);
    console.log(`Welcome email sent to ${to} via Resend`);
  } else {
    logWelcomeEmail(params);
  }
}
