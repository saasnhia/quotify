import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

/* ── Brand colors ─────────────────────────────────── */
const C = {
  bg: "#0A0A0A",
  violet: "#6366F1",
  emerald: "#22D3A5",
  white: "#FFFFFF",
  whiteAlpha: "rgba(255,255,255,0.7)",
  whiteAlpha2: "rgba(255,255,255,0.12)",
};

const font = fontFamily;

/* ── Helpers ──────────────────────────────────────── */

function FadeIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame: frame - delay, fps, config: { damping: 30 } });
  const y = interpolate(opacity, [0, 1], [30, 0]);
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
}

function ScaleIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, mass: 0.6 } });
  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  return (
    <div style={{ opacity: progress, transform: `scale(${scale})`, ...style }}>
      {children}
    </div>
  );
}

function GradientText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        background: `linear-gradient(135deg, ${C.violet}, ${C.emerald})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ── Typing animation ────────────────────────────── */

function TypeText({
  text,
  delay = 0,
  style,
}: {
  text: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - delay);
  const charsPerFrame = 0.8;
  const visibleChars = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  const showCursor = elapsed % 16 < 10;

  return (
    <span style={{ fontFamily: "monospace", ...style }}>
      {text.slice(0, visibleChars)}
      {visibleChars < text.length && showCursor && (
        <span style={{ backgroundColor: C.emerald, color: C.emerald }}>|</span>
      )}
    </span>
  );
}

/* ── Logo SVG ─────────────────────────────────────── */

function Logo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill={C.violet} />
      <path
        d="M14 12C14 10.8954 14.8954 10 16 10H27L34 17V36C34 37.1046 33.1046 38 32 38H16C14.8954 38 14 37.1046 14 36V12Z"
        fill="white"
        opacity="0.9"
      />
      <path d="M25 18L20 26H24L22 34L29 24H25L27 18Z" fill={C.violet} />
    </svg>
  );
}

/* ── Glow background ──────────────────────────────── */

function GlowBg() {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 30) * 0.15 + 0.85;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.violet}25, transparent 70%)`,
          opacity: pulse,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.emerald}20, transparent 70%)`,
          opacity: pulse,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </AbsoluteFill>
  );
}

/* ── Perspective Mockup (inspired by Remotion ref) ── */

function MockupFrame({
  src,
  delay = 0,
  tiltDirection = "left",
}: {
  src: string;
  delay?: number;
  tiltDirection?: "left" | "right";
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.8 } });

  const rotateY = tiltDirection === "left" ? 8 : -8;
  const rotateX = 4;
  const startY = 80;

  const y = interpolate(progress, [0, 1], [startY, 0]);
  const currentRotateY = interpolate(progress, [0, 1], [rotateY * 2, rotateY]);

  return (
    <div
      style={{
        opacity: progress,
        transform: `perspective(1200px) rotateY(${currentRotateY}deg) rotateX(${rotateX}deg) translateY(${y}px)`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${C.violet}20`,
        border: `1px solid rgba(255,255,255,0.1)`,
        maxWidth: 820,
      }}
    >
      <Img src={src} style={{ width: "100%", display: "block" }} />
    </div>
  );
}

/* ── Scene 1: Logo reveal (0-3s = 0-90 frames) ───── */

function Scene1() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({ frame, fps, config: { damping: 15, mass: 0.8 } });
  const textOpacity = spring({ frame: frame - 20, fps, config: { damping: 30 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
        <div style={{ transform: `scale(${logoScale})` }}>
          <Logo size={140} />
        </div>
        <div
          style={{
            opacity: textOpacity,
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: C.white,
              letterSpacing: -2,
              fontFamily: font,
            }}
          >
            Devizly
          </span>
        </div>
        <FadeIn delay={35}>
          <p
            style={{
              fontSize: 28,
              color: C.whiteAlpha,
              marginTop: 16,
              fontFamily: font,
            }}
          >
            Devis IA en 30 secondes
          </p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 2: Problem (3-5.5s = 90-165 frames) ───── */

function Scene2() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const counterProgress = spring({ frame: frame - 12, fps, config: { damping: 40, mass: 1.5 } });
  const counterValue = Math.round(interpolate(counterProgress, [0, 1], [0, 45]));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, padding: 60, textAlign: "center" }}>
        <FadeIn>
          <p style={{ fontSize: 34, color: C.whiteAlpha, fontFamily: font, marginBottom: 16 }}>
            Vous perdez encore
          </p>
        </FadeIn>
        <FadeIn delay={8}>
          <p style={{ fontSize: 90, fontWeight: 900, color: C.white, fontFamily: font, lineHeight: 1.1 }}>
            <GradientText>{counterValue} min</GradientText>
          </p>
        </FadeIn>
        <FadeIn delay={18}>
          <p style={{ fontSize: 34, color: C.whiteAlpha, fontFamily: font, marginTop: 16 }}>
            par devis ?
          </p>
        </FadeIn>

        <FadeIn delay={40}>
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
            <span style={{ fontSize: 38, color: "rgba(255,255,255,0.25)", textDecoration: "line-through", fontFamily: font }}>
              Word / Excel
            </span>
            <span style={{ fontSize: 38, color: C.emerald, fontFamily: font, fontWeight: 700 }}>
              {"->  30s"}
            </span>
          </div>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 3: AI Demo with screenshot (5.5-9.5s = 165-285) ── */

function Scene3() {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, textAlign: "center", padding: "0 40px" }}>
        <FadeIn>
          <p style={{ fontSize: 40, fontWeight: 700, color: C.white, fontFamily: font, marginBottom: 12 }}>
            Decrivez, l&apos;IA genere
          </p>
        </FadeIn>
        <FadeIn delay={10}>
          <div
            style={{
              background: C.whiteAlpha2,
              borderRadius: 14,
              padding: "18px 28px",
              border: `1px solid ${C.violet}40`,
              display: "inline-block",
              marginBottom: 30,
              maxWidth: 700,
            }}
          >
            <TypeText
              text={'"Renovation salle de bain, douche italienne + WC suspendu..."'}
              delay={20}
              style={{ fontSize: 22, color: C.emerald, lineHeight: 1.5 }}
            />
          </div>
        </FadeIn>
        <FadeIn delay={15}>
          <MockupFrame
            src={staticFile("marketing/screenshot-nouveau.png")}
            delay={20}
            tiltDirection="left"
          />
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 4: Result screenshot (9.5-12.5s = 285-375) ── */

