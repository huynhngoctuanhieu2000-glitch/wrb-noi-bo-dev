import React from 'react';

interface CustomerInfoProps {
    lang: string;
    dict: any; // Accept dict
    info: { name: string; email: string; phone: string; gender: string; room?: string };
    onChange: (field: string, value: string) => void;
}

export default function CustomerInfo({ lang, dict, info, onChange }: CustomerInfoProps) {
    return (
        <div className="bg-[#1c1c1e] text-white p-5 rounded-3xl shadow-sm border border-white/5">
            <h2 className="text-[#C9A96E] font-bold uppercase tracking-widest text-xs mb-4">
                {dict.checkout.customer_info}
            </h2>

            <div className="space-y-4">
                {/* Full Name */}
                <input
                    type="text"
                    value={info.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder={dict.checkout.full_name}
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A96E] transition-colors shadow-sm"
                />

                {/* Email */}
                <input
                    type="email"
                    value={info.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    placeholder={dict.checkout.email}
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A96E] transition-colors shadow-sm"
                />

                <div className="flex gap-4">
                    {/* Phone */}
                    <input
                        type="tel"
                        value={info.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        placeholder={dict.checkout.phone}
                        className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A96E] transition-colors shadow-sm"
                    />

                    {/* Gender */}
                    <div className="w-1/3 relative">
                        <select
                            value={info.gender}
                            onChange={(e) => onChange('gender', e.target.value)}
                            className="w-full h-full appearance-none bg-[#0d0d0d] border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-[#C9A96E] transition-colors shadow-sm"
                        >
                            <option value="Male">{dict.checkout.male}</option>
                            <option value="Female">{dict.checkout.female}</option>
                            <option value="Other">{dict.checkout.other}</option>
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
