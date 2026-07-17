import { describe, expect, it } from 'vitest';
import { buildParcelEmailContent } from './parcelEmail';

describe('buildParcelEmailContent', () => {
  it('includes tracking code, recipient details, and a track link', () => {
    const content = buildParcelEmailContent({
      recipientName: 'Ada',
      senderName: 'Kofi',
      trackingCode: 'PCL123',
      trackingUrl: 'https://example.com/track-parcel?code=PCL123',
      origin: 'Douala',
      destination: 'Yaoundé',
    });

    expect(content.subject).toContain('PCL123');
    expect(content.text).toContain('Ada');
    expect(content.text).toContain('PCL123');
    expect(content.text).toContain('https://example.com/track-parcel?code=PCL123');
    expect(content.html).toContain('https://example.com/track-parcel?code=PCL123');
  });
});
