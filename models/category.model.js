const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category Required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Category must be at least 3 characters'],
      maxlength: [32, 'Category must be at most 32 characters'],
    },
    // slug is used for url like => a and b => a-b
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// for updateOne, getOne, getAll
categorySchema.post("init", (doc) => {
  // return image base url + image name
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
  }
})

// for create
categorySchema.post("save", (doc) => {
  // return image base url + image name
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
  }
})

const CategoryModel = mongoose.model("CategoryModel", categorySchema);

module.exports = CategoryModel;