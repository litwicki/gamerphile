import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/app/[region]/[realm]/[characterName]/hero-section";
import { BentoGrid } from "@/app/[region]/[realm]/[characterName]/bento-grid";
import { RaidHistoryTable } from "@/app/[region]/[realm]/[characterName]/raid-history-table";
import { MPlusHistoryTable } from "@/app/[region]/[realm]/[characterName]/mplus-history-table";
import { UserInterfacePlaceholder } from "@/app/[region]/[realm]/[characterName]/user-placeholder";
import CharacterDetailLoading from "@/app/[region]/[realm]/[characterName]/loading";

// ─── 10.1 Unit tests for character-pages components ───

const baseHeroProps = {
  classTheme: "theme-warrior",
  name: "Testchar",
  specName: "Arms",
  raceName: "Human",
  className: "Warrior",
  level: 80,
  realmName: "Stormrage",
  region: "us",
  classColor: "text-warrior",
};

describe("HeroSection", () => {
  it("renders gradient fallback when no media assets exist (Req 1.4)", () => {
    const { container } = render(
      <HeroSection {...baseHeroProps} mainRawUrl={undefined} />,
    );
    const gradient = container.querySelector(".bg-gradient-to-br");
    expect(gradient).toBeInTheDocument();
  });

  it("renders with main-raw image when available (Req 1.2)", () => {
    render(
      <HeroSection
        {...baseHeroProps}
        mainRawUrl="https://render.worldofwarcraft.com/main-raw.png"
      />,
    );
    const img = screen.getByAltText("Testchar character render");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://render.worldofwarcraft.com/main-raw.png",
    );
  });
});


describe("BentoGrid", () => {
  it("renders 3 widgets when Twitch is disabled (Req 2.4)", () => {
    const { container } = render(
      <BentoGrid
        raidSummary="6/8 H"
        raidProgression={undefined}
        regionRank={undefined}
        worldRank={undefined}
        mplusScore={2500}
        highestRun={{ dungeon: "Ara-Kara", level: 12 }}
        scoreColor=""
        ranks={undefined}
        specScores={undefined}
        scoreTiers={[]}
        hasTwitchIntegration={false}
        characterName="Testchar"
        serverSlug="stormrage"
        serverRegion="us"
      />,
    );
    // Raid Progress, Warcraft Logs, M+ Rating — no Twitch
    expect(screen.getByText("Raid Progress")).toBeInTheDocument();
    expect(screen.getByText("Warcraft Logs")).toBeInTheDocument();
    expect(screen.getByText("M+ Rating")).toBeInTheDocument();
    expect(screen.queryByText("Twitch")).not.toBeInTheDocument();
    // Grid should use lg:grid-cols-3 when Twitch is hidden
    expect(container.firstElementChild?.className).toContain("lg:grid-cols-3");
  });

  it("WarcraftLogs widget shows 'Loading…' initially (Req 2.4)", () => {
    render(
      <BentoGrid
        raidSummary={undefined}
        raidProgression={undefined}
        regionRank={undefined}
        worldRank={undefined}
        mplusScore={0}
        highestRun={undefined}
        scoreColor=""
        ranks={undefined}
        specScores={undefined}
        scoreTiers={[]}
        hasTwitchIntegration={false}
        characterName="Testchar"
        serverSlug="stormrage"
        serverRegion="us"
      />,
    );
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});

describe("RaidHistoryTable", () => {
  it("shows 'No raid history available.' for empty data (Req 3.5)", () => {
    render(<RaidHistoryTable raidProgression={undefined} />);
    expect(
      screen.getByText("No raid history available."),
    ).toBeInTheDocument();
  });
});

describe("MPlusHistoryTable", () => {
  it("shows 'No M+ history available.' for empty data (Req 4.5)", () => {
    render(<MPlusHistoryTable bestRuns={[]} />);
    expect(
      screen.getByText("No M+ history available."),
    ).toBeInTheDocument();
  });
});

describe("UserInterfacePlaceholder", () => {
  it("renders 'Coming Soon' text (Req 5.2)", () => {
    render(<UserInterfacePlaceholder />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(
      screen.getByText(/user-configurable content/i),
    ).toBeInTheDocument();
  });
});

describe("CharacterDetailLoading", () => {
  it("matches new layout structure: hero + bento + three columns (Req 7.1)", () => {
    const { container } = render(<CharacterDetailLoading />);

    // Hero skeleton: h-[40vh] pulse block
    const hero = container.querySelector(".h-\\[40vh\\]");
    expect(hero).toBeInTheDocument();
    expect(hero?.className).toContain("animate-pulse");

    // Bento grid skeleton: negative margin overlap with cards
    const bentoGrid = container.querySelector(".-mt-16");
    expect(bentoGrid).toBeInTheDocument();

    // Three-column detail skeleton
    const detailGrid = container.querySelector(
      ".lg\\:grid-cols-3",
    );
    expect(detailGrid).toBeInTheDocument();
  });
});
