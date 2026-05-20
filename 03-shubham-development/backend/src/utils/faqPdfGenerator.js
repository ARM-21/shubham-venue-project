import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class FAQPDFGenerator {
  constructor() {
    this.faqContent = [
      {
        category: "General",
        questions: [
          { q: "What is Shubham Venue?", a: "Shubham Venue is an event venue and online booking platform based in Waling, Syangja, Gandaki Province, Nepal. We offer a guided online booking experience covering hall selection, menu packages, decoration schemes, and payment — all in one place. We cater to weddings, engagements, corporate functions, family celebrations, and public events." },
          { q: "How far in advance can I book a hall?", a: "You can book a hall well in advance — we recommend reserving at least 2–3 months before your event date to secure your preferred slot and allow time for planning. Popular dates (festive seasons, weekends) book out quickly, so earlier is better." },
          { q: "What payment methods do you accept?", a: "We accept online payment through Khalti, a trusted Nepali digital payment platform. We also offer a Cash on Arrival option for select bookings, where payment is made directly to our team before the event. All prices are in Nepalese Rupees (NPR)." },
        ],
      },
      {
        category: "Booking Process",
        questions: [
          { q: "How do I book a hall?", a: "To book a hall: (1) Browse available halls on our website, (2) Select your preferred date and time slot (Morning, Evening, or Whole Day), (3) Fill in your event and contact details, (4) Choose menu and decoration packages, (5) Review your booking summary, (6) Complete payment via Khalti or choose Cash on Arrival, and (7) Receive your booking confirmation by email." },
          { q: "What is a booking hold and how long does it last?", a: "When you begin the booking process, a temporary hold is placed on your selected slot for approximately 5 minutes while you complete payment. This prevents someone else from booking the same slot at the same time. If payment is not completed within the hold window, the slot is automatically released and becomes available again." },
          { q: "Can I modify my booking after confirmation?", a: "Modification requests must be submitted in writing to our team at hello@shubham.com or by calling +977 9812345678. Changes are subject to availability and may incur additional charges depending on the nature of the modification and how close it is to the event date." },
        ],
      },
      {
        category: "Cancellation & Refunds",
        questions: [
          { q: "What is your cancellation policy?", a: "Cancellations must be submitted in writing. Refund eligibility is as follows: 30+ days before the event — full refund (less any payment processing fee); 15–29 days before — 50% refund; 7–14 days before — 25% refund; less than 7 days before — no refund; no-show — no refund. Refunds are processed within 7–14 business days to the original payment method." },
          { q: "How do I request a cancellation?", a: "Email your cancellation request to hello@shubham.com with your booking reference number, your full name, and the reason for cancellation. You can also manage bookings from your account on our website. Our team will confirm the cancellation and advise on any applicable refund." },
          { q: "What if Shubham Venue cancels my booking?", a: "In the rare event that we need to cancel a confirmed booking (for example, due to force majeure or an unforeseen circumstance), you will receive a full refund and our team will contact you immediately to explore alternative dates or arrangements." },
        ],
      },
      {
        category: "Amenities & Services",
        questions: [
          { q: "What is included in the hall rental?", a: "Each hall comes with its own set of included amenities — details are listed on each hall's page on our website. Common inclusions are seating arrangements, sound system, lighting, and restrooms. Please review the specific hall listing before booking." },
          { q: "Do you offer catering services?", a: "Yes. We offer curated catering menu packages that you can select and customise as part of the booking flow. Our menus cover a range of cuisines and guest capacities. Menu selection and pricing are shown during the booking process." },
          { q: "Can I add decoration to my booking?", a: "Yes. Our platform lets you choose from decoration schemes and add-on items as part of your booking. You can browse available packages and their prices during the booking process and add them before confirming your reservation." },
        ],
      },
      {
        category: "Pricing",
        questions: [
          { q: "How is pricing determined?", a: "Hall rental prices are based on the hall, the time slot selected (Morning, Evening, or Whole Day), and the event date. Menu and decoration packages are priced separately and added to your total. Full pricing is shown transparently before you confirm and pay." },
          { q: "Are there any hidden charges?", a: "No. We display a full itemised breakdown of your booking cost — hall rental, menu package, decoration add-ons, and applicable taxes — before you proceed to payment. There are no hidden fees." },
          { q: "What currency are prices shown in?", a: "All prices are shown in Nepalese Rupees (NPR)." },
        ],
      },
      {
        category: "Accounts & Support",
        questions: [
          { q: "Do I need an account to book?", a: "Yes. You need a registered account to make a booking. You can sign up with your email address or continue with your Google account. Registration is free and only takes a moment." },
          { q: "How can I contact the Shubham Venue team?", a: "You can reach us by phone at +977 9812345678, or by email at hello@shubham.com. Our office hours are Sunday to Friday, 9 AM to 6 PM. For booking-related queries, you can also use the contact form on our website." },
          { q: "Can I track my booking status?", a: "Yes. Log into your account on our website and visit the 'My Bookings' section to see the status of all your bookings, payment history, and event details. You will also receive email notifications when your booking status changes." },
        ],
      },
    ];
  }

  async generatePDF(outputPath) {
    const fullPath = path.resolve(outputPath);
    const dir = path.dirname(fullPath);

    // Ensure the directory exists so it doesn't crash
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      try {
        console.log("FAQPDFGenerator: starting PDF generation for", fullPath);
        const doc = new PDFDocument({
          margin: 50,
          info: { Title: "Shubham Venue — Frequently Asked Questions", Author: "Shubham Venue", Subject: "FAQ" }
        });
        
        const stream = fs.createWriteStream(fullPath);
        doc.pipe(stream);
        let finished = false;

        // Safety timeout to avoid indefinite hang
        const timeout = setTimeout(() => {
          if (!finished) {
            const err = new Error("PDF generation timed out");
            console.error("FAQPDFGenerator:", err.message);
            reject(err);
          }
        }, 30000);

        // Header
        console.log("FAQPDFGenerator: writing header");
        doc.fontSize(22).font("Helvetica-Bold").text("Shubham Venue — Frequently Asked Questions", { align: "center" });
        doc.moveDown();

        this.faqContent.forEach((section, si) => {
          console.log(`FAQPDFGenerator: writing section ${si} - ${section.category}`);
          // Check for page overflow before writing section header
          if (doc.y > 650) doc.addPage();

          doc.fontSize(16).font("Helvetica-Bold").fillColor("#2c3e50").text(section.category);
          doc.moveDown(0.5);

          section.questions.forEach((qa, qi) => {
            console.log(`FAQPDFGenerator: writing question ${si}.${qi}`);
            // Keep Q and A together on the same page if possible
            if (doc.y > 700) doc.addPage();

            doc.fontSize(12).font("Helvetica-Bold").fillColor("black").text(`Q: ${qa.q}`);
            doc.moveDown(0.1);
            doc.fontSize(11).font("Helvetica").fillColor("#444444").text(`A: ${qa.a}`, {
              align: 'justify',
              indent: 10
            });
            doc.moveDown(0.8);
          });

          doc.moveDown(0.5);
        });

        doc.end();

        stream.on("finish", () => {
          finished = true;
          clearTimeout(timeout);
          console.log(`PDF successfully generated at: ${fullPath}`);
          resolve(fullPath);
        });

        stream.on("close", () => {
          // sometimes 'close' fires instead of 'finish'
          if (!finished) {
            finished = true;
            clearTimeout(timeout);
            console.log(`FAQPDFGenerator: stream closed for ${fullPath}`);
            resolve(fullPath);
          }
        });

        stream.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default new FAQPDFGenerator();