import { Download } from 'lucide-react';
import { Button } from '../ui';

export default function QRCodeDisplay({ qrCode, shortUrl }) {
  if (!qrCode) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `qr-${shortUrl?.split('/').pop()}.png`;
    link.href = qrCode;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <img src={qrCode} alt="QR Code" className="w-48 h-48 border border-gray-200 rounded-xl p-2" />
      <p className="text-xs text-gray-400 text-center break-all">{shortUrl}</p>
      <Button variant="secondary" size="sm" onClick={handleDownload}>
        <Download size={14} />
        Download QR
      </Button>
    </div>
  );
}
