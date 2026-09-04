import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyRound, ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { KatanaIcon } from '@/components/ui/ShinobiIcons';

/**
 * =========================================================================
 * 🔐 SECURITY PASSPHRASE CARD (SET OR UPDATE PASSWORD)
 * =========================================================================
 * 
 * 💡 ADAPTIVE BEHAVIOR:
 * - If user registered via Firebase (Google or Phone) with no password:
 *   -> Shows "Set Security Passphrase" with NO current password requirement.
 * - If user already configured a password:
 *   -> Shows "Update Security Passphrase" requiring their current password.
 * - Both modes feature show/hide password visibility toggles and strength indicators.
 * =========================================================================
 */
export default function SecurityPassphraseCard() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const hasPassword = Boolean(user?.hasPassword);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSave = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passphrases do not match. Please verify.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      hasPassword ? 'Updating security passphrase...' : 'Configuring security passphrase...'
    );

    try {
      const payload = {
        newPassword: data.newPassword,
      };

      if (hasPassword) {
        payload.currentPassword = data.currentPassword;
      }

      const { data: res } = await userAPI.changePassword(payload);

      if (res.user) {
        updateUser(res.user);
      } else {
        updateUser({ hasPassword: true });
      }

      toast.success(
        hasPassword
          ? 'Security passphrase updated successfully! 🗡️'
          : 'Security passphrase configured! You can now sign in with email and password. 🗡️',
        { id: toastId }
      );

      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Passphrase operation failed.';
      toast.error(msg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-label="Security Passphrase"
      className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-xl space-y-6 relative overflow-hidden"
    >
      {/* Katana Edge Accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
            {hasPassword ? <KeyRound className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-white text-base">
                {hasPassword ? 'Update Security Passphrase' : 'Set Security Passphrase'}
              </h2>
              {hasPassword ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active & Protected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>No Passphrase Set</span>
                </span>
              )}
            </div>
            <p className="text-[10.5px] font-mono text-secondary mt-0.5">
              {hasPassword
                ? 'Update your master passphrase for credential-based authentication across all devices.'
                : 'You signed in via Google / Phone OTP. Set a passphrase to unlock standard email/username login.'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-extrabold text-secondary uppercase">
          // SEC-02
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        {/* Conditional: Current Password (only shown if user already has a password) */}
        {hasPassword && (
          <div className="max-w-md">
            <PasswordInput
              label="Current Passphrase"
              placeholder="Enter current security passphrase..."
              error={errors.currentPassword}
              required
              {...register('currentPassword', {
                required: 'Current passphrase is required to make changes',
              })}
            />
          </div>
        )}

        {/* New Password & Confirm Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PasswordInput
            label={hasPassword ? 'New Passphrase' : 'Create Passphrase'}
            placeholder="Min 8 characters..."
            showStrength
            error={errors.newPassword}
            helperText="Minimum 8 characters with letters, numbers, or symbols."
            required
            {...register('newPassword', {
              required: 'Passphrase is required',
              minLength: {
                value: 8,
                message: 'Passphrase must be at least 8 characters long',
              },
            })}
          />

          <PasswordInput
            label="Confirm Passphrase"
            placeholder="Re-enter passphrase..."
            error={errors.confirmPassword}
            required
            {...register('confirmPassword', {
              required: 'Please confirm your passphrase',
              validate: (val) => val === newPassword || 'Passphrases do not match',
            })}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={KatanaIcon}
            disabled={saving}
            isLoading={saving}
            className="px-7 font-bold text-xs"
          >
            <span>{hasPassword ? 'Update Passphrase' : 'Set Security Passphrase'}</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
