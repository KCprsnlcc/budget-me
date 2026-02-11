import Image from "next/image";
import { TESTIMONIALS_ROW1, TESTIMONIALS_ROW2 } from "@/lib/constants";
import type { Testimonial } from "@/types";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-[350px] shrink-0 group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md hover:border-slate-300 transition-all duration-300 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full overflow-hidden ring-4 ${testimonial.ringColor}`}>
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="text-slate-900 text-sm font-bold leading-tight">
            {testimonial.name}
          </div>
          <div className="text-slate-400 text-xs">{testimonial.handle}</div>
        </div>
      </div>
      <p className="text-slate-600 text-[13px] leading-relaxed">
        &ldquo;{testimonial.text}&rdquo;
      </p>
    </div>
  );
}

function MarqueeRow({
  testimonials,
  reverse = false,
  duration = "120s",
}: {
  testimonials: Testimonial[];
  reverse?: boolean;
  duration?: string;
}) {
  const doubled = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div
      className={`flex gap-6 items-stretch w-max ${
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      }`}
      style={{ animationDuration: duration }}
    >
      {doubled.map((testimonial, idx) => (
        <TestimonialCard key={`${testimonial.handle}-${idx}`} testimonial={testimonial} />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative z-10 py-16 bg-slate-50/50 border-y border-slate-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative">
        {/* Edge Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-20 pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-12 relative z-10 pt-8">
          <h2 className="text-emerald-600 text-[10px] font-bold tracking-widest uppercase mb-2">
            Testimonials
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight mb-3">
            Loved by the community
          </h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            See why thousands of users are switching to BudgetMe for their daily financial planning.
          </p>
        </div>

        {/* Marquee Rows */}
        <div className="relative overflow-hidden py-4 space-y-6">
          <MarqueeRow testimonials={TESTIMONIALS_ROW1} duration="120s" />
          <MarqueeRow testimonials={TESTIMONIALS_ROW2} reverse duration="100s" />
        </div>
      </div>
    </section>
  );
}
