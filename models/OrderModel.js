const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Event",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "attended", "cancelled"],
      default: "pending",
    },
    tickets: [
      {
        ticketId: {
          type: String,
          required: true,
        },
        isValid: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  if (
    !this.isNew &&
    !this.isModified("quantity") &&
    !this.isModified("event")
  ) {
    return next();
  }

  await this.populate("event", "price");

  if (!this.event || !this.event.price) {
    return next(new Error("Event pricing details are unavailable."));
  }

  const calculatedTotal = this.event.price * this.quantity;

  this.totalAmount = calculatedTotal;

  this.event = this.event._id;

  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
