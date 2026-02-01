import React from 'react';
import { Tag } from 'lucide-react';
import { LanguageCode, ServiceData } from './types';
import { getText } from './utils';

interface NoteSectionProps {
    lang: LanguageCode;
    serviceData: ServiceData;
    notes: {
        tag0: boolean;
        tag1: boolean;
        content: string;
    };
    onChange: (key: string, value: any) => void;
}

const NoteSection: React.FC<NoteSectionProps> = ({ lang, serviceData, notes, onChange }) => {
    // Lấy Tag Data từ Service (nếu có)
    const tags = serviceData.TAGS || [];

    // Tag 0 (Pregnant)
    const tag0Data = tags[0];
    // Tag 1 (Allergy)
    const tag1Data = tags[1];

    return (
        <div className="w-full mt-4">
            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Tag size={12} />
                {getText({ en: 'Notes', vn: 'Ghi chú', jp: 'ノート', kr: '참고', cn: '笔记' }, lang)}
            </h4>

            {/* Tags Selection */}
            <div className="flex gap-2 mb-3">
                {tag0Data && (
                    <button
                        onClick={() => onChange('tag0', !notes.tag0)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${notes.tag0
                                ? 'bg-red-50 border-red-200 text-red-600 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {getText(tag0Data, lang)}
                    </button>
                )}

                {tag1Data && (
                    <button
                        onClick={() => onChange('tag1', !notes.tag1)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${notes.tag1
                                ? 'bg-yellow-50 border-yellow-200 text-yellow-600 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {getText(tag1Data, lang)}
                    </button>
                )}
            </div>

            {/* Textarea */}
            <textarea
                value={notes.content}
                onChange={(e) => onChange('content', e.target.value)}
                placeholder={getText(serviceData.HINT || { en: 'Other notes...', vn: 'Ghi chú khác...' }, lang)}
                className="w-full h-20 p-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-black/20 focus:outline-none transition-colors resize-none"
            />
        </div>
    );
};

export default NoteSection;
