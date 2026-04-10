import React, { useEffect, useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { UserRole } from '../../shared/types';
import { auth } from '../../../firebase.config';

const SignUpForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.BUYER);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    shopName: '',
    displayAddress: ''
  });

  useEffect(() => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }

    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  const normalizePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0')) return `+84${cleaned.slice(1)}`;
    return cleaned;
  };

  const handleSendOtp = async () => {
    try {
      setMessage('');
      setIsSendingOtp(true);
      const appVerifier = recaptchaRef.current;
      if (!appVerifier) {
        setMessage('reCAPTCHA is not ready. Please try again.');
        return;
      }

      const phone = normalizePhoneNumber(formData.phone);
      if (!phone.startsWith('+')) {
        setMessage('Phone number must be in E.164 format, e.g. +84901234567');
        return;
      }

      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      console.log('result', result);
      setConfirmationResult(result);
      setMessage('OTP has been sent. Please enter the code.');
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      setMessage('Please send OTP first.');
      return;
    }

    try {
      setMessage('');
      setIsVerifyingOtp(true);
      await confirmationResult.confirm(otpCode);
      setIsPhoneVerified(true);
      setMessage('Phone number verified successfully.');
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || 'Invalid OTP code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNext = () => {
    if (!isPhoneVerified) {
      setMessage('Please verify your phone number before continuing.');
      return;
    }

    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      setMessage('Please verify your phone number first.');
      return;
    }

    console.log('Submit:', { role, ...formData });
  };

  return (
    <div className="signup-form max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Sign Up - Step {step}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {step === 1 && (
          <>
            <input className="border p-2" type="text" placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
            <input className="border p-2" type="text" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <select className="border p-2" value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value={UserRole.BUYER}>Buyer</option>
              <option value={UserRole.FARMER}>Farmer</option>
            </select>

            <button className="bg-indigo-500 text-white p-2 rounded disabled:opacity-60" type="button" onClick={handleSendOtp} disabled={isSendingOtp}>
              {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>

            {confirmationResult && (
              <>
                <input className="border p-2" type="text" placeholder="Enter OTP code" value={otpCode} onChange={e => setOtpCode(e.target.value)} />
                <button className="bg-purple-500 text-white p-2 rounded disabled:opacity-60" type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp}>
                  {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                </button>
              </>
            )}

            {isPhoneVerified && <p className="text-sm text-green-600">Phone verified. You can continue.</p>}
            {message && <p className="text-sm text-gray-700">{message}</p>}

            <button className="bg-blue-500 text-white p-2 rounded" type="button" onClick={handleNext}>Next</button>
          </>
        )}
        {step === 2 && role === UserRole.FARMER && (
          <>
            <input className="border p-2" type="text" placeholder="Shop Name" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} required />
            <input className="border p-2" type="text" placeholder="Shop Address" value={formData.displayAddress} onChange={e => setFormData({...formData, displayAddress: e.target.value})} required />
            <button className="bg-green-500 text-white p-2 rounded" type="submit">Complete Sign Up</button>
          </>
        )}
        {step === 2 && role === UserRole.BUYER && (
          <button className="bg-green-500 text-white p-2 rounded" type="submit">Complete Sign Up</button>
        )}
      </form>
      <div id="recaptcha-container" />
    </div>
  );
};

export default SignUpForm;