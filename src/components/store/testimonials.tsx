const testimonials = [
  {
    name: "Camila R.",
    text: "Excelente atención y rapidez en la entrega. El Apple Watch llegó impecable, tal cual la descripción. 100% recomendable.",
    rating: 5,
  },
  {
    name: "Martín G.",
    text: "Compré auriculares y un cargador. Los mejores precios que encontré y la comunicación por WhatsApp fue súper clara y rápida.",
    rating: 5,
  },
  {
    name: "Sofía L.",
    text: "Ya es la tercera vez que les compro. Siempre productos originales y sellados. Muy confiable.",
    rating: 5,
  },
  {
    name: "Lucas P.",
    text: "Me asesoraron muy bien para elegir el modelo que necesitaba. Atención personalizada de primera.",
    rating: 5,
  },
  {
    name: "Valentina M.",
    text: "Llegó todo perfecto y antes de lo esperado. Los precios en USD son muy competitivos. Voy a volver a comprar seguro.",
    rating: 5,
  },
  {
    name: "Nicolás D.",
    text: "Tenía dudas y me respondieron todas las consultas al instante. Producto original, excelente experiencia de compra.",
    rating: 4,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < count ? "text-brand-gold" : "text-text-muted/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="bg-surface-secondary py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary mb-2">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-text-secondary text-sm sm:text-base">
            Experiencias reales de quienes ya compraron con nosotros
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-surface-primary rounded-2xl border border-brand-ice p-5 sm:p-6"
            >
              <Stars count={t.rating} />
              <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-text-primary">
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
