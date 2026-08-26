"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

export function TestimonialCarousel({ testimonials }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi]);

  if (!testimonials?.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full px-2 sm:basis-1/2 lg:basis-1/3">
              <div className="card-surface flex h-full flex-col p-7">
                <Quote className="mb-4 text-primary/40" size={28} />
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                    <Star key={idx} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  {t.avatarUrl ? (
                    <Image src={t.avatarUrl} alt={t.clientName} width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.clientName?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.clientName}</p>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={scrollPrev}
          aria-label="Previous testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-1.5">
          {testimonials.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === selected ? "w-5 bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <button
          onClick={scrollNext}
          aria-label="Next testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
