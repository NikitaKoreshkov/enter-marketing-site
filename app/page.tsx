import { SiteHeader } from "@/components/site/header";
import { HeroSection } from "@/components/site/hero";
import { CasesSection } from "@/components/site/cases-section";
import { SiteFooter } from "@/components/site/footer";
import { listSiteCases } from "@/lib/site/cases-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cases = await listSiteCases();

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <CasesSection cases={cases} />
      </main>
      <SiteFooter />
    </>
  );
}
