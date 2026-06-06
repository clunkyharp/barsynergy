// Re-export facade — importable as @/app/auth/actions for backward compat.
// New code should import from the domain-specific modules below.

export { loginAction, logoutAction } from '@/app/auth/login/actions';
export { createBusinessAccountRequestAction, registerUserAction } from '@/app/auth/register/actions';
export { verifyUserEmailAction, resendUserVerificationAction } from '@/app/auth/verify-email/actions';
export { requestPasswordResetAction, resetPasswordAction } from '@/app/auth/password-reset/actions';
export { activateBusinessAccessAction } from '@/app/auth/business-activation/actions';
