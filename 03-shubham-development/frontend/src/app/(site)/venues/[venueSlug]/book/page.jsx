import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import BookingFlow from 'components/booking/BookingFlow';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';

export default async function BookingPage({ params, searchParams }) {
  console.log(await params)
  const { venueSlug:slug } = await params;
  console.log(slug)
  const { date, slot, guests } = await searchParams;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('shubham.sid'); 
  console.log(sessionCookie)
  
  if (!sessionCookie || !sessionCookie.value) {
    const currentUrl = `${ROUTES.SITE.VENUE_BOOK(slug)}?date=${date}&slot=${slot}&guests=${guests}`;
    redirect(`${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(currentUrl)}`);
  }

  let hall;
  try {
    console.log(slug)
    const res = await axiosInstance.get(ROUTES.API.HALLS.BY_SLUG(slug));
    hall = res.data?.hall;
    console.log(hall);
  } catch (error) {
    redirect('/404');
  }

  if (!date || !slot || !guests) {
    redirect(ROUTES.SITE.VENUES(slug));
  }

  return (
    <main className="min-h-screen bg-[#faf9f6]/50 relative selection:bg-[#C0A04C]/30 overflow-x-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
      </div>

      {/* Content wrapper with padding - account for fixed navbar */}
      <div className="relative z-10 pt pb-32">
        <BookingFlow 
          hall={hall}
          initialDate={date}
          initialSlot={slot}
          initialGuests={parseInt(guests)}
        />
      </div>
    </main>
  );
}
