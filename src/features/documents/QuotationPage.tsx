import React from 'react';

const QuotationPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div 
        className="w-full h-[calc(100vh-100px)] border rounded-xl shadow-md overflow-hidden" 
        dangerouslySetInnerHTML={{ __html: `
        <iframe src="/quotation.md" style="width:100%; height:100%; border:0;"></iframe>
        ` }}
      />
    </div>
  );
};

export default QuotationPage;
