const Appointment = require('../models/appointment');
const Rating = require('../models/rating');

exports.createRating = async (req, res) => {
  const { appointmentId, score, review = '' } = req.body;
  const patientId = req.user.id;
  const numericScore = Number(score);

  if (!appointmentId || !Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
    return res.status(400).json({ success: false, message: 'Appointment and a rating from 1 to 5 are required.' });
  }

  try {
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId,
      status: 'completed',
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Only your completed appointments can be rated.' });
    }

    const rating = await Rating.create({
      patient: patientId,
      doctor: appointment.doctor,
      appointment: appointment._id,
      score: numericScore,
      review,
    });

    return res.status(201).json({ success: true, message: 'Thank you for your feedback.', data: rating });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This appointment has already been rated.' });
    }
    return res.status(500).json({ success: false, message: 'Unable to save rating.' });
  }
};

exports.getDoctorRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ doctor: req.params.doctorId })
      .populate('patient', 'fullName')
      .sort({ createdAt: -1 });
    const average = ratings.length
      ? ratings.reduce((total, rating) => total + rating.score, 0) / ratings.length
      : 0;
    return res.json({ success: true, data: { ratings, average: Number(average.toFixed(1)), count: ratings.length } });
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to load ratings.' });
  }
};