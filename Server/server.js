// server.js
const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('./models/doctor');
const Patient = require('./models/patient');
const aiRoute = require('./routes/ai');
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.log(err));

console.log("Password required:", Patient.schema.paths.password.options.required);
console.log("FullName required:", Patient.schema.paths.fullName.options.required);

app.use('/api/ai', aiRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

