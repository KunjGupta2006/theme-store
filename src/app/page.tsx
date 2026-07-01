import Image from "next/image";

export default function HomePage() {
  return (
    <main>
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src="/home-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-black/50" />

        <div className="relative z-10 mx-auto flex h-full max-w-max flex-col items-center justify-center gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-16">
          <div className="flex flex-col items-center text-center md:items-start md:w-1/2 md:text-left">

            <h1 className="display-lg-mobile mt-6 text-white md:display-lg md:mt-8">
              Where Craft<br />Meets Creativity
            </h1>

            <p className="body-lg mt-5 max-w-xl text-white/65 md:mt-6">
              Premium essentials built for those who value substance over excess.
            </p>
            <div className="flex justify-between items-center gap-6" >
            <button className="label-caps mt-10 bg-white px-10 py-3.5 tracking-widest rounded-xl text-[#1c1b1b] transition-all hover:bg-inverse-surface hover:text-surface hover:cursor-pointer hover:scale-105  md:mt-12">
              Explore Collection
            </button>
            <button className="label-caps mt-10 bg-[#1c1b1b] px-10 py-3.5 tracking-widest rounded-xl text-white transition-all hover:opacity-90 hover:cursor-pointer hover:scale-105  md:mt-12">
              Customize Now
            </button>
            </div>
          </div>

          <div className="flex items-start justify-around md:w-2/3">
            <div className="animate-float relative h-60 w-52 md:h-125 md:w-125">
              <Image
                src="/home-t-shirt.png"
                alt="Premium t-shirt"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface px-5 py-section md:px-16">
        <div className="mx-auto max-w-max">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="label-caps text-on-surface-variant">What We Do</span>
            <h2 className="headline-lg mt-3 text-on-surface md:headline-xl md:mt-4">
              Premium Craft,<br />Your Way
            </h2>
            <p className="body-lg mt-4 max-w-2xl text-on-surface-variant md:mt-5">
              Every garment is a blank canvas. We partner with you to bring your vision to life using
              the finest materials and most advanced printing techniques in the industry.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-3">
            <div className="group border border-outline-variant bg-surface-container-lowest p-8 transition-all duration-300 hover:border-primary hover:bg-surface-container-low md:p-10">

              <h3 className="headline-sm mt-6 text-on-surface">Custom Designs</h3>
              <p className="body-md mt-3 text-on-surface-variant">
                Full customization from concept to creation. Upload your artwork, choose placement, and we handle the rest.
              </p>
            </div>

            <div className="group border border-outline-variant bg-surface-container-lowest p-8 transition-all duration-300 hover:border-primary hover:bg-surface-container-low md:p-10">

              <h3 className="headline-sm mt-6 text-on-surface">Sublimation &amp; DTF</h3>
              <p className="body-md mt-3 text-on-surface-variant">
                Vibrant, durable prints using state-of-the-art sublimation and Direct-to-Film technology that won&rsquo;t fade or crack.
              </p>
            </div>

            <div className="group border border-outline-variant bg-surface-container-lowest p-8 transition-all duration-300 hover:border-primary hover:bg-surface-container-low md:p-10">

              <h3 className="headline-sm mt-6 text-on-surface">Premium Fabrics</h3>
              <p className="body-md mt-3 text-on-surface-variant">
                Choose from a range of GSM weights &mdash; 160, 180, 200, 240 &amp; 260 &mdash; each selected for comfort, durability, and drape.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}