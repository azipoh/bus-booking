export interface ParcelEmailData {
  recipientName?: string;
  senderName: string;
  trackingCode: string;
  trackingUrl: string;
  origin: string;
  destination: string;
}

export const buildParcelEmailContent = ({
  recipientName,
  senderName,
  trackingCode,
  trackingUrl,
  origin,
  destination,
}: ParcelEmailData) => {
  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';
  const subject = `Parcel update from Moghamo: tracking ${trackingCode}`;
  const text = `${greeting}\n\nA parcel from ${senderName} has been registered for delivery from ${origin} to ${destination}.\n\nTracking code: ${trackingCode}\nTrack your parcel here: ${trackingUrl}\n\nThank you,\nMoghamo Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 8px;">Parcel update from Moghamo</h2>
      <p>${greeting}</p>
      <p>A parcel from <strong>${senderName}</strong> has been registered for delivery from <strong>${origin}</strong> to <strong>${destination}</strong>.</p>
      <p><strong>Tracking code:</strong> ${trackingCode}</p>
      <p>You can track the parcel here: <a href="${trackingUrl}" style="color: #2563eb;">${trackingUrl}</a></p>
      <p>Thank you,<br />Moghamo Team</p>
    </div>
  `;

  return { subject, text, html };
};
