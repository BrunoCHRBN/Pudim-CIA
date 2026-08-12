import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
        gap: "32px",
      }}
    >
      <Image
        src="/assets/logo.png"
        alt="Pudim & CIA Logo"
        width={220}
        height={88}
        priority
        style={{ filter: "drop-shadow(0 8px 24px rgba(20, 18, 33, 0.07))" }}
      />

      <div style={{ maxWidth: "520px" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            color: "var(--navy)",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          Pudim &amp; CIA
        </h1>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
            color: "var(--muted-dark)",
            lineHeight: 1.5,
            marginBottom: "24px",
          }}
        >
          Acolhimento e Sabor Artesanal em cada detalhe
        </p>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--muted)",
            lineHeight: 1.7,
          }}
        >
          Estamos migrando para uma nova plataforma.
          <br />A experiência completa estará disponível em breve.
        </p>
      </div>

      <Link
        href="/legacy/index.html"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "var(--navy)",
          color: "var(--cream)",
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          fontWeight: 700,
          letterSpacing: "0.03em",
          padding: "16px 40px",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-soft)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        Acessar Site Atual →
      </Link>
    </main>
  );
}
