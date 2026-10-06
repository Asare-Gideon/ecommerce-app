const { DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/awsConfig");
const dotenv = require("dotenv");
dotenv.config();

const deleteMultipleImages = async (imageKeys) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: imageKeys.map((key) => ({ Key: key })),
    },
  };

  try {
    const command = new DeleteObjectsCommand(params);
    await s3.send(command);
    console.log("Images deleted successfully");
  } catch (error) {
    throw new Error(error);
    console.error("Error deleting images:", error);
  }
};

module.exports = { deleteMultipleImages };
