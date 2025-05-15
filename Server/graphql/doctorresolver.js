const Doctor = require('../models/doctor');
const Address = require('../models/address');

const resolvers = {
  Query: {
    getAllDoctors: async () => {
      return await Doctor.find().populate('addresses');
    },
    getDoctorById: async (_, { id }) => {
      return await Doctor.findById(id).populate('addresses');
    },
  },

  Mutation: {

    createDoctor: async(_, { input }) => {
      const existing = await Doctor.findOne({ email: input.email });
      if (existing) {
        throw new Error("Doctor already exists with this email.");
      }

      const newDoctor = new Doctor(input);
      return await newDoctor.save();
    },

    updateDoctor: async (_, { id, input }) => {
      const doctor = await Doctor.findByIdAndUpdate(id, input, { new: true }).populate('addresses');
      if (!doctor) throw new Error("Doctor not found");
      return doctor;
    },

    deleteDoctor: async (_, { id }) => {
      const deleted = await Doctor.findByIdAndDelete(id);
      if (!deleted) throw new Error("Doctor not found");
      return "Doctor deleted successfully";
    },
  },
};

module.exports = resolvers;
