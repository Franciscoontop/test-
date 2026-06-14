import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Menu, 
  X, 
  ChevronRight,
  Zap,
  Star,
  CheckCircle2,
  Plug,
  Cpu
} from 'lucide-react';
import ChatWidget from "./components/ChatWidget.jsx";
// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md py-3 shadow-xl' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400 p-2 rounded-lg">
            <Zap className="text-slate-950 w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">VOLT<span className="text-yellow-400">PRO</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Services', 'About', 'Work', 'Reviews'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors">
              {item}
            </a>
          ))}
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20">
            Emergency Call
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-t border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {['Services', 'About', 'Work', 'Reviews'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-lg text-slate-300" onClick={() => setMobileMenuOpen(false)}>
                  {item}
                </a>
              ))}
              <button className="bg-blue-600 text-white py-3 rounded-xl font-bold">
                Emergency Call
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950 pt-20">
      {/* Background Decorative Elements */}
      <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-20 opacity-20 blur-2xl">
        <div className="w-96 h-96 bg-blue-600 rounded-full" />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute bottom-1/4 -right-20 opacity-10 blur-3xl">
        <div className="w-[500px] h-[500px] bg-cyan-400 rounded-full" />
      </motion.div>

      {/* Floating Electric Elements (Inspired by coffee beans) */}
      <motion.img 
        src="/electric-abstract.png" 
        alt="Decorative" 
        className="absolute top-20 right-[10%] w-32 h-32 object-contain hidden lg:block opacity-40"
        animate={{ y: [0, 20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img 
        src="/electric-abstract.png" 
        alt="Decorative" 
        className="absolute bottom-40 left-[5%] w-48 h-48 object-contain hidden lg:block opacity-30 blur-sm"
        animate={{ y: [0, -30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">24/7 Emergency Service</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Powering Your Home, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">Safely</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
              Premium electrical solutions for modern homes. From EV chargers to smart wiring, we deliver elite craftsmanship that keeps your home safe and fully energized.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:translate-y-[-2px] shadow-xl shadow-blue-600/20">
                Book a Service <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-slate-800/50 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold border border-slate-700 transition-all">
                View Pricing
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-yellow-500 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-slate-400"><span className="text-white font-bold">4.9/5</span> from 500+ Happy Clients</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-800">
              <img 
                src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=1200" 
                alt="Elite Electrical Work" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
            </div>
            
            {/* Floating Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-2xl z-20 max-w-[200px]"
            >
              <div className="bg-green-500/20 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-500 w-6 h-6" />
              </div>
              <h4 className="text-white font-bold mb-1">Fast Response</h4>
              <p className="text-xs text-slate-400">Arriving in under 45 minutes for emergencies.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Panel Upgrades",
      desc: "200-amp modern panel replacements with surge protection and safety inspections.",
      icon: <Zap className="w-8 h-8" />,
      color: "yellow"
    },
    {
      title: "Smart Home Wiring",
      desc: "Full-house CAT6, smart switches, and integrated automation from trusted partners.",
      icon: <Cpu className="w-8 h-8" />,
      color: "cyan"
    },
    {
      title: "EV Charger Installs",
      desc: "Level 2 home charging stations — Tesla, ChargePoint, and universal standards.",
      icon: <Plug className="w-8 h-8" />,
      color: "amber"
    },
    {
      title: "24/7 Emergency",
      desc: "Storm damage? Tripped breaker at midnight? We're already on the way.",
      icon: <Clock className="w-8 h-8" />,
      color: "indigo"
    }
  ];

  return (
    <section id="services" className="py-24 bg-slate-950 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Elite Services
          </motion.h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From emergency outages to smart home integrations, we handle your electrical needs with white-glove care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((svc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] hover:bg-slate-800/80 transition-all group"
            >
              <div className="mb-6 text-blue-400 group-hover:scale-110 transition-transform origin-left">
                {svc.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{svc.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {svc.desc}
              </p>
              <button className="flex items-center gap-2 text-blue-400 font-semibold text-sm hover:gap-3 transition-all">
                Learn More <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Stats = () => {
  const stats = [
    { label: "Years Experience", value: "15+" },
    { label: "Projects Completed", value: "2.5k" },
    { label: "Expert Electricians", value: "24" },
    { label: "Customer Rating", value: "4.9" }
  ];

  return (
    <section className="py-20 bg-blue-600 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl lg:text-6xl font-black text-white mb-2 italic tracking-tighter">
                {stat.value}
              </div>
              <div className="text-blue-100 font-medium uppercase tracking-widest text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Projects = () => {
  const projects = [
    { title: "Penthouse Panel Overhaul", category: "Residential", img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800" },
    { title: "Smart Home Automation", category: "Technology", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800" },
    { title: "Dual EV Charger Install", category: "Charging", img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800" },
    { title: "Custom Copper Wiring", category: "Craftsmanship", img: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <section id="work" className="py-24 bg-slate-950 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Masterpiece Projects</h2>
            <p className="text-slate-400 max-w-xl">Precision and safety combined. View our recent high-end electrical installations.</p>
          </div>
          <button className="text-blue-400 font-bold flex items-center gap-2 hover:gap-4 transition-all pb-2 border-b-2 border-blue-500/20">
            View All Work <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer"
            >
              <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 block">{p.category}</span>
                <h3 className="text-white text-xl font-bold">{p.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyUs = () => {
  return (
    <section id="about" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800">
               <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay" />
               <div className="p-12 flex flex-col justify-center h-full">
                  <div className="space-y-8">
                    {[
                      { title: "Licensed & Insured", desc: "Full peace of mind with comprehensive coverage.", icon: <ShieldCheck /> },
                      { title: "Precision Guarantee", desc: "We don't leave until it's perfect.", icon: <CheckCircle2 /> },
                      { title: "No Hidden Costs", desc: "Upfront pricing before we start any work.", icon: <Star /> }
                    ].map((item, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        key={i} 
                        className="flex gap-4"
                      >
                        <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-400 h-fit">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{item.title}</h4>
                          <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
               </div>
            </div>
            
            {/* Number Background Decoration */}
            <div className="absolute -top-10 -right-10 text-[12rem] font-black text-white/5 leading-none pointer-events-none select-none">
              01
            </div>
          </div>

          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
              Why Homeowners <br />
              <span className="text-yellow-400 italic">Choose VoltPro</span>
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We've spent over a decade refining our craft. In an industry often plagued by no-shows and hidden fees, we stand apart by delivering a premium service experience from the first call to the final inspection.
            </p>
            <div className="space-y-4">
               <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                 <p className="text-slate-300 italic mb-4">"VoltPro rewired our 1960s home in three days and installed our Tesla charger the same week. Other electricians quoted double and dragged their feet."</p>
                 <div className="flex items-center gap-3">
                   <img src="https://i.pravatar.cc/100?u=sarah" alt="" className="w-10 h-10 rounded-full" />
                   <div>
                     <p className="text-white font-bold text-sm">Sarah Jenkins</p>
                     <p className="text-slate-500 text-xs">Homeowner in Beverly Hills</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-8 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Let's Fix It Together</h2>
              <p className="text-slate-400 mb-8">Ready to experience elite electrical service? Send us a message or call our 24/7 hotline.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Emergency Hotline</p>
                    <p className="text-xl font-bold">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Service Area</p>
                    <p className="text-xl font-bold">Greater Metro Region</p>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Name" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors w-full" />
                <input type="email" placeholder="Email" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors w-full" />
              </div>
              <input type="text" placeholder="Service Needed (e.g., Water Heater)" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors w-full" />
              <textarea placeholder="Tell us about your project" rows={4} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors w-full resize-none"></textarea>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-yellow-400 p-2 rounded-lg">
                <Zap className="text-slate-950 w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white">VOLT<span className="text-yellow-400">PRO</span></span>
            </div>
            <p className="text-slate-500 max-w-sm mb-6">
              Setting the standard for electrical excellence. Premium service for those who value quality and reliability.
            </p>
            <div className="flex gap-4">
              {['FB', 'IG', 'TW', 'LI'].map(social => (
                <div key={social} className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-blue-500 transition-all cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#services" className="hover:text-blue-400">Services</a></li>
              <li><a href="#about" className="hover:text-blue-400">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400">Pricing</a></li>
              <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} VoltPro Electrical Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <div className="bg-slate-950 min-h-screen font-sans selection:bg-blue-500 selection:text-white bg-mesh">
      <Navbar />
      <Hero />
      <Services />
      <Stats />
      <Projects />
      <WhyUs />
      <Contact />
      <Footer />
      <ChatWidget />
    </div>
  );
}
