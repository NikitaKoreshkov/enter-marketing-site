import { Header } from "@/components/header/Header";
import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { FaceSection } from "@/components/home/face-section";
import { NichesSection } from "@/components/home/niches-section";
import { ResultsSection } from "@/components/home/results-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { ContactSection } from "@/components/home/contact-section";
import { FooterWordmark } from "@/components/footer/FooterWordmark";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <FaceSection />
        <NichesSection />
        <ResultsSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <FooterWordmark />
      <Footer />
    </>
  );
}
