require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('../models/Product')

const products = [
  // Bubble Waffle (6)
  { title: "Bubble Waffle With Triple Chocolate", price: 199, category: "Bubble Waffle", description: "Icecream with three types of chocolate", image: "" },
  { title: "Bubble Waffle With Ice Cream", price: 199, category: "Bubble Waffle", description: "Icecream with chocolate", image: "" },
  { title: "Bubble Waffle With Fruit", price: 199, category: "Bubble Waffle", description: "Fruit & waffle pops with chocolate", image: "" },
  { title: "Oreo Bubble Waffle", price: 199, category: "Bubble Waffle", description: "Icecream and oreo with chocolate", image: "" },
  { title: "Kitkat Bubble Waffle", price: 199, category: "Bubble Waffle", description: "Icecream and kitkat with chocolate", image: "" },
  { title: "Biscoff Bubble Waffle", price: 229, category: "Bubble Waffle", description: "Icecream & biscoff spread", image: "" },

  // Add-On (4)
  { title: "Cadbury Gems", price: 10, category: "Add-On", description: "Add-on topping", image: "" },
  { title: "Marshmallows", price: 15, category: "Add-On", description: "Add-on topping", image: "" },
  { title: "Brownie", price: 25, category: "Add-On", description: "Add-on topping", image: "" },
  { title: "Ice Cream Scoop", price: 30, category: "Add-On", description: "Add-on topping", image: "" },

  // The Big Hero Bread (10)
  { title: "Big Hero Bread With Oreo", price: 169, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread With Kitkat", price: 169, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread With Banana", price: 169, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread With Lotus Biscoff", price: 199, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread With Strawberry", price: 249, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread Magnum Truffle", price: 249, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread Magnum Brownie", price: 249, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread Magnum Pistachio", price: 259, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread Magnum Almond", price: 279, category: "The Big Hero Bread", image: "" },
  { title: "Big Hero Bread With Ferrero Rocher", price: 299, category: "The Big Hero Bread", image: "" },

  // Fruitella (5)
  { title: "Fruitella Banana", price: 149, category: "Fruitella", image: "" },
  { title: "Fruitella Pineapple", price: 169, category: "Fruitella", image: "" },
  { title: "Fruitella Mixed Fruits", price: 199, category: "Fruitella", image: "" },
  { title: "Fruitella Strawberry", price: 249, category: "Fruitella", image: "" },
  { title: "Fruitella Blueberry", price: 249, category: "Fruitella", image: "" },

  // Croissants (11)
  { title: "Croissant With Oreo", price: 169, category: "Croissants", image: "" },
  { title: "Croissant With Kitkat", price: 169, category: "Croissants", image: "" },
  { title: "Croissant With Banana", price: 169, category: "Croissants", image: "" },
  { title: "Mini Croissant", price: 179, category: "Croissants", image: "" },
  { title: "Croissant With Lotus Biscoff", price: 199, category: "Croissants", image: "" },
  { title: "Croissant With Strawberry", price: 249, category: "Croissants", image: "" },
  { title: "Croissant Magnum Truffle", price: 249, category: "Croissants", image: "" },
  { title: "Croissant Magnum Brownie", price: 249, category: "Croissants", image: "" },
  { title: "Croissant Magnum Pistachio", price: 259, category: "Croissants", image: "" },
  { title: "Croissant Magnum Almond", price: 279, category: "Croissants", image: "" },
  { title: "Croissant With Ferrero Rocher", price: 299, category: "Croissants", image: "" },

  // Bun & Choco (10)
  { title: "Bun & Choco With Oreo", price: 169, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco With Kitkat", price: 169, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco With Banana", price: 169, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco With Lotus Biscoff", price: 199, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco With Strawberry", price: 249, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco Magnum Truffle", price: 249, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco Magnum Brownie", price: 249, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco Magnum Pistachio", price: 259, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco Magnum Almond", price: 279, category: "Bun & Choco", image: "" },
  { title: "Bun & Choco With Ferrero Rocher", price: 299, category: "Bun & Choco", image: "" },

  // Melt-In Moments (9)
  { title: "Hot Chocolate", price: 99, category: "Melt-In Moments", image: "" },
  { title: "Mini Pancake", price: 99, category: "Melt-In Moments", image: "" },
  { title: "Classic Brownie", price: 99, category: "Melt-In Moments", image: "" },
  { title: "Apricot Delight", price: 99, category: "Melt-In Moments", image: "" },
  { title: "Tres Leches", price: 159, category: "Melt-In Moments", image: "" },
  { title: "Tiramisu", price: 169, category: "Melt-In Moments", image: "" },
  { title: "Biscoff Cheesecake", price: 189, category: "Melt-In Moments", image: "" },
  { title: "Fruit Mini Pancake", price: 199, category: "Melt-In Moments", image: "" },
  { title: "Magnum Cake", price: 299, category: "Melt-In Moments", image: "" }
]

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI missing');
      process.exit(1);
    }

    await mongoose.connect(mongoUri)
    console.log('Connected for seeding...')
    
    await Product.deleteMany({})
    console.log('Old products deleted.')
    
    const result = await Product.insertMany(products)
    console.log(`\u2705 Seeded ${result.length} products successfully`)
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('Seed error:', err.message)
    process.exit(1)
  }
}

seed()
