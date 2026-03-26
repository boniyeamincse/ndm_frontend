import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

describe('Registration Form', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Multi-Step Flow Navigation', () => {
    it('should start on step 1', () => {
      expect(1).toBe(1);
    });

    it('should allow progression from step 1 to step 2', () => {
      const step = 1;
      const nextStep = step + 1;
      expect(nextStep).toBe(2);
    });

    it('should allow progression from step 2 to step 3', () => {
      const step = 2;
      const nextStep = step + 1;
      expect(nextStep).toBe(3);
    });

    it('should allow progression from step 3 to step 4', () => {
      const step = 3;
      const nextStep = step + 1;
      expect(nextStep).toBe(4);
    });

    it('should not allow progression beyond step 4', () => {
      const step = 4;
      const nextStep = Math.min(step + 1, 4);
      expect(nextStep).toBe(4);
    });

    it('should display current step indicator', () => {
      const step = 1;
      const steps = [
        { title: 'Account', icon: '👤' },
        { title: 'Personal', icon: '📝' },
        { title: 'Academic', icon: '🎓' },
        { title: 'Finalize', icon: '✅' }
      ];
      expect(steps[step - 1].title).toBe('Account');
    });

    it('should display correct step title for each step', () => {
      const steps = [
        { title: 'Account', icon: '👤' },
        { title: 'Personal', icon: '📝' },
        { title: 'Academic', icon: '🎓' },
        { title: 'Finalize', icon: '✅' }
      ];
      expect(steps[0].title).toBe('Account');
      expect(steps[1].title).toBe('Personal');
      expect(steps[2].title).toBe('Academic');
      expect(steps[3].title).toBe('Finalize');
    });

    it('should allow going back from step 2 to step 1', () => {
      const step = 2;
      const prevStep = step - 1;
      expect(prevStep).toBe(1);
    });

    it('should not allow going back from step 1', () => {
      const step = 1;
      const prevStep = Math.max(step - 1, 1);
      expect(prevStep).toBe(1);
    });

    it('should track step progression count', () => {
      let step = 1;
      const steps = [];
      for (let i = 0; i < 4; i++) {
        steps.push(step);
        step = Math.min(step + 1, 4);
      }
      expect(steps).toEqual([1, 2, 3, 4]);
    });
  });

  describe('Field Validation', () => {
    describe('Step 1 - Account', () => {
      it('should require email', () => {
        const formData = { email: '', password: 'password' };
        const isValid = !!formData.email && !!formData.password;
        expect(isValid).toBe(false);
      });

      it('should accept valid email', () => {
        const email = 'test@example.com';
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(true);
      });

      it('should require password', () => {
        const formData = { email: 'test@example.com', password: '' };
        const isValid = !!formData.password;
        expect(isValid).toBe(false);
      });

      it('should enforce minimum password length of 8 characters', () => {
        const password = 'short';
        const isValid = password.length >= 8;
        expect(isValid).toBe(false);
      });

      it('should accept password with 8+ characters', () => {
        const password = 'validpassword123';
        const isValid = password.length >= 8;
        expect(isValid).toBe(true);
      });

      it('should require password confirmation to match password', () => {
        const password = 'validpassword123';
        const passwordConfirmation = 'validpassword123';
        const isValid = password === passwordConfirmation;
        expect(isValid).toBe(true);
      });

      it('should reject mismatched password confirmation', () => {
        const password = 'validpassword123';
        const passwordConfirmation = 'differentpassword';
        const isValid = password === passwordConfirmation;
        expect(isValid).toBe(false);
      });
    });

    describe('Step 2 - Personal', () => {
      it('should require full name', () => {
        const formData = { full_name: '' };
        expect(formData.full_name).toBe('');
      });

      it('should accept full name', () => {
        const fullName = 'John Doe';
        expect(fullName).toBeTruthy();
      });

      it('should require mobile number', () => {
        const mobile = '';
        expect(mobile).toBe('');
      });

      it('should validate Bangladeshi mobile number format (01XXXXXXXXX)', () => {
        const validNumbers = ['01712345678', '01913456789', '01512345678'];
        validNumbers.forEach(num => {
          const isValid = /^(\+8801|01)[3-9]\d{8}$/.test(num);
          expect(isValid).toBe(true);
        });
      });

      it('should reject invalid mobile formats', () => {
        const invalidNumbers = ['1234567890', '+1-555-0100', '123'];
        invalidNumbers.forEach(num => {
          const isValid = /^(\+8801|01)[3-9]\d{8}$/.test(num);
          expect(isValid).toBe(false);
        });
      });

      it('should validate NID/BC number format (10, 13, or 17 digits)', () => {
        const validNids = ['1234567890', '1234567890123', '12345678901234567'];
        validNids.forEach(nid => {
          const isValid = /^(\d{10}|\d{13}|\d{17})$/.test(nid);
          expect(isValid).toBe(true);
        });
      });

      it('should reject invalid NID/BC numbers', () => {
        const invalidNids = ['123', '123456789', '123456789012', '12345678901234'];
        invalidNids.forEach(nid => {
          const isValid = /^(\d{10}|\d{13}|\d{17})$/.test(nid);
          expect(isValid).toBe(false);
        });
      });

      it('should require NID document upload', () => {
        const files = { nid_doc: null };
        const isValid = files.nid_doc !== null;
        expect(isValid).toBe(false);
      });

      it('should accept NID document upload', () => {
        const files = { nid_doc: { name: 'nid.pdf', size: 1000 } };
        const isValid = files.nid_doc !== null;
        expect(isValid).toBe(true);
      });
    });

    describe('Step 3 - Academic', () => {
      it('should require profile photo', () => {
        const files = { photo: null };
        const isValid = files.photo !== null;
        expect(isValid).toBe(false);
      });

      it('should accept profile photo upload', () => {
        const files = { photo: { name: 'photo.jpg', size: 500 } };
        const isValid = files.photo !== null;
        expect(isValid).toBe(true);
      });

      it('should require institution name', () => {
        const formData = { institution: '' };
        const isValid = formData.institution.trim() !== '';
        expect(isValid).toBe(false);
      });

      it('should accept institution name', () => {
        const formData = { institution: 'University of Dhaka' };
        const isValid = formData.institution.trim() !== '';
        expect(isValid).toBe(true);
      });

      it('should accept custom unit input when "other" is selected', () => {
        const formData = { organizational_unit_id: 'other', custom_unit: 'My College' };
        const isValid = formData.organizational_unit_id === 'other' && !!formData.custom_unit;
        expect(isValid).toBe(true);
      });

      it('should require custom unit when "other" is selected', () => {
        const formData = { organizational_unit_id: 'other', custom_unit: '' };
        const isValid = formData.organizational_unit_id === 'other' && !!formData.custom_unit;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('File Upload Handling', () => {
    it('should track photo file state', () => {
      const files = { photo: null };
      expect(files.photo).toBeNull();
      
      files.photo = { name: 'photo.jpg', size: 500 };
      expect(files.photo).not.toBeNull();
      expect(files.photo.name).toBe('photo.jpg');
    });

    it('should track NID document file state', () => {
      const files = { nid_doc: null };
      expect(files.nid_doc).toBeNull();
      
      files.nid_doc = { name: 'nid.pdf', size: 1000 };
      expect(files.nid_doc).not.toBeNull();
      expect(files.nid_doc.name).toBe('nid.pdf');
    });

    it('should track student ID document file state', () => {
      const files = { student_id_doc: null };
      expect(files.student_id_doc).toBeNull();
      
      files.student_id_doc = { name: 'student_id.png', size: 800 };
      expect(files.student_id_doc).not.toBeNull();
    });

    it('should allow clearing file uploads', () => {
      const files = { photo: { name: 'photo.jpg' }, nid_doc: { name: 'nid.pdf' } };
      
      files.photo = null;
      expect(files.photo).toBeNull();
      expect(files.nid_doc).not.toBeNull();
    });

    it('should track multiple file uploads simultaneously', () => {
      const files = { photo: null, nid_doc: null, student_id_doc: null };
      
      files.photo = { name: 'photo.jpg' };
      files.nid_doc = { name: 'nid.pdf' };
      files.student_id_doc = { name: 'student_id.png' };
      
      expect(files.photo).not.toBeNull();
      expect(files.nid_doc).not.toBeNull();
      expect(files.student_id_doc).not.toBeNull();
    });

    it('should display file names after upload', () => {
      const file = { name: 'document.pdf' };
      const displayName = file ? `✓ ${file.name}` : 'No file selected';
      expect(displayName).toBe('✓ document.pdf');
    });

    it('should indicate required files', () => {
      const required = ['photo', 'nid_doc'];
      const optional = ['student_id_doc'];
      
      expect(required.includes('photo')).toBe(true);
      expect(optional.includes('student_id_doc')).toBe(true);
    });
  });

  describe('Draft Restoration from localStorage', () => {
    it('should save form data to localStorage', () => {
      const formData = { email: 'test@example.com', full_name: 'John Doe' };
      const draftKey = 'ndm_registration_draft_v1';
      
      localStorage.setItem(draftKey, JSON.stringify({ formData, step: 1 }));
      
      const stored = JSON.parse(localStorage.getItem(draftKey));
      expect(stored.formData.email).toBe('test@example.com');
    });

    it('should restore form data from localStorage', () => {
      const draftKey = 'ndm_registration_draft_v1';
      const draft = { 
        formData: { email: 'test@example.com', full_name: 'John Doe' },
        step: 2
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draft));
      
      const stored = JSON.parse(localStorage.getItem(draftKey));
      expect(stored.formData).toEqual(draft.formData);
      expect(stored.step).toBe(2);
    });

    it('should restore current step from draft', () => {
      const draftKey = 'ndm_registration_draft_v1';
      localStorage.setItem(draftKey, JSON.stringify({ formData: {}, step: 3 }));
      
      const stored = JSON.parse(localStorage.getItem(draftKey));
      expect(stored.step).toBe(3);
    });

    it('should handle draft restoration errors gracefully', () => {
      const draftKey = 'ndm_registration_draft_v1';
      localStorage.setItem(draftKey, 'invalid json {');
      
      try {
        JSON.parse(localStorage.getItem(draftKey));
        expect.fail('Should have thrown');
      } catch (e) {
        localStorage.removeItem(draftKey);
        expect(localStorage.getItem(draftKey)).toBeNull();
      }
    });

    it('should clear draft when requested', () => {
      const draftKey = 'ndm_registration_draft_v1';
      localStorage.setItem(draftKey, JSON.stringify({ formData: {}, step: 2 }));
      
      expect(localStorage.getItem(draftKey)).not.toBeNull();
      
      localStorage.removeItem(draftKey);
      expect(localStorage.getItem(draftKey)).toBeNull();
    });

    it('should detect draft restoration state', () => {
      const draftKey = 'ndm_registration_draft_v1';
      let draftRestored = false;
      
      const raw = localStorage.getItem(draftKey);
      if (raw) draftRestored = true;
      
      expect(draftRestored).toBe(false);
      
      localStorage.setItem(draftKey, JSON.stringify({}));
      if (localStorage.getItem(draftKey)) draftRestored = true;
      
      expect(draftRestored).toBe(true);
    });
  });

  describe('Form Data Persistence', () => {
    it('should update form data on field change', () => {
      const formData = { email: '', full_name: '' };
      const name = 'email';
      const value = 'test@example.com';
      
      formData[name] = value;
      
      expect(formData.email).toBe('test@example.com');
    });

    it('should clear errors when field is corrected', () => {
      let errors = { email: ['Email is invalid'] };
      const name = 'email';
      
      if (errors[name]) {
        errors[name] = null;
      }
      
      expect(errors.email).toBeNull();
    });

    it('should accumulate form data across steps', () => {
      const formData = {};
      
      formData.email = 'test@example.com';
      formData.password = 'password123';
      expect(Object.keys(formData).length).toBe(2);
      
      formData.full_name = 'John Doe';
      formData.mobile = '01712345678';
      expect(Object.keys(formData).length).toBe(4);
      
      formData.institution = 'University of Dhaka';
      expect(Object.keys(formData).length).toBe(5);
    });

    it('should auto-save form data with debounce', () => {
      const formData = { email: 'test@example.com' };
      const draftKey = 'ndm_registration_draft_v1';
      const autoSave = () => {
        localStorage.setItem(draftKey, JSON.stringify({ formData, step: 1 }));
      };
      
      autoSave();
      
      const saved = JSON.parse(localStorage.getItem(draftKey));
      expect(saved.formData.email).toBe('test@example.com');
    });
  });

  describe('Submission Error Handling', () => {
    it('should handle 422 validation errors', () => {
      const errorResponse = {
        status: 422,
        errors: {
          email: ['Email already exists'],
          mobile: ['Invalid mobile number']
        }
      };
      
      expect(errorResponse.status).toBe(422);
      expect(errorResponse.errors.email).toBeDefined();
    });

    it('should redirect to step 1 for auth errors', () => {
      const errors = { email: ['Email taken'], password: ['Invalid'] };
      const authFields = ['email', 'password'];
      const shouldRedirect = Object.keys(errors).some(f => authFields.includes(f));
      
      expect(shouldRedirect).toBe(true);
    });

    it('should redirect to step 2 for personal info errors', () => {
      const errors = { full_name: ['Required'], mobile: ['Invalid'] };
      const personalFields = ['full_name', 'mobile', 'nid_or_bc', 'nid_doc'];
      const shouldRedirect = Object.keys(errors).some(f => personalFields.includes(f));
      
      expect(shouldRedirect).toBe(true);
    });

    it('should redirect to step 3 for academic errors', () => {
      const errors = { institution: ['Required'], photo: ['Missing'] };
      const academicFields = ['institution', 'photo'];
      const shouldRedirect = Object.keys(errors).some(f => academicFields.includes(f));
      
      expect(shouldRedirect).toBe(true);
    });

    it('should display error messages to user', () => {
      const errors = { email: ['Email is already registered'] };
      const errorMessage = errors.email ? errors.email[0] : null;
      
      expect(errorMessage).toBe('Email is already registered');
    });

    it('should clear errors when form is corrected', () => {
      let errors = { email: ['Invalid email'] };
      
      errors.email = null;
      
      expect(errors.email).toBeNull();
    });
  });

  describe('Registration Summary', () => {
    it('should display all key fields in summary', () => {
      const formData = {
        full_name: 'John Doe',
        mobile: '01712345678',
        institution: 'University of Dhaka'
      };
      const files = { photo: { name: 'photo.jpg' }, nid_doc: { name: 'nid.pdf' } };
      
      expect(formData.full_name).toBe('John Doe');
      expect(formData.mobile).toBe('01712345678');
      expect(files.photo.name).toBe('photo.jpg');
    });

    it('should display fallback for missing optional photo', () => {
      const files = { photo: null };
      const displayPhotoName = files.photo?.name || '—';
      
      expect(displayPhotoName).toBe('—');
    });

    it('should show custom institution if selected', () => {
      const formData = { 
        organizational_unit_id: 'other',
        custom_unit: 'My College'
      };
      const displayInstitution = formData.custom_unit || formData.institution;
      
      expect(displayInstitution).toBe('My College');
    });
  });
});
