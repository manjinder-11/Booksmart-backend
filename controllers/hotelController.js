const mongoose = require("mongoose");
const multer = require("multer");
const Hotel = require("../models/hotel");
const Image = require("../models/Image");

const conn = mongoose.connection;

conn.once("open", () => {
  console.log("MongoDB connection open");
});

// Set up multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.upload = upload.array("images", 10);

function transformHotel(hotel) {
  const images = hotel.images.map((image) => ({
    ...image._doc,
    imageBase64: `data:${image.contentType};base64,${image.imageBase64}`,
  }));
  return {
    ...hotel._doc,
    images,
  };
}

// Fetch all hotels
exports.fetchHotels = async (req, res) => {
  try {
    const { location } = req.query;
    let query = {};
    if (location) {
      const regex = new RegExp(location, "i");
      query.$or = [
        { "location.city": regex },
        { "location.state": regex },
        { "location.country": regex },
      ];
    }
    const hotels = await Hotel.find(query).populate("images");
    const hotelsWithImages = hotels.map(transformHotel);

    res.status(200).json(hotelsWithImages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Fetch single hotel
exports.fetchHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id).populate("images");
    const singleHotelWithImages = transformHotel(hotel);
    res.status(200).json(singleHotelWithImages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add hotel
exports.addHotel = async (req, res) => {
  console.log("Files:", req.files);
  console.log("Body:", req.body);

  try {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      zipCode,
      phoneNumber,
      emailAddress,
      minPricePerNight,
      maxPricePerNight,
      roomTypes,
      amenities,
      numberOfRoomsAvailable,
      bookingCalendar,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    const imagePromises = req.files.map((file) => {
      return new Promise(async (resolve, reject) => {
        try {
          const image = new Image({
            filename: file.originalname,
            contentType: file.mimetype,
            imageBase64: file.buffer.toString("base64"),
          });

          const savedImage = await image.save();
          resolve(savedImage._id);
        } catch (error) {
          reject(error);
        }
      });
    });

    const images = await Promise.all(imagePromises);
    console.log("Images:", images);

    const hotel = new Hotel({
      name,
      description,
      location: { address, city, state, country, zipCode },
      contactInfo: { phoneNumber, emailAddress },
      pricing: { minPricePerNight, maxPricePerNight },
      roomTypes,
      amenities,
      availability: { numberOfRoomsAvailable, bookingCalendar },
      images,
    });

    await hotel.save();
    res.status(201).json({ message: "Hotel added successfully", hotel });
  } catch (error) {
    console.error("Error adding hotel:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update hotel
exports.updateHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      zipCode,
      phoneNumber,
      emailAddress,
      minPricePerNight,
      maxPricePerNight,
      roomTypes,
      amenities,
      numberOfRoomsAvailable,
      bookingCalendar,
    } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map((file) => {
        return new Promise(async (resolve, reject) => {
          try {
            const image = new Image({
              filename: file.originalname,
              contentType: file.mimetype,
              imageBase64: file.buffer.toString("base64"),
            });

            const savedImage = await image.save();
            resolve(savedImage._id);
          } catch (error) {
            reject(error);
          }
        });
      });

      images = await Promise.all(imagePromises);
    }

    const updates = {
      name,
      description,
      location: { address, city, state, country, zipCode },
      contactInfo: { phoneNumber, emailAddress },
      pricing: { minPricePerNight, maxPricePerNight },
      roomTypes,
      amenities,
      availability: { numberOfRoomsAvailable, bookingCalendar },
    };

    if (images.length > 0) {
      updates.images = images;
    }

    const hotel = await Hotel.findByIdAndUpdate(hotelId, updates, {
      new: true,
    }).populate("images");
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ message: "Hotel updated successfully", hotel });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete hotel
exports.deleteHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findByIdAndDelete(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    const buffer = Buffer.from(req.body.data, "base64");
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const uploadStream = gridfsBucket.openUploadStream(filename, {
      contentType,
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("finish", (file) => {
      res.status(201).json({ message: "Image uploaded successfully", file });
    });

    uploadStream.on("error", (error) => {
      res.status(500).json({ message: "Error uploading image", error });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
