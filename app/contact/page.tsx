import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-navy-primary">Contact</h1>
        <p className="mt-4 text-gray-600">Get in touch. Content coming soon.</p>
      </main>
      <Footer />
    </div>
  );
}
