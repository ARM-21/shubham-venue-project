import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import BookingFlow from '@/components/booking/BookingFlow';
import axiosInstance from '@/lib/axios';

export default async function BookingPage({ params, searchParams }) {
  console.log(await params)
  const { venueSlug:slug } = await params;
  console.log(slug)
  const { date, slot, guests } = await searchParams;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('shubham.sid'); // Your session cookie name
  console.log(sessionCookie)
  
  if (!sessionCookie) {
    const currentUrl = `/venues/${slug}/book?date=${date}&slot=${slot}&guests=${guests}`;
    redirect(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
  }

  let hall;
  try {
    console.log(slug)
    const res = await axiosInstance.get(`/api/v1/halls/${slug}`);
    hall = res.data;
    console.log(hall);
  } catch (error) {
    redirect('/404');
  }

  if (!date || !slot || !guests) {
    redirect(`/venues/${slug}`);
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
