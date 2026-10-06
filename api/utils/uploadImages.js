const Product = require("../models/productModel");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3, upload } = require("../config/awsConfig");
const crypto = require("crypto");
const mongoose = require("mongoose");

const uploadImages = async (images) => {
  const uploadedFiles = [];
  for (const base64Image of images) {
    const ramdonText = crypto.randomBytes(20).toString("hex");
    const buffer = Buffer.from(base64Image.split(",")[1], "base64");
    const fileKey = `images/${ramdonText}_${Math.random()
      .toString(36)
      .substring(7)}.jpg`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: "image/jpeg",
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    uploadedFiles.push({
      name: fileKey,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
    });
  }

  return uploadedFiles;
};

module.exports = { uploadImages };
