'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface RegistrationForm {
  fullName: string;
  phoneNumber: string;
  countryCode: string;
  location: string;
  email: string;
  password: string;
}

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationForm>({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      countryCode: '+506',
      location: 'Costa Rica',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: RegistrationForm) => {
    console.log('data', data);
    setIsSubmitting(true);
    try {
      // Firebase integration will go here
      router.push('/auth/verify-email');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setValue('phoneNumber', value, {
      shouldValidate: true,
    });
  };

  const handlePasswordChange = (value: string) => {
    setValue('password', value, {
      shouldValidate: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-200"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: {
                value: 3,
                message: 'Full name must be at least 3 characters',
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Full name can only contain letters',
              },
            })}
            placeholder="John Smith"
            variant="underlined"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-200"
          >
            Phone Number
          </label>
          <div className="flex gap-2">
            <Select
              id="phone-country-code"
              value={watch('countryCode')}
              onChange={(e) => setValue('countryCode', e.target.value)}
              className="w-24"
              variant="underlined"
            >
              <option value="+506">🇨🇷 +506</option>
            </Select>
            <Input
              id="phone"
              type="tel"
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\d+$/,
                  message: 'Phone number can only contain numbers',
                },
                minLength: {
                  value: 8,
                  message: 'Phone number must be at least 8 digits',
                },
                maxLength: {
                  value: 12,
                  message: 'Phone number cannot exceed 12 digits',
                },
              })}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                handlePhoneChange(value);
              }}
              className="flex-1"
              placeholder="74812445"
              variant="underlined"
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-500">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-200"
          >
            Location
          </label>
          <Select
            id="location"
            value={watch('location')}
            onChange={(e) => setValue('location', e.target.value)}
            variant="underlined"
          >
            <option value="Costa Rica">Costa Rica</option>
          </Select>
          {errors.location && (
            <p className="mt-1 text-sm text-red-500">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-200"
          >
            Email Address
          </label>
          <Input
            id="email"
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            })}
            type="email"
            placeholder="john.smith@example.com"
            variant="underlined"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-200"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={watch('password') || ''}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="pr-10"
              placeholder="******************"
              variant="underlined"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Password must be at least 8 characters long and contain at least one
            uppercase letter, one lowercase letter, one number, and one special
            character.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || Object.keys(errors).length > 0}
        className="w-full bg-default-color text-white py-3 rounded-md hover:bg-default-color disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-8"
      >
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
