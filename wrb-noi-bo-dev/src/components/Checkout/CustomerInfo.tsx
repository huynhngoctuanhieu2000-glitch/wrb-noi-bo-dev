import React from 'react';

interface CustomerInfoProps {
    lang: string;
    info: { name: string; email: string; phone: string; gender: string; room?: string };
    onChange: (field: string, value: string) => void;
}

export default function CustomerInfo({ lang, info, onChange }: CustomerInfoProps) {
    return (
        <div className="bg-white text-black p-5 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">
                CUSTOMER INFO
            </h2>

            <div className="space-y-4">
                {/* Full Name */}
                <input
                    type="text"
                    value={info.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="Full Name*"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors shadow-sm"
                />

                {/* Email */}
                <input
                    type="email"
                    value={info.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    placeholder="Email (abc@gmail.com)*"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors shadow-sm"
                />

                <div className="flex gap-4">
                    {/* Phone */}
                    <input
                        type="tel"
                        value={info.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        placeholder="Phone No."
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-4 text-black placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors shadow-sm"
                    />

                    {/* Gender */}
                    <div className="w-1/3 relative">
                        <select
                            value={info.gender}
                            onChange={(e) => onChange('gender', e.target.value)}
                            className="w-full h-full appearance-none bg-white border border-gray-200 rounded-xl px-4 text-black focus:outline-none focus:border-yellow-500 transition-colors shadow-sm"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
