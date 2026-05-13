import nodemailer from "nodemailer";

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email to user (customer)
export const sendCustomerEmail = async (booking) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CUSTOMER_EMAIL_PREFIX ? 
        `${booking.phone}@${process.env.CUSTOMER_EMAIL_DOMAIN}` : 
        booking.phone, // Fallback: use phone if email not available
      subject: "Booking Confirmation - Cab Rental Service",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: white; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333;">🚗 Your Booking is Confirmed!</h2>
              <p style="color: #666;">Dear ${booking.name},</p>
              <p style="color: #666;">Thank you for booking with us. Your cab booking has been successfully confirmed.</p>
              
              <h3 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Booking Details</h3>
              <table style="width: 100%; color: #666; line-height: 1.8;">
                <tr>
                  <td style="font-weight: bold; width: 40%;">Name:</td>
                  <td>${booking.name}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Phone:</td>
                  <td>${booking.phone}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Route:</td>
                  <td>${booking.fromCity} → ${booking.toCity}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Date:</td>
                  <td>${booking.date}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Time:</td>
                  <td>${booking.time}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Car:</td>
                  <td>${booking.car}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Fare:</td>
                  <td style="color: #28a745; font-weight: bold;">₹${booking.fare}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Order ID:</td>
                  <td>${booking.orderId}</td>
                </tr>
              </table>

              <p style="color: #666; margin-top: 20px;">If you have any questions or need to modify your booking, please contact us.</p>
              <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                This is an automated email. Please do not reply to this email.
              </p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Customer email sent to:", mailOptions.to);
    return true;
  } catch (error) {
    console.error("❌ Error sending customer email:", error.message);
    return false;
  }
};

// Send email to owner/admin
export const sendOwnerEmail = async (booking) => {
  try {
    const ownerEmail = process.env.OWNER_EMAIL || process.env.EMAIL_USER;
    if (!ownerEmail) {
      console.error("❌ OWNER_EMAIL not configured");
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: `New Booking Confirmed - ${booking.fromCity} to ${booking.toCity}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: white; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333;">📋 New Booking Received</h2>
              <p style="color: #666;">A new cab booking has been confirmed in your system.</p>
              
              <h3 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">Customer Information</h3>
              <table style="width: 100%; color: #666; line-height: 1.8;">
                <tr>
                  <td style="font-weight: bold; width: 40%;">Customer Name:</td>
                  <td>${booking.name}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Phone:</td>
                  <td>${booking.phone}</td>
                </tr>
              </table>

              <h3 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px; margin-top: 20px;">Trip Details</h3>
              <table style="width: 100%; color: #666; line-height: 1.8;">
                <tr>
                  <td style="font-weight: bold; width: 40%;">Route:</td>
                  <td>${booking.fromCity} → ${booking.toCity}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Date:</td>
                  <td>${booking.date}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Time:</td>
                  <td>${booking.time}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Car Type:</td>
                  <td>${booking.car}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Fare:</td>
                  <td style="color: #28a745; font-weight: bold;">₹${booking.fare}</td>
                </tr>
              </table>

              <h3 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px; margin-top: 20px;">Payment Information</h3>
              <table style="width: 100%; color: #666; line-height: 1.8;">
                <tr>
                  <td style="font-weight: bold; width: 40%;">Order ID:</td>
                  <td>${booking.orderId}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Payment ID:</td>
                  <td>${booking.paymentId}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Status:</td>
                  <td style="color: #28a745; font-weight: bold;">${booking.status.toUpperCase()}</td>
                </tr>
              </table>

              <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                This is an automated email. Please do not reply to this email.
              </p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Owner email sent to:", ownerEmail);
    return true;
  } catch (error) {
    console.error("❌ Error sending owner email:", error.message);
    return false;
  }
};

export default { sendCustomerEmail, sendOwnerEmail };
