import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import BookingFlow from 'components/booking/BookingFlow';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';

export default async function BookingPage({ params, searchParams }) {
  const { venueSlug: slug } = await params;
  const { date, slot, guests } = await searchParams;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('shubham.sid'); 
  
  if (!sessionCookie || !sessionCookie.value) {
    const currentUrl = `${ROUTES.SITE.VENUE_BOOK(slug)}?date=${date}&slot=${slot}&guests=${guests}`;
    redirect(`${ROUTES.AUTH.LOGIN}?redirect=${encodeURIComponent(currentUrl)}`);
  }

  let hall;
  try {
    const res = await axiosInstance.get(ROUTES.API.HALLS.BY_SLUG(slug));
    hall = res.data?.hall;
  } catch (error) {
    redirect('/404');
  }

  if (!date || !slot || !guests) {
    redirect(ROUTES.SITE.VENUES(slug));
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf7ef] selection:bg-[#C0A04C]/30">
      <BookingFlow
        hall={hall}
        initialDate={date}
        initialSlot={slot}
        initialGuests={parseInt(guests, 10)}
      />
    </main>
  );
}
