import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="text-center">
        <p className="text-6xl font-bold font-heading text-brand-teal mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold font-heading text-text-primary mb-2">
          Página no encontrada
        </h1>
        <p className="text-text-secondary mb-6">
          La página que buscás no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-teal text-white font-medium hover:bg-brand-teal-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
