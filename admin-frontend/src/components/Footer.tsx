import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-3xl font-extrabold uppercase tracking-tighter mb-4">OursFit.</h2>
          <p className="text-sm opacity-70 max-w-xs">
            Not for all. Only for us. A premium streetwear brand representing the new generation.
          </p>
        </div>
        
        <div>
          <h3 className="font-bold uppercase tracking-widest mb-4">Shop</h3>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link href="/shop" className="hover:opacity-100 transition-opacity">All Products</Link></li>
            <li><Link href="/shop?category=tees" className="hover:opacity-100 transition-opacity">T-Shirts</Link></li>
            <li><Link href="/shop?category=hoodies" className="hover:opacity-100 transition-opacity">Hoodies</Link></li>
            <li><Link href="/shop?category=bottoms" className="hover:opacity-100 transition-opacity">Bottoms</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold uppercase tracking-widest mb-4">Help</h3>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link href="/faq" className="hover:opacity-100 transition-opacity">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:opacity-100 transition-opacity">Shipping & Returns</Link></li>
            <li><Link href="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold uppercase tracking-widest mb-4">Newsletter</h3>
          <p className="text-sm opacity-70 mb-4">Subscribe to get early access to new drops.</p>
          <form className="flex">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-transparent border-b border-background/50 px-0 py-2 w-full focus:outline-none focus:border-background transition-colors text-background placeholder:text-background/50"
            />
            <button type="submit" className="font-bold uppercase tracking-widest ml-4 hover:opacity-70 transition-opacity">
              Join
            </button>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between text-xs opacity-50 uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} OursFit. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0 flex-wrap justify-center">
          <Link href="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:opacity-100 transition-opacity">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
