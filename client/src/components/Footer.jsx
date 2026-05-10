import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-amber-200 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="font-playfair font-bold text-3xl text-amber-600 tracking-wider mb-4">Melcho</h2>
          <p className="text-gray-600 mb-6">Handcrafted premium desserts delivered fresh to your door. Experience the true taste of luxury.</p>
        </div>
        
        <div className="flex flex-col space-y-3 md:items-center">
          <h3 className="font-playfair font-bold text-xl text-gray-900 mb-2">Quick Links</h3>
          <Link to="/menu" className="text-gray-600 hover:text-amber-600 transition-colors">Our Menu</Link>
          <Link to="/login" className="text-gray-600 hover:text-amber-600 transition-colors">Login</Link>
          <Link to="/register" className="text-gray-600 hover:text-amber-600 transition-colors">Register</Link>
        </div>

        <div className="flex flex-col space-y-3 md:items-end">
          <h3 className="font-playfair font-bold text-xl text-gray-900 mb-2">Contact Us</h3>
          <p className="text-gray-600">Email: hello@melcho.com</p>
          <p className="text-gray-600">Phone: +91 98765 43210</p>
          <p className="text-gray-600 mt-4">123 Baker Street, Dessert City</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-100 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Melcho. All rights reserved.</p>
      </div>
    </footer>
  );
}
