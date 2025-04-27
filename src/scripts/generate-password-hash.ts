import { hash } from 'bcrypt';

async function generateHash() {
  const password = '123456';
  const hashedPassword = await hash(password, 10);
  console.log('Hashed password:', hashedPassword);
}

generateHash(); 