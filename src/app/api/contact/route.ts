import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      message,
    } = body;

    // Vérification des types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Données invalides.",
        },
        { status: 400 }
      );
    }

    // Nettoyage
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();

    // Champs obligatoires
    if (
      !cleanName ||
      !cleanEmail ||
      !cleanMessage
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tous les champs sont obligatoires.",
        },
        { status: 400 }
      );
    }

    // Limites
    if (cleanName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Nom trop long.",
        },
        { status: 400 }
      );
    }

    if (cleanEmail.length > 254) {
      return NextResponse.json(
        {
          success: false,
          message: "Email trop long.",
        },
        { status: 400 }
      );
    }

    if (cleanMessage.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: "Message trop long.",
        },
        { status: 400 }
      );
    }

    // Vérification simple de l'email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse email invalide.",
        },
        { status: 400 }
      );
    }

    const { data, error } =
      await resend.emails.send({
        from: "Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_EMAIL!],
        replyTo: cleanEmail,
        subject: `Nouveau message de ${cleanName}`,
        text: `
Nom : ${cleanName}

Email : ${cleanEmail}

Message :

${cleanMessage}
        `,
      });

    if (error) {
      console.error(
        "Erreur Resend :",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Impossible d'envoyer le message.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message envoyé.",
      id: data?.id,
    });
  } catch (error) {
    console.error(
      "Erreur API contact :",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue.",
      },
      { status: 500 }
    );
  }
}