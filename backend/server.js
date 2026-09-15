const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://king-analytics.vercel.app",
    ],
  })
);

app.use(express.json());

/* =========================
   BASIC API TEST
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "King Analytics API is running.",
  });
});

/* =========================
   PUBLIC SERVICES
========================= */

app.get("/api/services", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("SERVICES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load services.",
    });
  }
});

/* =========================
   PUBLIC BOOKINGS
========================= */

app.post("/api/bookings", async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !service || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    let client = await prisma.client.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
        },
      });
    }

    const selectedService = await prisma.service.findUnique({
      where: {
        name: service,
      },
    });

    if (!selectedService) {
      return res.status(400).json({
        success: false,
        message: "The selected service was not found.",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: selectedService.id,
        description: message,
      },
      include: {
        client: true,
        service: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Your project request has been submitted successfully.",
      booking: {
        id: booking.id,
        client: booking.client.name,
        service: booking.service.name,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while submitting your request.",
    });
  }
});

/* =========================
   ADMIN LOGIN
========================= */

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (
      username !== adminUsername ||
      password !== adminPassword
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      {
        username: adminUsername,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
});

/* =========================
   ADMIN AUTH MIDDLEWARE
========================= */

function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

/* =========================
   PROTECTED BOOKINGS
========================= */

app.get(
  "/api/bookings",
  authenticateAdmin,
  async (req, res) => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          client: true,
          service: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error("GET BOOKINGS ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Unable to load bookings.",
      });
    }
  }
);

/* =========================
   SINGLE BOOKING
========================= */

app.get(
  "/api/bookings/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking ID.",
        });
      }

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          client: true,
          service: true,
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      res.json({
        success: true,
        booking,
      });
    } catch (error) {
      console.error("GET BOOKING ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Unable to load booking.",
      });
    }
  }
);

/* =========================
   UPDATE BOOKING STATUS
========================= */

app.patch(
  "/api/bookings/:id/status",
  authenticateAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      const allowedStatuses = [
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ];

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking ID.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status.",
        });
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          client: true,
          service: true,
        },
      });

      res.json({
        success: true,
        message: "Booking status updated successfully.",
        booking,
      });
    } catch (error) {
      console.error("STATUS UPDATE ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Unable to update booking status.",
      });
    }
  }
);

/* =========================
   DELETE BOOKING
========================= */

app.delete(
  "/api/bookings/:id",
  authenticateAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking ID.",
        });
      }

      await prisma.booking.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "Booking deleted successfully.",
      });
    } catch (error) {
      console.error("DELETE BOOKING ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Unable to delete booking.",
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log("----------------------------------");
  console.log("       KING ANALYTICS API");
  console.log("----------------------------------");
  console.log(`Server: http://localhost:${PORT}`);
  console.log("PostgreSQL: Connected through Prisma");
  console.log("Admin authentication: Enabled");
});