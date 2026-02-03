import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { ServiceData, CustomPreferences, LanguageCode } from "./types";
import { getText } from "./utils";
import { getDictionary } from "@/lib/dictionaries"; // Import getDictionary
import BodyMap from "./BodyMap";
import NoteSection from "./NoteSection";
import Preferences from "./Preferences";

interface CustomForYouModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prefs: CustomPreferences) => void;
    serviceData: ServiceData;
    lang: LanguageCode;
    initialData?: CustomPreferences;
}

export default function CustomForYouModal({
    isOpen,
    onClose,
    onSave,
    serviceData,
    lang,
    initialData
}: CustomForYouModalProps) {
    const dict = getDictionary(lang); // Get dictionary

    // Default State
    const [prefs, setPrefs] = useState<CustomPreferences>({
        bodyParts: { focus: [], avoid: [] },
        notes: { tag0: false, tag1: false, content: "" },
        strength: serviceData.SHOW_STRENGTH ? 'medium' : undefined,
        therapist: 'random'
    });

    // Reset or Load initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Safely merge initialData with defaults to prevent undefined errors
                setPrefs({
                    bodyParts: {
                        focus: initialData.bodyParts?.focus || [],
                        avoid: initialData.bodyParts?.avoid || []
                    },
                    notes: {
                        tag0: initialData.notes?.tag0 || false,
                        tag1: initialData.notes?.tag1 || false,
                        content: initialData.notes?.content || ""
                    },
                    strength: initialData.strength || (serviceData.SHOW_STRENGTH ? 'medium' : undefined),
                    therapist: initialData.therapist || 'random'
                });
            } else {
                // Reset to default
                setPrefs({
                    bodyParts: { focus: [], avoid: [] },
                    notes: { tag0: false, tag1: false, content: "" },
                    strength: serviceData.SHOW_STRENGTH ? 'medium' : undefined,
                    therapist: 'random'
                });
            }
        }
    }, [isOpen, initialData, serviceData]);

    if (!isOpen) return null;

    // handlers
    const handleBodyToggle = (type: 'focus' | 'avoid', area: string) => {
        setPrefs(prev => {
            let newFocus = [...prev.bodyParts.focus];
            let newAvoid = [...prev.bodyParts.avoid];

            if (area === 'CLEAR_ALL') {
                // Clear all focus/avoid logic handled by logic below based on type
                // But specifically for Full Body toggle logic which calls CLEAR_ALL on focus
                return { ...prev, bodyParts: { focus: [], avoid: [] } };
            }

            if (area === 'FULL_BODY' && type === 'focus') {
                // Select all available parts as focus
                // We need to know available parts available in BodyMap, but usually we can infer from config
                // Ideally BodyMap should pass the list, but here we can iterate serviceData.FOCUS_POSITION
                const allParts = Object.keys(serviceData.FOCUS_POSITION || {}).filter(k => serviceData.FOCUS_POSITION?.[k as keyof typeof serviceData.FOCUS_POSITION]);
                return { ...prev, bodyParts: { focus: allParts, avoid: [] } };
            }

            // Normal toggle
            if (type === 'focus') {
                if (newFocus.includes(area)) {
                    newFocus = newFocus.filter(k => k !== area);
                } else {
                    newFocus.push(area);
                    // Remove form avoid if present
                    newAvoid = newAvoid.filter(k => k !== area);
                }
            } else { // avoid
                if (newAvoid.includes(area)) {
                    newAvoid = newAvoid.filter(k => k !== area);
                } else {
                    newAvoid.push(area);
                    // Remove form focus if present
                    newFocus = newFocus.filter(k => k !== area);
                }
            }

            return { ...prev, bodyParts: { focus: newFocus, avoid: newAvoid } };
        });
    };

    const handleNoteChange = (key: string, value: any) => {
        setPrefs(prev => ({ ...prev, notes: { ...prev.notes, [key]: value } }));
    };

    const handlePrefChange = (key: string, value: any) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
    };

    // Check if we should render Body Map
    // Logic: 
    // - Nếu FOCUS_POSITION tồn tại: Chỉ hiện nếu có ít nhất 1 cái true
    // - Nếu FOCUS_POSITION không tồn tại (Data cũ): Mặc định HIỆN (để test) hoặc dựa vào Category (Tạm thời hiện hết)
    const showBodyMap = !serviceData.FOCUS_POSITION || Object.values(serviceData.FOCUS_POSITION).some(v => v === true);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content - Expanded Width */}
            <div className="relative w-[95vw] max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{dict.custom_for_you?.title}</h2>
                        <p className="text-sm text-gray-500 font-medium">
                            {getText(serviceData.NAMES, lang)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Body Map Section */}
                    {showBodyMap && (
                        <div className="mb-8">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-wider mb-4">
                                <span className="bg-green-100 p-1 rounded">👤</span>
                                {getText({ en: 'Massage Area', vn: 'Vị trí Massage', jp: 'マッサージ部位', kr: '마사지 부위', cn: '按摩部位' }, lang)}
                            </h4>
                            <BodyMap
                                focus={prefs.bodyParts?.focus || []}
                                avoid={prefs.bodyParts?.avoid || []}
                                lang={lang}
                                serviceData={serviceData}
                                onToggle={handleBodyToggle}
                            />
                        </div>
                    )}

                    {/* Notes & Preferences */}
                    <div className="space-y-6">
                        <NoteSection
                            lang={lang}
                            serviceData={serviceData}
                            notes={prefs.notes}
                            onChange={handleNoteChange}
                        />

                        <Preferences
                            lang={lang}
                            showStrength={!!serviceData.SHOW_STRENGTH}
                            values={{ strength: prefs.strength, therapist: prefs.therapist }}
                            onChange={handlePrefChange}
                        />
                    </div>

                    {/* Bottom Padding for scroll */}
                    <div className="h-4" />
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={() => onSave(prefs)}
                        className="w-full bg-[#1a1c2e] hover:bg-[#2e314a] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
                    >
                        <Check size={20} />
                        {getText({ en: 'SAVE', vn: 'LƯU', jp: '保存', kr: '저장', cn: '保存' }, lang)}
                    </button>
                </div>

            </div>
        </div>
    );
}
