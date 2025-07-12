const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

// Example usage
hashPassword('nik123'); 