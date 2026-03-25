import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nid_or_bc: '',
    institution: '',
    department: '',
    session: '',
    organizational_unit_id: '',
    custom_unit: '',
    present_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await api.get('/units/campus');
        // Add "Other" option to the fetched list
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Prep data for API
    const postData = { ...formData };
    if (postData.organizational_unit_id === 'other') {
      postData.organizational_unit_id = null;
      // If other is used, we'll rely on the existing 'institution' field
      // or we can append the custom_unit to institution
      if (postData.custom_unit) {
        postData.institution = postData.custom_unit;
      }
    }
    delete postData.custom_unit;

    try {
      await authService.register(postData);
      navigate('/login', { state: { message: 'Registration successful! Please wait for admin approval.' } });
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        // Jump to first step with error if needed
        const errorFields = Object.keys(err.response.data.errors);
        if (errorFields.some(f => ['email', 'password'].includes(f))) setStep(1);
        else if (errorFields.some(f => ['full_name', 'phone', 'nid_or_bc'].includes(f))) setStep(2);
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
                    label="Phone Number" 
                    name="phone" 
                    placeholder="017XXXXXXXX"
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
                    label="NID / Birth Certificate" 
                    name="nid_or_bc" 
                    placeholder="10, 13 or 17 digits"
                    value={formData.nid_or_bc}
                    onChange={handleChange}
                    error={errors.nid_or_bc?.[0]}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Input 
                    label="Institution Name" 
                    name="institution" 
                    placeholder="e.g. University of Dhaka"
                    value={formData.institution}
                    onChange={handleChange}
                    style={{ display: formData.organizational_unit_id === 'other' ? 'none' : 'block' }}
                  />
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
                      placeholder="Guardian/Friend Name"
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
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <p className="text-sm text-primary flex items-start">
                      <span className="mr-2">ℹ️</span>
                      By submitting this form, you agree to follow the principles and discipline of the NDM Student Movement.
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
