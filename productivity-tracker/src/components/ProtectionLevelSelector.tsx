import { Shield, ShieldOff, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import type { ProtectionLevel } from '../types/contentProtection';
import { PROTECTION_LEVELS } from '../types/contentProtection';

interface ProtectionLevelSelectorProps {
    currentLevel: ProtectionLevel;
    onLevelChange: (level: ProtectionLevel) => void;
    requiresPin?: boolean;
}

export function ProtectionLevelSelector({
    currentLevel,
    onLevelChange,
    requiresPin = false,
}: ProtectionLevelSelectorProps) {
    const levels: ProtectionLevel[] = ['off', 'light', 'strong', 'strict'];

    const icons = {
        off: ShieldOff,
        light: Shield,
        strong: ShieldAlert,
        strict: ShieldCheck,
    };

    const colors = {
        off: 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
        light: 'border-blue-300 dark:border-blue-600 hover:border-blue-400',
        strong: 'border-amber-300 dark:border-amber-600 hover:border-amber-400',
        strict: 'border-red-300 dark:border-red-600 hover:border-red-400',
    };

    const selectedColors = {
        off: 'border-gray-500 bg-gray-50 dark:bg-gray-700',
        light: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        strong: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
        strict: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Protection Level
                </h4>
                {requiresPin && (
                    <div className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
                        <Lock className="w-3 h-3" />
                        <span>PIN Required</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {levels.map((level) => {
                    const Icon = icons[level];
                    const config = PROTECTION_LEVELS[level];
                    const isSelected = currentLevel === level;

                    return (
                        <button
                            key={level}
                            onClick={() => onLevelChange(level)}
                            className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200
                ${isSelected ? selectedColors[level] : colors[level]}
                hover:shadow-lg transform hover:scale-105
                ${isSelected ? 'ring-2 ring-offset-2 ring-violet-500' : ''}
              `}
                        >
                            <div className="flex items-start gap-3">
                                <Icon
                                    className={`w-6 h-6 mt-0.5 ${isSelected
                                        ? 'text-violet-600 dark:text-violet-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                />
                                <div className="flex-1">
                                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {config.name}
                                    </h5>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                        {config.description}
                                    </p>

                                    {config.features.length > 0 && (
                                        <ul className="space-y-1">
                                            {config.features.slice(0, 3).map((feature, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-xs text-gray-500 dark:text-gray-500 flex items-start gap-1"
                                                >
                                                    <span className="text-violet-500 mt-0.5">•</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {isSelected && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                                        ✓ Currently Active
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
