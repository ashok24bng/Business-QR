/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const corsMiddleware = cors({
  origin: ["https://business-qr-51b78.web.app", "http://localhost:5000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
const Joi = require("joi");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

// Input validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    city: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    fullName: Joi.string(),
    phone: Joi.string(),
    city: Joi.string(),
  }),
  withdraw: Joi.object({
    amount: Joi.number().positive().required(),
    bankDetails: Joi.object().required(),
  }),
  addMoney: Joi.object({
    amount: Joi.number().positive().required(),
    paymentDetails: Joi.object().required(),
  }),
};

// Middleware to validate Firebase ID token
const validateFirebaseIdToken = async (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const idToken = req.headers.authorization.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Login user
exports.loginUser = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const { email } = req.body;
      const userRecord = await admin.auth().getUserByEmail(email);
      res.status(200).json({ success: true, userId: userRecord.uid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Register user
exports.registerUser = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const { email, password, fullName, phone, city, referralCode } = req.body;
      const userRecord = await admin.auth().createUser({ email, password });
      await db.collection("users").doc(userRecord.uid).set({ email, fullName, phone, city, referralCode, balance: 0 });
      res.status(201).json({ success: true, userId: userRecord.uid });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Get user profile
exports.getUserProfile = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    validateFirebaseIdToken(req, res, async () => {
      try {
        const userId = req.query.userId;
        if (userId !== req.user.uid) {
          res.status(403).json({ success: false, message: "Unauthorized access" });
          return;
        }
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          res.status(404).json({ success: false, message: "User not found" });
          return;
        }
        res.status(200).json({ success: true, data: userDoc.data() });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });
});

// Update user profile
exports.updateUserProfile = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    validateFirebaseIdToken(req, res, async () => {
      try {
        const userId = req.query.userId;
        if (userId !== req.user.uid) {
          res.status(403).json({ success: false, message: "Unauthorized access" });
          return;
        }
        const { fullName, phone, city } = req.body;
        await db.collection("users").doc(userId).update({ fullName, phone, city });
        res.status(200).json({ success: true, message: "Profile updated successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });
});

// Get user balance
exports.getUserBalance = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    validateFirebaseIdToken(req, res, async () => {
      try {
        const userId = req.query.userId;
        if (userId !== req.user.uid) {
          res.status(403).json({ success: false, message: "Unauthorized access" });
          return;
        }
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          res.status(404).json({ success: false, message: "User not found" });
          return;
        }
        res.status(200).json({ success: true, balance: userDoc.data().balance });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });
});

// Get transactions
exports.getTransactions = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    validateFirebaseIdToken(req, res, async () => {
      try {
        const userId = req.query.userId;
        if (userId !== req.user.uid) {
          res.status(403).json({ success: false, message: "Unauthorized access" });
          return;
        }
        const transactions = await db.collection("transactions").where("userId", "==", userId).get();
        const transactionData = transactions.docs.map(doc => doc.data());
        res.status(200).json({ success: true, transactions: transactionData });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });
});

// Withdraw money
exports.withdrawMoney = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    validateFirebaseIdToken(req, res, async () => {
      try {
        const { error } = schemas.withdraw.validate(req.body);
        if (error) {
          res.status(400).json({ 
            success: false, 
            message: error.details[0].message,
          });
          return;
        }
        const userId = req.query.userId;
        if (userId !== req.user.uid) {
          res.status(403).json({ 
            success: false, 
            message: "Unauthorized access",
          });
          return;
        }
        const { amount, bankDetails } = req.body;
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists || userDoc.data().balance < amount) {
          res.status(400).json({ 
            success: false, 
            message: "Insufficient balance",
          });
          return;
        }
        await db.collection("transactions").add({
          userId,
          type: "withdrawal",
          amount,
          bankDetails,
          status: "pending",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ 
          success: true, 
          message: "Withdrawal request submitted",
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });
});

// Add money
exports.addMoney = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    validateFirebaseIdToken(req, res, async () => {
      try {
        const { error } = schemas.addMoney.validate(req.body);
        if (error) {
          res.status(400).json({ 
            success: false, 
            message: error.details[0].message,
          });
          return;
        }
        const userId = req.query.userId;
        if (userId !== req.user.uid) {
          res.status(403).json({ 
            success: false, 
            message: "Unauthorized access",
          });
          return;
        }
        const { amount, paymentDetails } = req.body;
        await db.collection("transactions").add({
          userId,
          type: "deposit",
          amount,
          paymentDetails,
          status: "pending",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(200).json({ 
          success: true, 
          message: "Deposit initiated",
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });
});
