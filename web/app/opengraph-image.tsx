import { ImageResponse } from 'next/og';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'LA Toy District — Downtown Los Angeles business directory';
export default function OgImage() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff', color: '#182924', padding: 72, fontFamily: 'sans-serif' }}>
    <div style={{ display: 'flex', color: '#087657', fontSize: 72, fontWeight: 700 }}>LA Toy District</div>
    <div style={{ display: 'flex', fontSize: 48, lineHeight: 1.25 }}>Wholesale toy, party and gift directory — Downtown Los Angeles</div>
    <div style={{ display: 'flex', color: '#586660', fontSize: 26 }}>toydistrictlosangeles.com</div>
  </div>, size);
}
