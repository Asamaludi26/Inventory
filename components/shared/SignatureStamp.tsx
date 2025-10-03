import React from 'react';

interface SignatureStampProps {
    signerName: string;
    signatureDate: string;
    signerDivision?: string;
}

export const SignatureStamp: React.FC<SignatureStampProps> = ({ signerName, signatureDate, signerDivision }) => {
    return (
        <div className="relative flex flex-col items-center justify-center w-36 h-24 p-1 text-blue-700 border-2 border-blue-500 rounded-md bg-blue-50 bg-opacity-70">
            <p className="text-lg italic font-serif leading-tight text-blue-800">{signerName}</p>
            {signerDivision && <p className="text-xs italic text-blue-600">{signerDivision}</p>}
            <p className="mt-1 text-xs">{new Date(signatureDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
    );
};