import Image from "next/image";
import Link from "next/link";

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/invicly-mark-256.png"
      alt=""
      width={size}
      height={Math.round((size * 657) / 908)}
      className={className}
      priority
    />
  );
}

export function Wordmark({ className = "text-[22px]" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-[-0.5px] ${className}`}>
      Invicly<span className="text-blue">Tech</span>
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="Invicly Tech home">
      <LogoMark size={40} />
      <Wordmark />
    </Link>
  );
}
