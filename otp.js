// OTP utility functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (mobile_number, otp) => {
  // Implement your SMS service here (Twilio, AWS SNS, etc.)
  // For development, just log the OTP
  console.log(`OTP for ${mobile_number}: ${otp}`);
  
  // Example with Twilio (uncomment and configure):
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  // 
  // await client.messages.create({
  //   body: `Your OTP is: ${otp}`,
  //   from: process.env.TWILIO_PHONE,
  //   to: mobile_number
  // });
  
  return Promise.resolve();
};

module.exports = { generateOTP, sendOTP };
