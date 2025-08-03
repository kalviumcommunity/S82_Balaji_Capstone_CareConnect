// server.js
const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('./models/doctor');
const Patient = require('./models/patient');
const aiRoute = require('./routes/ai');


const originalUse = app.use;
app.use = function (path, ...handlers) {
  console.log("[DEBUG] app.use called with:", path);
  return originalUse.apply(this, [path, ...handlers]);
};

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.log(err));

console.log("Password required:", Patient.schema.paths.password.options.required);
console.log("FullName required:", Patient.schema.paths.fullName.options.required);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

