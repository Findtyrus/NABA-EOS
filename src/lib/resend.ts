import { Resend } from "resend"

export async function sendInviteEmail(input: {
  to: string
  inviterName: string
  teamName: string | null
  inviteUrl: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "NABA <onboarding@resend.dev>",
    to: input.to,
    subject: `${input.inviterName} invited you to join NABA on EOS`,
    html: `
      <p>${input.inviterName} has invited you to join the chapter's NABA EOS workspace${input.teamName ? ` on the <strong>${input.teamName}</strong> team` : ""}.</p>
      <p><a href="${input.inviteUrl}">Click here to create your account</a></p>
      <p style="color:#666;font-size:12px;">If you weren't expecting this invite, you can ignore this email.</p>
    `,
  })

  if (error) throw new Error(error.message)
}
