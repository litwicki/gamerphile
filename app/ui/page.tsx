import { Button } from "@/components/ui/button";

export default function UIShowcasePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-24">
      <h1 className="text-4xl font-bold">UI Showcase</h1>
      <p className="text-lg text-muted-foreground">
        A showcase of available UI components.
      </p>
      <section className="flex flex-wrap gap-4">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </section>
    </div>
  );
}
