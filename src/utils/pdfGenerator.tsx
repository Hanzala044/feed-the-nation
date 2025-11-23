import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DonationDetail {
  id: string;
  title: string;
  description: string;
  food_type: string;
  quantity: number;
  location: string;
  status: string;
  created_at: string;
  pickup_time?: string;
  expiry_date?: string;
  volunteer_name?: string;
  donor_name?: string;
}

interface PDFConfig {
  userType: 'donor' | 'volunteer';
  userName: string;
  donations: DonationDetail[];
  logo: string;
}

export const generateDonationPDF = async (config: PDFConfig) => {
  const { userType, userName, donations, logo } = config;

  // Create a temporary container for the PDF content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.style.background = '#ffffff';
  container.style.padding = '20mm';
  container.style.fontFamily = 'Arial, sans-serif';

  // Build the HTML content
  container.innerHTML = `
    <div style="width: 100%; max-width: 170mm; margin: 0 auto;">
      <!-- Header Section -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #ff6b35;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${logo}" alt="FOOD 4 U" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" />
          <div>
            <h1 style="margin: 0; font-size: 28px; color: #1e293b; font-weight: 700;">FOOD 4 U</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Feed The Nation Initiative</p>
          </div>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 11px; color: #64748b;">Date: ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b;">Time: ${new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <!-- Thankful Message Section -->
      <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 5px solid #ff6b35;">
        <h2 style="margin: 0 0 15px 0; font-size: 22px; color: #ff6b35; font-weight: 700;">
          ${userType === 'donor' ? '🙏 Thank You For Your Generosity!' : '🌟 Thank You For Your Service!'}
        </h2>
        <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #334155;">
          Dear <strong>${userName}</strong>,<br/><br/>
          ${userType === 'donor'
            ? 'Your generous donations have made a significant impact in fighting hunger and reducing food waste. Every contribution helps us feed those in need and build a stronger, more compassionate community.'
            : 'Your dedicated volunteer work has been instrumental in delivering food to those who need it most. Your commitment to serving the community is truly inspiring and makes a real difference in people\'s lives.'
          }
        </p>
      </div>

      <!-- Stats Overview -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total ${userType === 'donor' ? 'Donations' : 'Deliveries'}</p>
          <p style="margin: 10px 0 0 0; font-size: 32px; color: #ff6b35; font-weight: 700;">${donations.length}</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Quantity</p>
          <p style="margin: 10px 0 0 0; font-size: 32px; color: #10b981; font-weight: 700;">${donations.reduce((sum, d) => sum + d.quantity, 0)} kg</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Lives Impacted</p>
          <p style="margin: 10px 0 0 0; font-size: 32px; color: #8b5cf6; font-weight: 700;">${Math.max(1, Math.floor(donations.reduce((sum, d) => sum + d.quantity, 0) / 5))}</p>
        </div>
      </div>

      <!-- Donation History Title -->
      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700; display: flex; align-items: center; gap: 10px;">
          <span style="display: inline-block; width: 5px; height: 24px; background: #ff6b35; border-radius: 2px;"></span>
          ${userType === 'donor' ? 'Donation History' : 'Delivery History'}
        </h2>
      </div>

      <!-- Donation Items -->
      ${donations.map((donation, index) => `
        <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 15px; ${index < donations.length - 1 ? '' : 'page-break-after: avoid;'}">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b; font-weight: 700;">${donation.title}</h3>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">${donation.description}</p>
            </div>
            <div style="background: ${
              donation.status === 'delivered' ? '#dcfce7' :
              donation.status === 'pending' ? '#fef3c7' :
              donation.status === 'accepted' ? '#dbeafe' : '#fee2e2'
            }; color: ${
              donation.status === 'delivered' ? '#15803d' :
              donation.status === 'pending' ? '#a16207' :
              donation.status === 'accepted' ? '#1e40af' : '#b91c1c'
            }; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; margin-left: 15px;">
              ${donation.status}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <div>
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Food Type</p>
              <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">🍽️ ${donation.food_type}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Quantity</p>
              <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">📦 ${donation.quantity} kg</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Location</p>
              <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">📍 ${donation.location}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Created Date</p>
              <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">📅 ${new Date(donation.created_at).toLocaleDateString()}</p>
            </div>
            ${donation.pickup_time ? `
              <div>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Pickup Time</p>
                <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">🕐 ${donation.pickup_time}</p>
              </div>
            ` : ''}
            ${donation.expiry_date ? `
              <div>
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Expiry Date</p>
                <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">⏰ ${new Date(donation.expiry_date).toLocaleDateString()}</p>
              </div>
            ` : ''}
            ${userType === 'volunteer' && donation.donor_name ? `
              <div style="grid-column: 1 / -1;">
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Donor</p>
                <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">👤 ${donation.donor_name}</p>
              </div>
            ` : ''}
            ${userType === 'donor' && donation.volunteer_name ? `
              <div style="grid-column: 1 / -1;">
                <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; font-weight: 600;">Volunteer</p>
                <p style="margin: 0; font-size: 13px; color: #1e293b; font-weight: 600;">🚴 ${donation.volunteer_name}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}

      <!-- Footer Section -->
      <div style="margin-top: 40px; padding-top: 25px; border-top: 3px solid #ff6b35; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 16px; color: #1e293b; font-weight: 700;">Together, We're Making a Difference!</p>
        <p style="margin: 0 0 15px 0; font-size: 12px; color: #64748b; line-height: 1.6;">
          Your contribution is helping us build a hunger-free Karnataka.<br/>
          Every meal shared is a step towards a better tomorrow.
        </p>
        <div style="margin-top: 20px;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">
            📧 contact@food4u.com | 📞 +91 XXX XXX XXXX | 🌐 www.food4u.com
          </p>
          <p style="margin: 8px 0 0 0; font-size: 10px; color: #cbd5e1;">
            © ${new Date().getFullYear()} FOOD 4 U - Where Technology Meets Compassion
          </p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // Calculate PDF dimensions (A4 size)
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Remove temporary container
    document.body.removeChild(container);

    return pdf;
  } catch (error) {
    // Clean up on error
    document.body.removeChild(container);
    throw error;
  }
};

export const downloadDonationPDF = async (config: PDFConfig) => {
  try {
    const pdf = await generateDonationPDF(config);
    const fileName = `FOOD4U_${config.userType}_${config.userName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const shareDonationPDF = async (config: PDFConfig) => {
  try {
    const pdf = await generateDonationPDF(config);
    const fileName = `FOOD4U_${config.userType}_${config.userName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;

    // Convert PDF to blob
    const blob = pdf.output('blob');

    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${config.userType === 'donor' ? 'Donation' : 'Delivery'} History - FOOD 4 U`,
          text: `My ${config.userType === 'donor' ? 'donation' : 'delivery'} history from FOOD 4 U`,
        });
        return true;
      }
    }

    // Fallback: Download the PDF
    pdf.save(fileName);
    return false;
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};
