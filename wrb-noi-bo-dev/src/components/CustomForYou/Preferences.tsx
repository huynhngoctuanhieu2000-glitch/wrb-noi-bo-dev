import React from 'react';
import { User, Activity } from 'lucide-react';
import { LanguageCode } from './types';
import { getText } from './utils';

interface PreferencesProps {
    lang: LanguageCode;
    showStrength: boolean;
    values: {
        strength?: 'light' | 'medium' | 'strong';
        therapist: 'male' | 'female' | 'random';
    };
    onChange: (key: string, value: any) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ lang, showStrength, values, onChange }) => {
    const strengthOptions = [
        { value: 'light', label: { en: 'Light', vn: 'Nhẹ', jp: '弱い', kr: '약하게', cn: '轻' } },
        { value: 'medium', label: { en: 'Medium', vn: 'Vừa', jp: '普通', kr: '보통', cn: '中' } },
        { value: 'strong', label: { en: 'Strong', vn: 'Mạnh', jp: '強い', kr: '강하게', cn: '重' } },
    ];

    const therapistOptions = [
        { value: 'male', label: { en: 'Male', vn: 'Nam', jp: '男性', kr: '남성', cn: '男' } },
        { value: 'female', label: { en: 'Female', vn: 'Nữ', jp: '女性', kr: '여성', cn: '女' } },
        { value: 'random', label: { en: 'Random', vn: 'Ngẫu nhiên', jp: 'お任せ', kr: '랜덤', cn: '随机' } },
    ];

    return (
        <div className="w-full mt-4 space-y-4">
            {/* Strength Section */}
            {showStrength && (
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        <Activity size={12} />
                        {getText({ en: 'Strength', vn: 'Lực', jp: '強さ', kr: '강도', cn: '力度' }, lang)}
                    </h4>
                    <div className="flex gap-2">
                        {strengthOptions.map((opt) => {
                            let activeClass = '';
                            if (values.strength === opt.value) {
                                if (opt.value === 'light') activeClass = 'bg-green-50 border-green-500 text-green-700 shadow-sm';
                                else if (opt.value === 'medium') activeClass = 'bg-yellow-50 border-yellow-400 text-yellow-700 shadow-sm';
                                else if (opt.value === 'strong') activeClass = 'bg-red-50 border-red-500 text-red-700 shadow-sm';
                            } else {
                                activeClass = 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50';
                            }
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => onChange('strength', opt.value)}
                                    className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold border transition-all ${activeClass}`}
                                >
                                    {getText(opt.label, lang)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Therapist Section */}
            <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <User size={12} />
                    {getText({ en: 'Therapist', vn: 'Kỹ thuật viên', jp: 'セラピスト', kr: '테라피스트', cn: '技师' }, lang)}
                </h4>
                <div className="flex gap-2">
                    {therapistOptions.map((opt) => {
                        let activeClass = '';
                        if (values.therapist === opt.value) {
                            if (opt.value === 'male') activeClass = 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm';
                            else if (opt.value === 'female') activeClass = 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm';
                            else if (opt.value === 'random') activeClass = 'bg-green-50 border-green-500 text-green-700 shadow-sm';
                        } else {
                            activeClass = 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50';
                        }
                        return (
                            <button
                                key={opt.value}
                                onClick={() => onChange('therapist', opt.value)}
                                className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold border transition-all ${activeClass}`}
                            >
                                {getText(opt.label, lang)}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Preferences;
