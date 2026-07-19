import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate House Rules PDF (English)
function generateHouseRulesPDF() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const outputPath = path.join(publicDir, 'house-rules.pdf');
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Title Header
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#1e3a8a').text('House Rules & Regulations', { align: 'left' });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11).fillColor('#475569').text(
    'This document is established to foster a safe, comfortable, and harmonious living environment for all residents.',
    { align: 'left' }
  );
  doc.moveDown(1.5);

  // Helper for section
  const addSection = (title: string, items: string[]) => {
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e293b').text(title);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10.5).fillColor('#334155');
    items.forEach((item) => {
      doc.text(`•  ${item}`, { indent: 15, align: 'justify', lineGap: 4 });
    });
    doc.moveDown(1.2);
  };

  addSection('1. Curfew & Guest Policy', [
    'Visiting hours end at 10:00 PM (22:00 WIB).',
    'Guests are strictly prohibited from staying overnight without prior written consent from property management. If authorized, additional charges will apply.',
    'Opposite-sex visitors are not permitted inside private rooms with the door closed. Meetings are strongly encouraged in the shared living area.',
    'Residents returning after 11:00 PM (23:00 WIB) must maintain quietness to avoid disturbing other residents.'
  ]);

  addSection('2. Cleanliness & Comfort', [
    'Every resident must keep their respective room clean and dispose of garbage in the designated waste bins.',
    'Common areas (kitchen, drying room, parking lot) must be kept clean and tidy immediately after use.',
    'Accumulating personal items or trash in the hallway or outside room doors is strictly prohibited.',
    'Residents must respect quiet hours; loud music or TV volumes that disturb neighbors are prohibited.'
  ]);

  addSection('3. Prohibitions & Zero-Tolerance Policy', [
    'Bringing, storing, or using illegal drugs, alcoholic beverages, weapons, or firearms on the property is strictly forbidden.',
    'Immoral behavior or actions violating local laws and religious norms are strictly prohibited.',
    'Gambling in any form is strictly prohibited within the premises.',
    'Violation of any point in this section will result in immediate unilateral lease termination without refund of paid rent.'
  ]);

  addSection('4. Rent Payments & Deposit', [
    'Rent payments must be settled no later than the due date (or by the 5th) of each month.',
    'Late payments will incur a penalty of 1% per day from the total monthly rent.',
    'The security deposit will be fully refunded at the end of the lease term, provided there is no facility damage or outstanding dues.'
  ]);

  addSection('5. Electricity & Water Usage', [
    'Use electricity and water wisely and conservatively.',
    'Turn off room lights, air conditioners (AC), and other electronic devices whenever leaving the room.',
    'Bringing high-power extra electronic appliances (such as large water dispensers or personal refrigerators) without management approval is prohibited.'
  ]);

  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e3a8a').text('Papikost Management - Cikarang Pusat, Bekasi', { align: 'right' });

  doc.end();
  writeStream.on('finish', () => {
    console.log('Generated: public/house-rules.pdf (English)');
  });
}

// 2. Generate Lease Agreement PDF (English)
function generateLeaseAgreementPDF() {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const outputPath = path.join(publicDir, 'lease-agreement.pdf');
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Title Header
  doc.font('Helvetica-Bold').fontSize(22).fillColor('#1e3a8a').text('Residential Lease Agreement', { align: 'left' });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(11).fillColor('#475569').text(
    'On this day, this Lease Agreement is mutually entered into and agreed upon by the undersigned parties:',
    { align: 'left' }
  );
  doc.moveDown(1.2);

  // Pihak Pertama & Kedua
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1e293b').text('First Party (Lessor / Property Management)');
  doc.font('Helvetica').fontSize(10.5).fillColor('#334155');
  doc.text('•  Name: Papikost Management', { indent: 15 });
  doc.text('•  Address: Cikarang Pusat, Bekasi Regency, West Java', { indent: 15 });
  doc.moveDown(1);

  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1e293b').text('Second Party (Lessee / Resident)');
  doc.font('Helvetica').fontSize(10.5).fillColor('#334155');
  doc.text('•  Name: [Verified in System / Papikost Resident]', { indent: 15 });
  doc.text('•  ID Number (KTP/Passport): [Verified in System]', { indent: 15 });
  doc.text('•  Occupation/Institution: Papikost Resident', { indent: 15 });
  doc.moveDown(1.5);

  const addPasal = (title: string, body: string | string[]) => {
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1e293b').text(title);
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10.5).fillColor('#334155');
    if (Array.isArray(body)) {
      body.forEach((item, idx) => {
        doc.text(`${idx + 1}.  ${item}`, { indent: 15, align: 'justify', lineGap: 4 });
      });
    } else {
      doc.text(body, { indent: 15, align: 'justify', lineGap: 4 });
    }
    doc.moveDown(1.2);
  };

  addPasal('Article 1: Lease Object & Duration', 
    'The First Party leases the residential room located at Papikost, Cikarang Pusat to the Second Party for the lease term agreed upon in the official booking reservation system.'
  );

  addPasal('Article 2: Rent & Security Deposit', [
    'The agreed rental fee corresponds to the monthly/annual room rate settled via the official Midtrans payment portal.',
    'The Second Party submits a security deposit as a guarantee for facility safety and integrity throughout the lease term.'
  ]);

  addPasal('Article 3: Facility Maintenance & Damage', 
    'The Second Party is fully responsible for the condition of all room facilities. Any damage caused by the Second Party\'s negligence will be deducted from the security deposit or billed directly for repairs.'
  );

  addPasal('Article 4: Lease Termination', [
    'If the Second Party intends to terminate or not renew the lease, written notice must be given to the First Party at least 14 days before the lease expiration date.',
    'If the Second Party vacates the room before the contracted lease period ends, paid rental fees are strictly non-refundable.'
  ]);

  addPasal('Article 5: Mutual Consent', 
    'The Lessee declares having read, understood, and agreed to abide by the House Rules & Regulations, which form an integral and inseparable part of this Agreement.'
  );

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e3a8a').text('(Signature) Papikost Management', { align: 'right' });
  doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('Cikarang Pusat, Bekasi', { align: 'right' });

  doc.end();
  writeStream.on('finish', () => {
    console.log('Generated: public/lease-agreement.pdf (English)');
  });
}

generateHouseRulesPDF();
generateLeaseAgreementPDF();
