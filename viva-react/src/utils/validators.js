export const validatePhone = (phone) => {
  const re = /^(\+8801|01)[3-9]\d{8}$/;
  return re.test(phone);
};

export const validateNID = (nid) => {
  return /^(\d{10}|\d{13}|\d{17})$/.test(nid);
};
