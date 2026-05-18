"use client";
import { ArrowRight, Coffee } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { useRouter } from 'next/navigation';

export const MenuSection = ({ menusLoading, menuPackages, currencyFormatter }) => {
  const router = useRouter();

  if (!menusLoading && !menuPackages.length) return null;

  return (
    <section className="py-14">
      <div className="mb-8">
        <p className="site-eyebrow mb-2">Dining</p>
        <h2 className="text-2xl font-black text-[#3a1224]">Menu packages</h2>
        <p className="mt-2 max-w-lg text-sm text-[#3a1224]/50">
          Choose a curated menu for your guests from our available packages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {menusLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-[#e8dcc8]/40" />
          ))
        ) : (
          menuPackages.map((menu, idx) => {
            const img = menu.heroImage || menu.image || menu.thumbnail || '/assets/business-images/placeholder2.jpg';
            const title = menu.name || menu.title || 'Menu Package';
            const priceVal = menu.pricePerPerson ?? menu.price ?? menu.pricePerHead ?? null;
            const isPopular = !!menu.isPopular || idx === 1;

            return (
              <div
                key={menu._id || idx}
                onClick={() => router.push(ROUTES.SITE.MENU_DETAILS(menu.slug || menu._id || ''))}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white transition hover:border-[#C0A04C]/40 hover:shadow-[0_12px_32px_rgba(58,18,36,0.1)]"
              >
                {isPopular && (
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-[#3a1224] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#C0A04C]">
                    Popular
                  </div>
                )}

                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8dcc8]/30">
                  <img
                    src={img}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">
                      <Coffee className="h-3 w-3 shrink-0" />
                      {menu.category || 'Buffet'}
                    </div>
                    <h4 className="text-lg font-black leading-tight text-white line-clamp-2">{title}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#3a1224]/35">Per guest</p>
                    <p className="mt-0.5 text-lg font-black text-[#3a1224]">
                      {priceVal ? currencyFormatter.format(priceVal) : 'Call for price'}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf8f2] text-[#3a1224] transition group-hover:bg-[#3a1224] group-hover:text-[#C0A04C]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
