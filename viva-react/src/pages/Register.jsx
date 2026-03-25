import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => ({ id: b, name: b }));

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState({ photo: null, nid_doc: null, student_id_doc: null });
  const photoRef = useRef(null);
  const nidRef   = useRef(null);
  const sidRef   = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    full_name: '',
    mobile: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    nid_or_bc: '',
    institution: '',
    department: '',
    session: '',
    organizational_unit_id: '',
    custom_unit: '',
    present_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await api.get('/units/campus');
        const fetched = res.data.data;
        setCampuses([...fetched, { id: 'other', name: 'Other (Type below)' }]);
      } catch (err) {
        console.error("Failed to fetch campuses", err);
      }
    };
    fetchCampuses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0] || null;
    setFiles(prev => ({ ...prev, [field]: file }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  /** Client-side per-step validation before proceeding */
  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!formData.email) errs.email = ['Email is required.'];
      if (!formData.password) errs.password = ['Password is required.'];
      else if (formData.password.length < 8) errs.password = ['Password must be at least 8 characters.'];
      if (formData.password !== formData.password_confirmation)
        errs.password_confirmation = ['Passwords do not match.'];
    }
    if (step === 2) {
      if (!formData.full_name) errs.full_name = ['Full name is required.'];
      if (!formData.mobile) errs.mobile = ['Mobile number is required.'];
      else if (!/^(\+8801|01)[3-9]\d{8}$/.test(formData.mobile))
        errs.mobile = ['Enter a valid Bangladeshi mobile number (01XXXXXXXXX).'];
      if (!formData.nid_or_bc) errs.nid_or_bc = ['NID / Birth Certificate number is required.'];
      else if (!/^(\d{10}|\d{13}|\d{17})$/.test(formData.nid_or_bc))
        errs.nid_or_bc = ['NID must be 10, 13 or 17 digits.'];
      if (!files.nid_doc) errs.nid_doc = ['Please upload your NID or Birth Certificate scan.'];
    }
    if (step === 3) {
      if (!formData.institution) errs.institution = ['Institution name is required.'];
      if (!files.photo) errs.photo = ['A profile photo is required.'];
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(step + 1); };
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    // Text fields
    Object.entries(formData).forEach(([key, val]) => {
      if (key === 'custom_unit') return;
      if (key === 'organizational_unit_id' && val === 'other') return;
      if (val !== '') fd.append(key, val);
    });
    // Handle "other" campus
    if (formData.organizational_unit_id === 'other' && formData.custom_unit) {
      fd.set('institution', formData.custom_unit);
    }
    // Files
    if (files.photo)          fd.append('photo',          files.photo);
    if (files.nid_doc)        fd.append('nid_doc',        files.nid_doc);
    if (files.student_id_doc) fd.append('student_id_doc', files.student_id_doc);

    try {
      await authService.register(fd);
      navigate('/login', { state: { message: 'Registration submitted! Please wait for admin approval.' } });
    } catch (err) {
      if (err.response?.status === 422) {
        const apiErrors = err.response.data.errors;
        setErrors(apiErrors);
        const fields = Object.keys(apiErrors);
        if (fields.some(f => ['email', 'password'].includes(f))) setStep(1);
        else if (fields.some(f => ['full_name', 'mobile', 'nid_or_bc', 'nid_doc'].includes(f))) setStep(2);
        else if (fields.some(f => ['institution', 'photo'].includes(f))) setStep(3);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Account', icon: '👤' },
    { title: 'Personal', icon: '📝' },
    { title: 'Academic', icon: '🎓' },
    { title: 'Finalize', icon: '✅' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold text-primary mb-2"
          >
            Join the Movement
          </motion.h1>
          <p className="text-gray-600">Step {step} of 4: {steps[step-1].title}</p>
          
          <div className="flex justify-center mt-6 space-x-2">
            {steps.map((s, i) => (
              <div 
                key={i}
                className={`w-12 h-1.5 rounded-full transition-all duration-500 ${step > i ? 'bg-primary' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        <Card className="p-8 md:p-12 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.form
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <Input 
                    label="Email Address" 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email?.[0]}
                    required
                  />
                  <Input 
                    label="Password" 
                    name="password" 
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password?.[0]}
                    required
                  />
                  <Input 
                    label="Confirm Password" 
                    name="password_confirmation" 
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Full Name"
                      name="full_name"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      error={errors.full_name?.[0]}
                      required
                    />
                  </div>
                  <Input
                    label="Mobile Number"
                    name="mobile"
                    placeholder="01XXXXXXXXX"
                    value={formData.mobile}
                    onChange={handleChange}
                    error={errors.mobile?.[0]}
                    required
                  />
                  <Input
                    label="Alternate Phone"
                    name="phone"
                    placeholder="01XXXXXXXXX (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone?.[0]}
                  />
                  <Input
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    error={errors.date_of_birth?.[0]}
                  />
                  <Select
                    label="Gender"
                    name="gender"
                    options={[{id: 'male', name: 'Male'}, {id: 'female', name: 'Female'}, {id: 'other', name: 'Other'}]}
                    value={formData.gender}
                    onChange={handleChange}
                    error={errors.gender?.[0]}
                  />
                  <Input
                    label="NID / Birth Certificate Number"
                    name="nid_or_bc"
                    placeholder="10, 13 or 17 digits"
                    value={formData.nid_or_bc}
                    onChange={handleChange}
                    error={errors.nid_or_bc?.[0]}
                    required
                  />
                  <Select
                    label="Blood Group"
                    name="blood_group"
                    options={BLOOD_GROUPS}
                    value={formData.blood_group}
                    onChange={handleChange}
                    error={errors.blood_group?.[0]}
                  />
                  {/* NID Document upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NID / Birth Certificate Scan <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${errors.nid_doc ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-primary'}`}
                      onClick={() => nidRef.current?.click()}
                    >
                      {files.nid_doc
                        ? <p className="text-sm text-green-700">✓ {files.nid_doc.name}</p>
                        : <p className="text-sm text-gray-500">Click to upload PDF, JPG or PNG (max 5 MB)</p>
                      }
                      <input ref={nidRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange('nid_doc')} />
                    </div>
                    {errors.nid_doc && <p className="text-xs text-red-600 mt-1">{errors.nid_doc[0]}</p>}
                  </div>
                  {/* Student ID upload (optional) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID Card Scan <span className="text-gray-400">(optional)</span>
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => sidRef.current?.click()}
                    >
                      {files.student_id_doc
                        ? <p className="text-sm text-green-700">✓ {files.student_id_doc.name}</p>
                        : <p className="text-sm text-gray-500">Click to upload PDF, JPG or PNG (max 5 MB)</p>
                      }
                      <input ref={sidRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange('student_id_doc')} />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile photo upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${errors.photo ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-primary'}`}
                      onClick={() => photoRef.current?.click()}
                    >
                      {files.photo ? (
                        <div className="flex items-center justify-center gap-3">
                          <img src={URL.createObjectURL(files.photo)} alt="preview" className="w-16 h-16 rounded-full object-cover" />
                          <span className="text-sm text-green-700">✓ {files.photo.name}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Click to upload JPG, PNG or WebP (max 2 MB)</p>
                      )}
                      <input ref={photoRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileChange('photo')} />
                    </div>
                    {errors.photo && <p className="text-xs text-red-600 mt-1">{errors.photo[0]}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Select
                      label="Your Campus / Unit"
                      name="organizational_unit_id"
                      options={campuses}
                      value={formData.organizational_unit_id}
                      onChange={handleChange}
                      error={errors.organizational_unit_id?.[0]}
                    />
                  </div>
                  {formData.organizational_unit_id === 'other' && (
                    <div className="md:col-span-2">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <Input
                          label="Write Your College/Institution Name"
                          name="custom_unit"
                          placeholder="e.g. Government Titumir College"
                          value={formData.custom_unit}
                          onChange={handleChange}
                          required
                        />
                      </motion.div>
                    </div>
                  )}
                  <div className={formData.organizational_unit_id === 'other' ? 'md:col-span-2' : ''}>
                    <Input
                      label="Institution Name"
                      name="institution"
                      placeholder="e.g. University of Dhaka"
                      value={formData.institution}
                      onChange={handleChange}
                      error={errors.institution?.[0]}
                      required
                    />
                  </div>
                  <Input
                    label="Department"
                    name="department"
                    placeholder="e.g. Political Science"
                    value={formData.department}
                    onChange={handleChange}
                  />
                  <Input
                    label="Session"
                    name="session"
                    placeholder="e.g. 2022-23"
                    value={formData.session}
                    onChange={handleChange}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Emergency Contact Name"
                      name="emergency_contact_name"
                      placeholder="Guardian / Friend Name"
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                    />
                    <Input
                      label="Emergency Contact Phone"
                      name="emergency_contact_phone"
                      placeholder="01XXXXXXXXX"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                    />
                  </div>
                  <Input
                    label="Present Address"
                    name="present_address"
                    placeholder="Current staying address"
                    value={formData.present_address}
                    onChange={handleChange}
                  />
                  <Input
                    label="Permanent Address"
                    name="permanent_address"
                    placeholder="Home / village address"
                    value={formData.permanent_address}
                    onChange={handleChange}
                  />
                  {/* Summary */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-1 text-sm text-gray-700">
                    <p className="font-semibold text-gray-800 mb-2">Submission Summary</p>
                    <p><span className="text-gray-500 w-28 inline-block">Name:</span>{formData.full_name}</p>
                    <p><span className="text-gray-500 w-28 inline-block">Mobile:</span>{formData.mobile}</p>
                    <p><span className="text-gray-500 w-28 inline-block">Institution:</span>{formData.institution || formData.custom_unit}</p>
                    <p><span className="text-gray-500 w-28 inline-block">Photo:</span>{files.photo?.name || '—'}</p>
                    <p><span className="text-gray-500 w-28 inline-block">NID Doc:</span>{files.nid_doc?.name || '—'}</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-sm text-primary flex items-start">
                      <span className="mr-2">ℹ️</span>
                      By submitting this form you agree to follow the principles and discipline of the NDM Student Movement. Your NID number is encrypted and stored securely.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-gray-100 mt-10">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePrev}>
                    Back
                  </Button>
                ) : <div />}
                
                {step < 4 ? (
                  <Button type="button" onClick={handleNext}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" loading={loading}>
                    Complete Registration
                  </Button>
                )}
              </div>
            </motion.form>
          </AnimatePresence>
        </Card>

        <p className="text-center mt-8 text-gray-600">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
