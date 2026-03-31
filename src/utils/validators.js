export function validatePhone(phone) {
  if (!phone) return 'Phone number is required';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return 'Phone number must be 10 digits';
  if (!/^[6-9]/.test(cleaned)) return 'Invalid phone number';
  return null;
}

export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name must be less than 50 characters';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 4) return 'Password must be at least 4 characters';
  return null;
}

export function validatePrice(price) {
  // Price is optional — skip when blank
  if (price === '' || price === undefined || price === null) return null;
  const num = Number(price);
  if (isNaN(num) || num < 0) return 'Price must be a valid positive number';
  return null;
}

export function validateQuantity(quantity) {
  if (!quantity) return 'Quantity is required';
  const num = Number(quantity);
  if (isNaN(num) || num <= 0) return 'Quantity must be a positive number';
  if (!Number.isInteger(num)) return 'Quantity must be a whole number';
  return null;
}

export function validateItemName(name) {
  if (!name || !name.trim()) return 'Item name is required';
  if (name.trim().length < 2) return 'Item name must be at least 2 characters';
  return null;
}

export function validateMessage(content) {
  if (!content || !content.trim()) return 'Message cannot be empty';
  if (content.trim().length > 500) return 'Message must be less than 500 characters';
  return null;
}
