import { motion } from "framer-motion";

const stats = [
  { value: "1200+", label: "Hooks generated" },
  { value: "350+", label: "Creators testing Velour" },
  { value: "42k", label: "Ideas captured" },
];

const testimonials = [
  {
    name: "Ana Costa",
    avatar: "AC",
    quote: "Velour helped me structure my content ideas instantly.",
  },
  {
    name: "Rafael Lima",
    avatar: "RL",
    quote: "I used to stare at a blank page. Now I generate hooks in seconds.",
  },
  {
    name: "Marina Alves",
    avatar: "MA",
    quote: "Hook scoring is surprisingly helpful.",
  },
];

const scrollingTestimonials = [...testimonials, ...testimonials];

export default function SocialProof() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-6xl mx-auto mb-24"
    >
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white/95 md:text-4xl">
          Trusted by creators building audience online
        </h2>
        <p className="max-w-2xl mx-auto mt-3 text-base text-white/55 md:text-lg">
          Velour is helping creators craft better hooks every day.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-10 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_28px_rgba(124,92,255,0.16)]"
          >
            <p className="text-3xl font-semibold tracking-tight text-white/95">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-white/55">{stat.label}</p>
          </article>
        ))}
      </div>

      <div className="relative mt-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0A0A0A] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 22,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex gap-4 w-max"
        >
          {scrollingTestimonials.map((testimonial, index) => (
            <article
              key={`${testimonial.name}-${index}`}
              className="w-[320px] rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#171717] text-sm font-semibold text-[#C4B5FD]">
                  {testimonial.avatar}
                </div>
                <p className="text-sm font-medium text-white/85">
                  {testimonial.name}
                </p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                “{testimonial.quote}”
              </p>
            </article>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
