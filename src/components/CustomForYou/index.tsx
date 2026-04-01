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

    const [activeTab, setActiveTab] = useState<'area' | 'preferences'>('area');

    // Reset or Load initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab('area'); // Always start with area tab
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
                return { ...prev, bodyParts: { focus: [], avoid: [] } };
            }

            if (area === 'FULL_BODY' && type === 'focus') {
                const allParts = Object.keys(serviceData.FOCUS_POSITION || {}).filter(k => serviceData.FOCUS_POSITION?.[k as keyof typeof serviceData.FOCUS_POSITION]);
                return { ...prev, bodyParts: { focus: allParts, avoid: [] } };
            }

            // Normal toggle
            if (type === 'focus') {
                if (newFocus.includes(area)) {
                    newFocus = newFocus.filter(k => k !== area);
                } else {
                    newFocus.push(area);
                    newAvoid = newAvoid.filter(k => k !== area);
                }
            } else { // avoid
                if (newAvoid.includes(area)) {
                    newAvoid = newAvoid.filter(k => k !== area);
                } else {
                    newAvoid.push(area);
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
    const showBodyMap = !serviceData.FOCUS_POSITION || Object.values(serviceData.FOCUS_POSITION).some(v => v === true);

    // Task E3: Check visibility flags (default true for backward compatibility)
    const showNotes = serviceData.SHOW_NOTES !== false;
    const showPreferences = serviceData.SHOW_PREFERENCES !== false;

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content - Fixed Height for no scroll */}
            <div className="relative w-full sm:w-[95vw] max-w-2xl bg-white rounded-t-[32px] rounded-b-none sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-20">
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

                {/* Tabs Navigation — Only show if Preferences tab is visible (Task E3) */}
                {showPreferences && (
                    <div className="flex px-6 bg-white border-b border-gray-100 z-10">
                        <button
                            onClick={() => setActiveTab('area')}
                            className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'area'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {dict.custom_for_you?.tab_area}
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'preferences'
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {dict.custom_for_you?.tab_preferences}
                        </button>
                    </div>
                )}

                {/* Content Area - Hidden overflow and flex to fit */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 overflow-y-auto px-6 py-4 custom-scrollbar">
                        {activeTab === 'area' ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                {showBodyMap && (
                                    <BodyMap
                                        focus={prefs.bodyParts?.focus || []}
                                        avoid={prefs.bodyParts?.avoid || []}
                                        lang={lang}
                                        serviceData={serviceData}
                                        onToggle={handleBodyToggle}
                                    />
                                )}
                                {/* Task E3: Hide NoteSection when SHOW_NOTES is false */}
                                {showNotes && (
                                    <NoteSection
                                        lang={lang}
                                        serviceData={serviceData}
                                        notes={prefs.notes}
                                        onChange={handleNoteChange}
                                    />
                                )}
                            </div>
                        ) : showPreferences ? (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                <Preferences
                                    lang={lang}
                                    showStrength={!!serviceData.SHOW_STRENGTH}
                                    values={{ strength: prefs.strength, therapist: prefs.therapist }}
                                    onChange={handlePrefChange}
                                />
                            </div>
                        ) : null}
                        <div className="h-4" />
                    </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-gray-100 bg-gray-50 pb-[env(safe-area-inset-bottom)] z-20">
                    <button
                        onClick={() => onSave(prefs)}
                        className="w-full bg-[#1a1c2e] hover:bg-[#2e314a] text-white font-bold py-5 rounded-none sm:rounded-b-[32px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-black/10"
                    >
                        <Check size={20} />
                        {getText({ en: 'SAVE', vi: 'LƯU', jp: '保存', kr: '저장', cn: '保存' }, lang)}
                    </button>
                </div>

            </div>
        </div>
    );
}
