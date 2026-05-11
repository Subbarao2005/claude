require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('../models/Product')

const products = [
  // Bubble Waffle (6)
  { title: "Bubble Waffle With Triple Chocolate", price: 199, category: "Bubble Waffle", description: "Icecream with three types of chocolate", availability: true, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format" },
  { title: "Bubble Waffle With Ice Cream", price: 199, category: "Bubble Waffle", description: "Icecream with chocolate", availability: true, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format" },
  { title: "Bubble Waffle With Fruit", price: 199, category: "Bubble Waffle", description: "Fruit & waffle pops with chocolate. Must Try!", availability: true, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format" },
  { title: "Oreo Bubble Waffle", price: 199, category: "Bubble Waffle", description: "Icecream and oreo with chocolate", availability: true, image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=500&auto=format" },
  { title: "Kitkat Bubble Waffle", price: 199, category: "Bubble Waffle", description: "Icecream and kitkat with chocolate", availability: true, image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=500&auto=format" },
  { title: "Biscoff Bubble Waffle", price: 229, category: "Bubble Waffle", description: "Icecream & biscoff spread", availability: true, image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&auto=format" },

  // Add-On (4)
  { title: "Cadbury Gems", price: 10, category: "Add-On", description: "Add-on topping", availability: true },
  { title: "Marshmallows", price: 15, category: "Add-On", description: "Add-on topping", availability: true },
  { title: "Brownie", price: 25, category: "Add-On", description: "Add-on topping", availability: true },
  { title: "Ice Cream Scoop", price: 30, category: "Add-On", description: "Add-on topping", availability: true },

  // The Big Hero Bread (10)
  { title: "Big Hero Bread With Oreo", price: 169, category: "The Big Hero Bread", description: "Hero bread topped with Oreo crumbs", availability: true },
  { title: "Big Hero Bread With Kitkat", price: 169, category: "The Big Hero Bread", description: "Hero bread topped with Kitkat pieces", availability: true },
  { title: "Big Hero Bread With Banana", price: 169, category: "The Big Hero Bread", description: "Hero bread with fresh banana slices", availability: true },
  { title: "Big Hero Bread With Lotus Biscoff", price: 199, category: "The Big Hero Bread", description: "Hero bread with Lotus Biscoff spread", availability: true },
  { title: "Big Hero Bread With Strawberry", price: 249, category: "The Big Hero Bread", description: "Hero bread with fresh strawberries", availability: true },
  { title: "Big Hero Bread Magnum Truffle", price: 249, category: "The Big Hero Bread", description: "Hero bread with Magnum truffle chocolate", availability: true },
  { title: "Big Hero Bread Magnum Brownie", price: 249, category: "The Big Hero Bread", description: "Hero bread with Magnum brownie chunks", availability: true },
  { title: "Big Hero Bread Magnum Pistachio", price: 259, category: "The Big Hero Bread", description: "Hero bread with Magnum pistachio flavor", availability: true },
  { title: "Big Hero Bread Magnum Almond", price: 279, category: "The Big Hero Bread", description: "Hero bread with Magnum almond crunch", availability: true },
  { title: "Big Hero Bread With Ferrero Rocher", price: 299, category: "The Big Hero Bread", description: "Premium Hero bread with Ferrero Rocher", availability: true },

  // Fruitella (5)
  { title: "Fruitella Banana", price: 149, category: "Fruitella", description: "Banana fruit mix", availability: true },
  { title: "Fruitella Pineapple", price: 169, category: "Fruitella", description: "Pineapple fruit mix", availability: true },
  { title: "Fruitella Mixed Fruits", price: 199, category: "Fruitella", description: "Assorted fresh fruits", availability: true },
  { title: "Fruitella Strawberry", price: 249, category: "Fruitella", description: "Fresh strawberry mix", availability: true },
  { title: "Fruitella Blueberry", price: 249, category: "Fruitella", description: "Wild blueberry mix", availability: true },

  // Croissants (11)
  { title: "Croissant With Oreo", price: 169, category: "Croissants", description: "Buttery croissant with Oreo", availability: true },
  { title: "Croissant With Kitkat", price: 169, category: "Croissants", description: "Buttery croissant with Kitkat", availability: true },
  { title: "Croissant With Banana", price: 169, category: "Croissants", description: "Buttery croissant with Banana", availability: true },
  { title: "Mini Croissant", price: 179, category: "Croissants", description: "Set of mini croissants", availability: true },
  { title: "Croissant With Lotus Biscoff", price: 199, category: "Croissants", description: "Buttery croissant with Biscoff", availability: true },
  { title: "Croissant With Strawberry", price: 249, category: "Croissants", description: "Buttery croissant with Strawberry", availability: true },
  { title: "Croissant Magnum Truffle", price: 249, category: "Croissants", description: "Buttery croissant with Magnum Truffle", availability: true },
  { title: "Croissant Magnum Brownie", price: 249, category: "Croissants", description: "Buttery croissant with Magnum Brownie", availability: true },
  { title: "Croissant Magnum Pistachio", price: 259, category: "Croissants", description: "Buttery croissant with Magnum Pistachio", availability: true },
  { title: "Croissant Magnum Almond", price: 279, category: "Croissants", description: "Buttery croissant with Magnum Almond", availability: true },
  { title: "Croissant With Ferrero Rocher", price: 299, category: "Croissants", description: "Premium croissant with Ferrero Rocher", availability: true },

  // Bun & Choco (10)
  { title: "Bun & Choco With Oreo", price: 169, category: "Bun & Choco", description: "Bun with chocolate and Oreo", availability: true },
  { title: "Bun & Choco With Kitkat", price: 169, category: "Bun & Choco", description: "Bun with chocolate and Kitkat", availability: true },
  { title: "Bun & Choco With Banana", price: 169, category: "Bun & Choco", description: "Bun with chocolate and Banana", availability: true },
  { title: "Bun & Choco With Lotus Biscoff", price: 199, category: "Bun & Choco", description: "Bun with chocolate and Biscoff", availability: true },
  { title: "Bun & Choco With Strawberry", price: 249, category: "Bun & Choco", description: "Bun with chocolate and Strawberry", availability: true },
  { title: "Bun & Choco Magnum Truffle", price: 249, category: "Bun & Choco", description: "Bun with chocolate and Magnum Truffle", availability: true },
  { title: "Bun & Choco Magnum Brownie", price: 249, category: "Bun & Choco", description: "Bun with chocolate and Magnum Brownie", availability: true },
  { title: "Bun & Choco Magnum Pistachio", price: 259, category: "Bun & Choco", description: "Bun with chocolate and Magnum Pistachio", availability: true },
  { title: "Bun & Choco Magnum Almond", price: 279, category: "Bun & Choco", description: "Bun with chocolate and Magnum Almond", availability: true },
  { title: "Bun & Choco With Ferrero Rocher", price: 299, category: "Bun & Choco", description: "Bun with chocolate and Ferrero Rocher", availability: true },

  // Melt-In Moments (9)
  { title: "Hot Chocolate", price: 99, category: "Melt-In Moments", description: "Rich creamy hot chocolate", availability: true },
  { title: "Mini Pancake", price: 99, category: "Melt-In Moments", description: "With chocolate spread", availability: true },
  { title: "Classic Brownie", price: 99, category: "Melt-In Moments", description: "Ice cream with chocolate spread", availability: true },
  { title: "Apricot Delight", price: 99, category: "Melt-In Moments", description: "Sweet apricot dessert", availability: true },
  { title: "Tres Leches", price: 159, category: "Melt-In Moments", description: "Milk soaked cake", availability: true },
  { title: "Tiramisu", price: 169, category: "Melt-In Moments", description: "Classic Italian coffee dessert", availability: true },
  { title: "Biscoff Cheesecake", price: 189, category: "Melt-In Moments", description: "Creamy cheesecake with Biscoff", availability: true },
  { title: "Fruit Mini Pancake", price: 199, category: "Melt-In Moments", description: "Loaded fruits & chocolate spread with sprinkles", availability: true },
  { title: "Magnum Cake", price: 299, category: "Melt-In Moments", description: "Must try chocolate cake!", availability: true }
]

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB for seeding...')
    
    const existing = await Product.countDocuments()
    if (existing > 0) {
      console.log(`${existing} products already exist.`)
      console.log('Deleting existing products...')
      await Product.deleteMany({})
      console.log('Deleted. Reseeding...')
    }
    
    const result = await Product.insertMany(products)
    console.log(`\u2705 Seeded ${result.length} products successfully`)
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Error seeding products:', err.message)
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

seed()