function Scene4() {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, textAlign: "center", padding: "0 40px" }}>
        <FadeIn>
          <p style={{ fontSize: 40, fontWeight: 700, color: C.white, fontFamily: font, marginBottom: 8 }}>
            Devis pro en{" "}
            <GradientText>30 secondes</GradientText>
          </p>
        </FadeIn>
        <FadeIn delay={8}>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 24 }}>
            {[
              { icon: "AI", label: "IA Mistral", color: C.violet },
              { icon: "PDF", label: "Export PDF", color: C.emerald },
              { icon: "WA", label: "WhatsApp", color: C.violet },
            ].map((f, i) => (
              <ScaleIn key={f.label} delay={12 + i * 8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: C.whiteAlpha2,
                    borderRadius: 12,
                    padding: "10px 18px",
                    border: `1px solid ${f.color}30`,
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800, color: f.color, fontFamily: font }}>
                    {f.icon}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: C.white, fontFamily: font }}>
                    {f.label}
                  </span>
                </div>
              </ScaleIn>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={15}>
          <MockupFrame
            src={staticFile("marketing/screenshot-devis.png")}
            delay={18}
            tiltDirection="right"
          />
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 5: CTA (12.5-15s = 375-450 frames) ────── */

function Scene5() {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame / 8) * 3;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <GlowBg />
      <div style={{ zIndex: 1, textAlign: "center" }}>
        <ScaleIn>
          <Logo size={90} />
        </ScaleIn>
        <FadeIn delay={8}>
          <p style={{ fontSize: 56, fontWeight: 800, color: C.white, fontFamily: font, marginTop: 24, lineHeight: 1.2 }}>
            Essayez{" "}
            <GradientText>gratuitement</GradientText>
          </p>
        </FadeIn>

        <FadeIn delay={18}>
          <div style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 28 }}>
            {[
              { value: "+80%", label: "plus rapide", color: C.emerald },
              { value: "3x", label: "signatures", color: C.violet },
              { value: "2x", label: "plus vite paye", color: C.emerald },
            ].map((m) => (
              <div key={m.value} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: m.color, fontFamily: font }}>{m.value}</span>
                <span style={{ fontSize: 16, color: C.whiteAlpha, fontFamily: font }}>{m.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={28}>
          <div style={{ marginTop: 32, transform: `translateY(${pulse}px)` }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: `linear-gradient(135deg, ${C.violet}, ${C.emerald})`,
                borderRadius: 16,
                padding: "20px 48px",
                boxShadow: `0 10px 40px ${C.violet}40`,
              }}
            >
              <span style={{ fontSize: 30, fontWeight: 700, color: C.white, fontFamily: font }}>
                devizly.com
              </span>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={36}>
          <p style={{ fontSize: 20, color: C.whiteAlpha, marginTop: 20, fontFamily: font }}>
            Gratuit - Sans carte bancaire
          </p>
        </FadeIn>
      </div>
    </AbsoluteFill>
  );
}

/* ── Main Composition ─────────────────────────────── */

export const DevizlyAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence from={0} durationInFrames={90}>
        <Scene1 />
      </Sequence>
      <Sequence from={90} durationInFrames={75}>
        <Scene2 />
      </Sequence>
      <Sequence from={165} durationInFrames={120}>
        <Scene3 />
      </Sequence>
      <Sequence from={285} durationInFrames={90}>
        <Scene4 />
      </Sequence>
      <Sequence from={375} durationInFrames={75}>
        <Scene5 />
      </Sequence>
    </AbsoluteFill>
  );
};
