import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import BookingFlow from '@/components/booking/BookingFlow';
import axiosInstance from '@/lib/axios';
import { ROUTES } from '@/config/routes';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <BookingFlow 
        hall={hall}
        initialDate={date}
        initialSlot={slot}
        initialGuests={parseInt(guests)}
      />
    </div>
  );
}
