export const getImageUrl = (url?: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oursfit-backend.onrender.com/api';
  if (!url || url.includes('sample.jpg') || url === '/placeholder.png') return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800";
  let finalUrl = url;
  if (finalUrl.startsWith('/uploads')) {
    finalUrl = `${API_URL.replace('/api', '')}${finalUrl}`;
  }
  if (finalUrl.includes('localhost:5000')) {
    finalUrl = finalUrl.replace('http://localhost:5000', API_URL.replace('/api', ''));
  }
  return finalUrl;
};
