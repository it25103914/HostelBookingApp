const Room = require('../models/Room');

// Create Room
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerMonth, capacity, description } = req.body;
    const image = req.file ? req.file.path : '';

    const newRoom = new Room({
      roomNumber,
      roomType,
      pricePerMonth,
      capacity,
      description,
      image
    });

    await newRoom.save();
    res.status(201).json({ message: 'Room created successfully!', newRoom });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get One Room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    res.status(200).json(room);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Update Room
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerMonth, capacity, description } =
      req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    room.roomNumber = roomNumber ?? room.roomNumber;
    room.roomType = roomType ?? room.roomType;
    room.pricePerMonth = pricePerMonth ?? room.pricePerMonth;
    room.capacity = capacity ?? room.capacity;
    room.description = description ?? room.description;

    if (req.file) {
      room.image = req.file.path;
    }

    if (room.currentOccupancy >= room.capacity) {
      room.availabilityStatus = 'Full';
    } else {
      room.availabilityStatus = 'Available';
    }

    await room.save();

    res.status(200).json({
      message: 'Room updated successfully',
      room
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Delete Room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    await room.deleteOne();

    res.status(200).json({
      message: 'Room deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Get Single Room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    res.status(200).json(room);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


// Update Room
exports.updateRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      pricePerMonth,
      capacity,
      description
    } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    room.roomNumber = roomNumber ?? room.roomNumber;
    room.roomType = roomType ?? room.roomType;
    room.pricePerMonth = pricePerMonth ?? room.pricePerMonth;
    room.capacity = capacity ?? room.capacity;
    room.description = description ?? room.description;

    if (req.file) {
      room.image = req.file.path;
    }

    if (room.currentOccupancy >= room.capacity) {
      room.availabilityStatus = 'Full';
    } else {
      room.availabilityStatus = 'Available';
    }

    await room.save();

    res.status(200).json({
      message: 'Room updated successfully',
      room
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};


// Delete Room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }

    await room.deleteOne();

    res.status(200).json({
      message: 'Room deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};