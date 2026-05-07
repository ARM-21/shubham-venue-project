import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class FAQPDFGenerator {
  constructor() {
    this.faqContent = [
      {
        category: "General",
        questions: [
          { q: "What is our hall booking service?", a: "Our hall booking service provides an easy and convenient way to reserve event halls for various occasions including weddings, conferences, seminars, and private parties. We offer multiple venue options with different capacities and amenities." },
          { q: "How far in advance can I book a hall?", a: "You can book a hall up to 12 months in advance. We recommend booking at least 2-3 months prior to your event date to ensure availability and to have sufficient time for event planning." },
          { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, digital wallets, and UPI payments. Payment plans are also available for large bookings." },
        ],
      },
      {
        category: "Booking Process",
        questions: [
          { q: "How do I book a hall?", a: "To book a hall: (1) Browse available venues on our website, (2) Select your preferred date and time, (3) Fill in event details, (4) Review the quote, (5) Make payment, and (6) Receive confirmation. Our support team is available to assist throughout the process." },
          { q: "Can I modify my booking after confirmation?", a: "Yes, you can modify bookings up to 30 days before your event date at no additional cost. Changes within 30 days may incur modifications fees. Contact our support team for details." },
          { q: "What is your cancellation policy?", a: "Cancellations made 60+ days before the event receive a full refund. Cancellations 30-59 days before receive 50% refund. Cancellations within 30 days forfeit the booking amount." },
        ],
      },
      {
        category: "Amenities & Services",
        questions: [
          { q: "What amenities are included in the hall rental?", a: "Standard amenities include air conditioning, basic furniture, sound system, projector, and restrooms. Premium venues may include catering services, lighting systems, and decoration options. Check each venue's details for specifics." },
          { q: "Can I bring my own catering?", a: "Yes, you can bring your own catering. However, some premium venues have exclusive catering agreements. Please check the venue details or contact us for specific restrictions." },
          { q: "Is parking available?", a: "Most of our venues offer complimentary parking for guests. Parking capacity varies by location. Please check the specific venue information when booking." },
        ],
      },
      {
        category: "Pricing",
        questions: [
          { q: "How is the price determined?", a: "Pricing depends on venue size, location, amenities, date (peak vs off-season), and duration of rental. We provide transparent quotes with itemized breakdowns." },
          { q: "Are there discounts for early bookings?", a: "Yes! Early bird bookings made 6+ months in advance receive up to 15% discount. We also offer discounts for weekday bookings and long-term event packages." },
          { q: "What additional costs might I incur?", a: "Additional costs may include decoration services (+₹5,000-₹50,000), catering (varies), extra furniture rental, technical support staff, and parking (if not included)." },
        ],
      },
      {
        category: "Event Support",
        questions: [
          { q: "Who will guide me on the day of the event?", a: "Our dedicated event coordinator will be present to ensure smooth execution. They will help with setup, troubleshooting any issues, and ensuring all amenities work properly." },
          { q: "Can I do a venue walkthrough before booking?", a: "Absolutely! We encourage venue walkthroughs. Book a tour through our website or call our support team to arrange a convenient time." },
          { q: "What if there's an emergency during my event?", a: "Our on-site team is trained to handle emergencies. We have trained first aid personnel and clear emergency protocols in place. Contact the event coordinator immediately." },
        ],
      },
      {
        category: "Technical Support",
        questions: [
          { q: "How can I contact customer support?", a: "You can reach us via: Phone: +1-800-BOOKING-1, Email: support@hallbooking.com, Live Chat: Visit our website, WhatsApp: +1-800-BOOKING-1 (24/7 support)." },
          { q: "How long does it take to get a response?", a: "We aim to respond to all inquiries within 24 hours. For urgent matters, our live chat team responds within 15 minutes during business hours (9 AM - 10 PM)." },
          { q: "Can I track my booking status?", a: "Yes! Log into your account on our website or mobile app to view real-time booking status, upcoming events, and payment history." },
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
          info: { Title: "Hall Booking FAQ", Author: "System" }
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
        doc.fontSize(22).font("Helvetica-Bold").text("Frequently Asked Questions", { align: "center" });
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