import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const FloatingWhatsApp = () => {
  const { content } = useContent();

  return (
    <a
      href={content.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
};

export default FloatingWhatsApp;
