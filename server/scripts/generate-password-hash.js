const bcrypt = require("bcrypt");

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

// Generate hashes for our test passwords
generateHash("banker123");
generateHash("customer123");
