import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

export function buildTripReceiptPdfBuffer({ booking, trip }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = w - margin * 2;

  // Read optimized logo
  let logoBase64 = null;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo_pdf.png');
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath);
      logoBase64 = 'data:image/png;base64,' + buf.toString('base64');
    }
  } catch (err) {
    console.warn('Could not read logo_pdf.png:', err.message);
  }

  function drawHeader(isContinuation = false) {
    // Top amber accent bar
    pdf.setFillColor(255, 179, 0); // #FFB300
    pdf.rect(0, 0, w, 4, 'F');
    pdf.setFillColor(255, 106, 0); // #FF6A00
    pdf.rect(0, 4, w, 1, 'F');

    if (isContinuation) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 106, 0);
      pdf.text('STM RIDER', margin, 12);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text('TOUR VOUCHER & ITINERARY (CONTINUED)', margin + 24, 12);
      pdf.text(`#${booking._id?.toString().slice(-8).toUpperCase() || ''}`, w - margin, 12, { align: 'right' });
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, 15, w - margin, 15);
      return 20;
    }

    // Logo on left
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', margin, 8, 30, 20);
      } catch {
        // Fallback text logo
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(255, 106, 0);
        pdf.text('STM RIDER', margin, 20);
      }
    } else {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(255, 106, 0);
      pdf.text('STM RIDER', margin, 20);
    }

    // Brand info next to logo
    const brandX = margin + 33;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(17, 24, 39);
    pdf.text('STM RIDER', brandX, 15);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Tours, Expeditions & Self-Drive Rentals', brandX, 19.5);
    pdf.text('Ph: +91 94658 53502  |  support@stmrider.com  |  stmrider.com', brandX, 23.5);

    // Right Header - Voucher details
    const rightX = w - margin;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('TOUR BOOKING VOUCHER', rightX, 14, { align: 'right' });

    pdf.setFont('courier', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(255, 106, 0);
    const voucherRef = `#STM-TRIP-${booking._id?.toString().slice(-8).toUpperCase() || 'REF'}`;
    pdf.text(voucherRef, rightX, 19, { align: 'right' });

    // Status Badge
    const isConfirmed = booking.status === 'Confirmed' || booking.status === 'Completed';
    if (isConfirmed) {
      pdf.setFillColor(220, 252, 231); // Green 100
      pdf.setDrawColor(134, 239, 172); // Green 300
      pdf.roundedRect(rightX - 42, 22, 42, 6.5, 1.5, 1.5, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(22, 101, 52); // Green 800
      pdf.text('PAYMENT CONFIRMED', rightX - 21, 26.5, { align: 'center' });
    } else {
      pdf.setFillColor(254, 243, 199); // Yellow 100
      pdf.setDrawColor(252, 211, 77); // Yellow 300
      pdf.roundedRect(rightX - 42, 22, 42, 6.5, 1.5, 1.5, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(146, 64, 14); // Yellow 800
      pdf.text('PENDING APPROVAL', rightX - 21, 26.5, { align: 'center' });
    }

    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, 31, w - margin, 31);
    return 36;
  }

  function drawFooter(pageNo, totalPages) {
    const footY = h - 12;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, footY, w - margin, footY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text('STM RIDER  *  Official Booking Confirmation  *  Carry this voucher & original photo ID at pickup', margin, footY + 4);
    pdf.text(`Page ${pageNo} of ${totalPages}`, w - margin, footY + 4, { align: 'right' });

    // Bottom accent strip
    pdf.setFillColor(255, 179, 0);
    pdf.rect(0, h - 2, w, 2, 'F');
  }

  let y = drawHeader(false);

  // SECTION 1: PASSENGER & EXPEDITION OVERVIEW CARDS
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 36;

  // Left Card: Customer Info
  pdf.setFillColor(248, 250, 252); // slate 50
  pdf.setDrawColor(226, 232, 240); // slate 200
  pdf.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 106, 0);
  pdf.text('PASSENGER INFORMATION', margin + 4, y + 6);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(booking.customerName || 'N/A', margin + 4, y + 13);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Phone: ${booking.phone || 'N/A'}`, margin + 4, y + 19);
  pdf.text(`Email: ${booking.customerEmail || 'Not Provided'}`, margin + 4, y + 24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`Seats Reserved: ${booking.numberOfSeats || 1} Passenger(s)`, margin + 4, y + 30);

  // Right Card: Trip Overview
  const rightCardX = margin + cardWidth + 6;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(rightCardX, y, cardWidth, cardHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 106, 0);
  pdf.text('EXPEDITION DETAILS', rightCardX + 4, y + 6);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.5);
  pdf.setTextColor(15, 23, 42);
  const tripTitleTrunc = pdf.splitTextToSize(trip.title || 'Tour Expedition', cardWidth - 8)[0];
  pdf.text(tripTitleTrunc, rightCardX + 4, y + 13);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Destination: ${trip.destination || ''}`, rightCardX + 4, y + 19);
  pdf.text(`Duration: ${trip.duration || ''}`, rightCardX + 4, y + 24);
  pdf.text(`Departure Date: ${booking.departureDate || ''}`, rightCardX + 4, y + 29);
  pdf.text(`Pickup Point: ${booking.pickupPoint || trip.pickupLocation || 'LPU Law Gate'}`, rightCardX + 4, y + 33.5);

  y += cardHeight + 6;

  // SECTION 2: DAYWISE TOUR PLAN & HIGHLIGHTS (WHAT THEY PURCHASED)
  pdf.setFillColor(15, 23, 42); // slate 900
  pdf.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DAY-BY-DAY TOUR PLAN & HIGHLIGHTS (PURCHASED ITINERARY)', margin + 4, y + 4.8);
  y += 10;

  const itinerary = Array.isArray(trip.itinerary) && trip.itinerary.length > 0
    ? trip.itinerary
    : [
        { day: 1, title: 'Departure & Sights', details: 'Reporting at pickup point and scenic mountain drive to destination. Hotel check-in and local sightseeing.' },
        { day: 2, title: 'Adventure & Excursion', details: 'Full day excursion to scenic viewpoints, snow activities, and evening bonfire with group.' },
        { day: 3, title: 'Return Journey', details: 'Breakfast, morning exploration, and comfortable return journey to origin point.' },
      ];

  itinerary.forEach((item, idx) => {
    // Check if new page needed
    if (y > h - 45) {
      pdf.addPage();
      y = drawHeader(true);
    }

    // Day badge
    pdf.setFillColor(255, 179, 0); // Amber 400
    pdf.roundedRect(margin, y, 16, 5.5, 1, 1, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Day ${item.day || (idx + 1)}`, margin + 8, y + 4, { align: 'center' });

    // Day title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(item.title || `Day ${idx + 1} Plan`, margin + 20, y + 4);

    // Day details
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    const detailLines = pdf.splitTextToSize(item.details || '', contentWidth - 20);
    pdf.text(detailLines, margin + 20, y + 8.5);

    const blockHeight = Math.max(12, 10 + detailLines.length * 3.6);
    y += blockHeight;

    // Subtle divider between days
    if (idx < itinerary.length - 1) {
      pdf.setDrawColor(241, 245, 249);
      pdf.line(margin + 20, y - 2, w - margin, y - 2);
    }
  });

  y += 4;

  // SECTION 3: INCLUSIONS & EXCLUSIONS
  if (y > h - 55) {
    pdf.addPage();
    y = drawHeader(true);
  }

  const incWidth = (contentWidth - 6) / 2;
  const incY = y;

  // Inclusions Box
  pdf.setFillColor(240, 253, 244); // Green 50
  pdf.setDrawColor(187, 247, 208); // Green 200
  const inclusions = Array.isArray(trip.inclusions) && trip.inclusions.length > 0
    ? trip.inclusions.slice(0, 5)
    : ['AC Transportation to & fro', 'Hotel / Resort Stay', 'Breakfast & Dinner', 'Sightseeing & Bonfire', 'Trip Captain Support'];
  
  const incHeight = 10 + inclusions.length * 4.5;
  pdf.roundedRect(margin, incY, incWidth, incHeight, 1.5, 1.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(22, 101, 52); // Green 800
  pdf.text('PACKAGE INCLUSIONS', margin + 4, incY + 5.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(21, 128, 61);
  inclusions.forEach((inc, i) => {
    const txt = pdf.splitTextToSize(`* ${inc}`, incWidth - 8)[0];
    pdf.text(txt, margin + 4, incY + 10 + i * 4.5);
  });

  // Guidelines / Important notes Box on right
  pdf.setFillColor(254, 252, 232); // Yellow 50
  pdf.setDrawColor(254, 240, 138); // Yellow 200
  pdf.roundedRect(rightCardX, incY, incWidth, incHeight, 1.5, 1.5, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(161, 98, 7);
  pdf.text('IMPORTANT TRAVEL GUIDELINES', rightCardX + 4, incY + 5.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(113, 63, 18);
  const guidelines = [
    'Arrive 15 mins prior to departure time.',
    'Carry original Govt Photo ID (Aadhaar/Passport).',
    'Keep warm layers and sports/trekking shoes.',
    '24x7 Trip Captain Contact: +91 94658 53502',
    'Follow captain guidelines for group safety.'
  ];
  guidelines.forEach((g, i) => {
    const txt = pdf.splitTextToSize(`* ${g}`, incWidth - 8)[0];
    pdf.text(txt, rightCardX + 4, incY + 10 + i * 4.5);
  });

  y = incY + incHeight + 6;

  // SECTION 4: FARE BREAKDOWN & PAYMENT SUMMARY
  if (y > h - 45) {
    pdf.addPage();
    y = drawHeader(true);
  }

  pdf.setFillColor(15, 23, 42); // slate 900
  pdf.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text('PAYMENT & FARE BREAKDOWN', margin + 4, y + 4.8);
  y += 10;

  // Table Header
  pdf.setFillColor(241, 245, 249);
  pdf.rect(margin, y, contentWidth, 6, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('ITEM DESCRIPTION', margin + 4, y + 4.2);
  pdf.text('RATE / PERSON', margin + 90, y + 4.2);
  pdf.text('TRAVELERS', margin + 125, y + 4.2);
  pdf.text('AMOUNT (INR)', w - margin - 4, y + 4.2, { align: 'right' });
  y += 8;

  // Item Row
  const seats = booking.numberOfSeats || 1;
  const basePricePerPerson = trip.price || Math.round(booking.totalPrice / seats);
  const subtotal = booking.originalPrice || (basePricePerPerson * seats);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${trip.title || 'Tour Expedition'} (${trip.duration || ''})`, margin + 4, y + 3);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(`Rs. ${basePricePerPerson.toLocaleString('en-IN')}`, margin + 90, y + 3);
  pdf.text(`${seats} Person(s)`, margin + 125, y + 3);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, w - margin - 4, y + 3, { align: 'right' });
  y += 7;

  // Coupon row if applied
  if (booking.couponCode) {
    const discount = Math.max(0, subtotal - booking.totalPrice);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(22, 163, 74);
    pdf.text(`Coupon Discount Code: [${booking.couponCode.toUpperCase()}]`, margin + 4, y + 3);
    pdf.text(`- Rs. ${discount.toLocaleString('en-IN')}`, w - margin - 4, y + 3, { align: 'right' });
    y += 7;
  }

  // Divider
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, y, w - margin, y);
  y += 2;

  // Total Paid Row
  pdf.setFillColor(254, 243, 199); // Yellow 100
  pdf.roundedRect(margin, y, contentWidth, 8, 1.5, 1.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(146, 64, 14); // Yellow 900
  pdf.text('TOTAL AMOUNT (INCL. TAXES):', margin + 4, y + 5.5);

  pdf.setFontSize(12);
  pdf.setTextColor(255, 106, 0); // Orange
  pdf.text(`Rs. ${Number(booking.totalPrice || 0).toLocaleString('en-IN')}`, w - margin - 4, y + 5.5, { align: 'right' });

  // Add page numbers on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    drawFooter(p, totalPages);
  }

  return Buffer.from(pdf.output('arraybuffer'));
}
