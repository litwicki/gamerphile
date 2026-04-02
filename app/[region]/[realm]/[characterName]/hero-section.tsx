export interface HeroSectionProps {
  mainRawUrl: string | undefined;
  classTheme: string;
  name: string;
  specName: string | undefined;
  raceName: string;
  className: string;
  level: number;
  realmName: string;
  region: string;
  classColor: string;
}

export function HeroSection({
  mainRawUrl,
  classTheme,
  name,
  specName,
  raceName,
  className,
  level,
  realmName,
  region,
  classColor,
}: HeroSectionProps) {
  return (
    <div className="relative h-[40vh] overflow-hidden">
      {/* Background: parallax image or gradient fallback */}
      {mainRawUrl ? (
        <div
          className="absolute inset-0"
          style={{ backgroundAttachment: "fixed", backgroundSize: "cover", backgroundPosition: "center", backgroundImage: `url(${mainRawUrl})` }}
        >
          <img
            src={mainRawUrl}
            alt={`${name} character render`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-background" />
      )}

      {/* Dark gradient scrim for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Character identity overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h1 className={`text-4xl font-bold ${classColor}`}>{name}</h1>
        <p className="mt-1 text-sm text-white/80">
          {specName ? `${specName} ` : ""}
          {raceName} {className}
        </p>
        <p className="text-sm text-white/60">
          Level {level} · {realmName} · <span className="uppercase">{region}</span>
        </p>
      </div>
    </div>
  );
}
