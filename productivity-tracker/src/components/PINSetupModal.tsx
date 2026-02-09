import { useState } from 'react';
import { X } from 'lucide-react';
import Button from './ui/Button';

interface PINSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSetPin: (pin: string, oldPin?: string) => boolean;
    mode: 'set' | 'verify' | 'change';
    existingPin?: boolean;
}

export function PINSetupModal({
    isOpen,
    onClose,
    onSetPin,
    mode,
}: PINSetupModalProps) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [oldPin, setOldPin] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (pin.length < 4 || pin.length > 6) {
            setError('PIN must be 4-6 digits');
            return;
        }

        if (!/^\d+$/.test(pin)) {
            setError('PIN must contain only numbers');
            return;
        }

        if (mode === 'set' || mode === 'change') {
            if (pin !== confirmPin) {
                setError('PINs do not match');
                return;
            }
        }

        // Call parent handler
        const success = onSetPin(pin, mode === 'change' ? oldPin : undefined);

        if (success) {
            setPin('');
            setConfirmPin('');
            setOldPin('');
            onClose();
        } else {
            setError(mode === 'verify' ? 'Incorrect PIN' : 'Failed to set PIN');
        }
    };

    const handleClose = () => {
        setPin('');
        setConfirmPin('');
        setOldPin('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {mode === 'set' && 'Set Protection PIN'}
                        {mode === 'verify' && 'Enter PIN'}
                        {mode === 'change' && 'Change PIN'}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'change' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current PIN
                            </label>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                value={oldPin}
                                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center text-2xl tracking-widest"
                                placeholder="••••"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {mode === 'verify' ? 'Enter PIN' : mode === 'change' ? 'New PIN' : 'Create PIN'}
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center text-2xl tracking-widest"
                            placeholder="••••"
                            required
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            4-6 digit numeric PIN
                        </p>
                    </div>

                    {(mode === 'set' || mode === 'change') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm PIN
                            </label>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center text-2xl tracking-widest"
                                placeholder="••••"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" fullWidth>
                            {mode === 'verify' ? 'Verify' : 'Confirm'}
                        </Button>
                    </div>
                </form>

                {mode === 'set' && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Important:</strong> This PIN will be required to change protection settings or disable filtering. Make sure to remember it!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
