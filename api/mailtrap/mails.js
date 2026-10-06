const { sender, mailtrapInstance } = require("./mailtrapConfig");
const {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} = require("./templates");
const asyncHandler = require("express-async-handler");

const sendPasswordResetEmail = asyncHandler(async (email, resetCode) => {
  if (!email) {
    throw new Error("Recipient email is required.");
  }

  const recipient = [{ email }];

  try {
    const response = await mailtrapInstance.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetCode}", resetCode),
      category: "Password Reset",
    });

    return response;
  } catch (error) {
    console.error(
      `Error sending password reset email`,
      error.response?.data || error.message
    );

    throw new Error(
      `Error sending password reset email: ${error.response?.data?.message || error.message
      }`
    );
  }
});

const sendSuccessfullResetEmail = asyncHandler(async (email) => {
  if (!email) {
    throw new Error("Recipient email is required.");
  }

  const recipient = [{ email }];

  try {
    const response = await mailtrapInstance.send({
      from: sender,
      to: recipient,
      subject: "Password reset successfully",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    return response;
  } catch (error) {
    console.error(
      `Error sending password reset email`,
      error.response?.data || error.message
    );

    throw new Error(
      `Error sending password reset email: ${error.response?.data?.message || error.message
      }`
    );
  }
});

module.exports = { sendPasswordResetEmail, sendSuccessfullResetEmail };
