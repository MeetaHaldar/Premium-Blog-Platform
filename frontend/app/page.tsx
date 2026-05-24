import Link from 'next/link';
import { ArrowRight, Sparkles, Lock, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-gray-950 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Premium Blog Platform</h1>
          <p className="text-xl mb-8 text-blue-100">Discover, read, and share premium content from expert writers</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/blogs" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2">
              Explore Blogs <ArrowRight size={20} />
            </Link>
            <Link href="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 dark:text-white">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Sparkles className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2 dark:text-white">Quality Content</h3>
              <p className="text-gray-600 dark:text-gray-400">Access premium blogs from expert writers across various topics</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Lock className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2 dark:text-white">Secure & Safe</h3>
              <p className="text-gray-600 dark:text-gray-400">Your data is encrypted and protected with industry-standard security</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Heart className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2 dark:text-white">Community Driven</h3>
              <p className="text-gray-600 dark:text-gray-400">Like, share, and engage with a community of avid readers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 dark:bg-blue-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Reading?</h2>
          <p className="text-lg mb-8 text-blue-100">Join thousands of readers enjoying premium content</p>
          <Link href="/register" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
