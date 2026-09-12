import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      default: "farmart_mart",
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    vendorId: {
      type: String,
      default: "default_vendor",
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
    },
    farmer: {
      type: String,
      default: "Local Partner",
    },
    discount: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Transform output to include 'id' instead of '_id' for frontend compatibility
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export default mongoose.model("Product", productSchema);
