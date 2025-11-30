const bcrypt = require("bcrypt");

const password = "1";
const hash = bcrypt.hashSync(password, 10);

console.log("Contraseña:", password);
console.log("Hash:", hash);
