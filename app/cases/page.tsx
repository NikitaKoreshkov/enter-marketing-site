import { CasesClient } from "./CasesClient";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";

export const metadata = {
  title: "Кейсы — Enter Marketing",
  description: "Детальная статистика и результаты наших клиентов до и после работы с Enter Marketing.",
};

export default function CasesPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", paddingTop: "120px" }}>
        <CasesClient />
      </main>
      <Footer />
    </>
  );
}
