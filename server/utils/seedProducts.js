require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  // BUBBLE WAFFLE
  { title: "Bubble Waffle With Triple Chocolate", price: 199, category: "BUBBLE WAFFLE", description: "Icecream with three types of chocolate", availability: true, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format" },
  { title: "Bubble Waffle With Ice Cream", price: 199, category: "BUBBLE WAFFLE", description: "Icecream with chocolate", availability: true, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format" },
  { title: "Bubble Waffle With Fruit (Must Try)", price: 199, category: "BUBBLE WAFFLE", description: "Fruit & waffle pops with chocolate", availability: true, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format" },
  { title: "Oreo Bubble Waffle", price: 199, category: "BUBBLE WAFFLE", description: "Icecream and oreo with chocolate", availability: true, image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=500&auto=format" },
  { title: "Kitkat Bubble Waffle", price: 199, category: "BUBBLE WAFFLE", description: "Icecream and kitkat with chocolate", availability: true, image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500&auto=format" },
  { title: "Biscoff Bubble Waffle", price: 229, category: "BUBBLE WAFFLE", description: "Icecream & biscoff spread", availability: true, image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format" },

  // ADD-ON
  { title: "Cadbury Gems", price: 10, category: "ADD-ON", description: "Colorful chocolate gems", availability: true, image: "" },
  { title: "Marshmallows", price: 15, category: "ADD-ON", description: "Fluffy marshmallows", availability: true, image: "" },
  { title: "Brownie", price: 25, category: "ADD-ON", description: "Extra brownie chunk", availability: true, image: "" },
  { title: "Ice Cream Scoop", price: 30, category: "ADD-ON", description: "Additional scoop of vanilla", availability: true, image: "" },

  // THE BIG HERO BREAD
  { title: "Big Hero Bread With Oreo", price: 169, category: "THE BIG HERO BREAD", description: "Hero bread topped with Oreo crumbs", availability: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format" },
  { title: "Big Hero Bread With Kitkat", price: 169, category: "THE BIG HERO BREAD", description: "Hero bread topped with Kitkat pieces", availability: true, image: "" },
  { title: "Big Hero Bread With Banana", price: 169, category: "THE BIG HERO BREAD", description: "Hero bread with fresh banana slices", availability: true, image: "" },
  { title: "Big Hero Bread With Lotus Biscoff", price: 199, category: "THE BIG HERO BREAD", description: "Hero bread with Lotus Biscoff spread", availability: true, image: "" },
  { title: "Big Hero Bread With Strawberry", price: 249, category: "THE BIG HERO BREAD", description: "Hero bread with fresh strawberries", availability: true, image: "" },
  { title: "Big Hero Bread Magnum Truffle", price: 249, category: "THE BIG HERO BREAD", description: "Hero bread with Magnum truffle chocolate", availability: true, image: "" },
  { title: "Big Hero Bread Magnum Brownie", price: 249, category: "THE BIG HERO BREAD", description: "Hero bread with Magnum brownie chunks", availability: true, image: "" },
  { title: "Big Hero Bread Magnum Pistachio", price: 259, category: "THE BIG HERO BREAD", description: "Hero bread with Magnum pistachio flavor", availability: true, image: "" },
  { title: "Big Hero Bread Magnum Almond", price: 279, category: "THE BIG HERO BREAD", description: "Hero bread with Magnum almond crunch", availability: true, image: "" },
  { title: "Big Hero Bread With Ferrero Rocher", price: 299, category: "THE BIG HERO BREAD", description: "Premium Hero bread with Ferrero Rocher", availability: true, image: "" },

  // FRUITELLA
  { title: "Fruitella Banana", price: 149, category: "FRUITELLA", description: "Banana fruit mix", availability: true, image: "" },
  { title: "Fruitella Pineapple", price: 169, category: "FRUITELLA", description: "Pineapple fruit mix", availability: true, image: "" },
  { title: "Fruitella Mixed Fruits", price: 199, category: "FRUITELLA", description: "Assorted fresh fruits", availability: true, image: "" },
  { title: "Fruitella Strawberry", price: 249, category: "FRUITELLA", description: "Fresh strawberry mix", availability: true, image: "" },
  { title: "Fruitella Blueberry", price: 249, category: "FRUITELLA", description: "Wild blueberry mix", availability: true, image: "" },

  // CROISSANTS
  { title: "Croissant With Oreo", price: 169, category: "CROISSANTS", description: "Buttery croissant with Oreo", availability: true, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format" },
  { title: "Croissant With Kitkat", price: 169, category: "CROISSANTS", description: "Buttery croissant with Kitkat", availability: true, image: "" },
  { title: "Croissant With Banana", price: 169, category: "CROISSANTS", description: "Buttery croissant with Banana", availability: true, image: "" },
  { title: "Mini Croissant", price: 179, category: "CROISSANTS", description: "Set of mini croissants", availability: true, image: "" },
  { title: "Croissant With Lotus Biscoff", price: 199, category: "CROISSANTS", description: "Buttery croissant with Biscoff", availability: true, image: "" },
  { title: "Croissant With Strawberry", price: 249, category: "CROISSANTS", description: "Buttery croissant with Strawberry", availability: true, image: "" },
  { title: "Croissant Magnum Truffle", price: 249, category: "CROISSANTS", description: "Buttery croissant with Magnum Truffle", availability: true, image: "" },
  { title: "Croissant Magnum Brownie", price: 249, category: "CROISSANTS", description: "Buttery croissant with Magnum Brownie", availability: true, image: "" },
  { title: "Croissant Magnum Pistachio", price: 259, category: "CROISSANTS", description: "Buttery croissant with Magnum Pistachio", availability: true, image: "" },
  { title: "Croissant Magnum Almond", price: 279, category: "CROISSANTS", description: "Buttery croissant with Magnum Almond", availability: true, image: "" },
  { title: "Croissant With Ferrero Rocher", price: 299, category: "CROISSANTS", description: "Premium croissant with Ferrero Rocher", availability: true, image: "" },

  // BUN & CHOCO
  { title: "Bun & Choco With Oreo", price: 169, category: "BUN & CHOCO", description: "Bun with chocolate and Oreo", availability: true, image: "" },
  { title: "Bun & Choco With Kitkat", price: 169, category: "BUN & CHOCO", description: "Bun with chocolate and Kitkat", availability: true, image: "" },
  { title: "Bun & Choco With Banana", price: 169, category: "BUN & CHOCO", description: "Bun with chocolate and Banana", availability: true, image: "" },
  { title: "Bun & Choco With Lotus Biscoff", price: 199, category: "BUN & CHOCO", description: "Bun with chocolate and Biscoff", availability: true, image: "" },
  { title: "Bun & Choco With Strawberry", price: 249, category: "BUN & CHOCO", description: "Bun with chocolate and Strawberry", availability: true, image: "" },
  { title: "Bun & Choco Magnum Truffle", price: 249, category: "BUN & CHOCO", description: "Bun with chocolate and Magnum Truffle", availability: true, image: "" },
  { title: "Bun & Choco Magnum Brownie", price: 249, category: "BUN & CHOCO", description: "Bun with chocolate and Magnum Brownie", availability: true, image: "" },
  { title: "Bun & Choco Magnum Pistachio", price: 259, category: "BUN & CHOCO", description: "Bun with chocolate and Magnum Pistachio", availability: true, image: "" },
  { title: "Bun & Choco Magnum Almond", price: 279, category: "BUN & CHOCO", description: "Bun with chocolate and Magnum Almond", availability: true, image: "" },
  { title: "Bun & Choco With Ferrero Rocher", price: 299, category: "BUN & CHOCO", description: "Bun with chocolate and Ferrero Rocher", availability: true, image: "" },

  // MELT-IN MOMENTS
  { title: "Hot Chocolate", price: 99, category: "MELT-IN MOMENTS", description: "Rich creamy hot chocolate", availability: true, image: "https://images.unsplash.com/photo-1544787210-2211d44b565a?w=500&auto=format" },
  { title: "Mini Pancake", price: 99, category: "MELT-IN MOMENTS", description: "With chocolate spread", availability: true, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=500&auto=format" },
  { title: "Classic Brownie", price: 99, category: "MELT-IN MOMENTS", description: "Ice cream with chocolate spread", availability: true, image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500&auto=format" },
  { title: "Apricot Delight", price: 99, category: "MELT-IN MOMENTS", description: "Sweet apricot dessert", availability: true, image: "" },
  { title: "Tres Leches", price: 159, category: "MELT-IN MOMENTS", description: "Milk soaked cake", availability: true, image: "https://images.unsplash.com/photo-1543508282-5c1f427f023f?w=500&auto=format" },
  { title: "Tiramisu", price: 169, category: "MELT-IN MOMENTS", description: "Classic Italian coffee dessert", availability: true, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format" },
  { title: "Biscoff Cheesecake", price: 189, category: "MELT-IN MOMENTS", description: "Creamy cheesecake with Biscoff", availability: true, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format" },
  { title: "Fruit Mini Pancake", price: 199, category: "MELT-IN MOMENTS", description: "Loaded fruits & chocolate spread with sprinkles", availability: true, image: "" },
  { title: "Magnum Cake", price: 299, category: "MELT-IN MOMENTS", description: "Must try chocolate cake", availability: true, image: "" }
];

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} products. Skipping seeding to prevent duplicates.`);
      process.exit(0);
    }

    const inserted = await Product.insertMany(products);
    console.log(`Successfully seeded ${inserted.length} products!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
