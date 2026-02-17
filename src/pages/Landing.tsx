import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  ArrowRight, 
  Zap, 
  Grid3x3, 
  CheckCircle2, 
  Move, 
  Users, 
  Activity,
  Search,
  Shield,
  Database,
  Wifi,
  Lock
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-100 noise-bg relative overflow-hidden">
      {/* Animated Background Squares */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating animated squares with borders */}
        <div className="absolute top-32 left-1/4 w-12 h-12 border-2 border-zinc-400 rotate-45 animate-float opacity-30" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 border-2 border-zinc-300 rotate-45 animate-pulse-subtle opacity-25" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-14 h-14 border-2 border-zinc-400 rotate-45 animate-float opacity-30" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-10 h-10 border-2 border-zinc-300 rotate-45 animate-pulse-subtle opacity-25" style={{ animationDelay: '1.5s' }} />
        
        {/* Accent colored squares */}
        <div className="absolute top-40 right-40 w-6 h-6 bg-emerald-500 rotate-45 animate-glow" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-40 w-8 h-8 bg-blue-500 rotate-45 animate-pulse-subtle opacity-30" style={{ animationDelay: '1.8s' }} />
        
        {/* STRATA-style blinking red data squares */}
        <div className="absolute top-20 left-1/3 w-4 h-4 rotate-45 animate-blink-red" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-32 right-1/3 w-4 h-4 rotate-45 animate-blink-red" style={{ animationDelay: '0.6s' }} />
        <div className="absolute top-2/3 left-1/4 w-3 h-3 rotate-45 animate-blink-red" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-1/3 right-1/2 w-4 h-4 rotate-45 animate-blink-red" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-1/2 left-2/3 w-3 h-3 rotate-45 animate-blink-red" style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="glass flex items-center justify-between p-3">
          <div className="flex items-center pl-4 pr-6 hairline-r">
            <Layers className="h-5 w-5 text-zinc-900 mr-2" strokeWidth={1.5} />
            <span className="font-['Inter_Tight'] font-semibold tracking-tight text-lg">
              TASKFLOW
            </span>
          </div>

          <div className="hidden md:flex items-center gap-0 h-full">
            <a href="#features" className="group relative px-6 py-2 block font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors">
              <span className="absolute inset-0 bg-zinc-200 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 -z-10"></span>
              Features
            </a>
            <div className="w-px h-4 bg-zinc-200"></div>
            <a href="#how-it-works" className="group relative px-6 py-2 block font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors">
              <span className="absolute inset-0 bg-zinc-200 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 -z-10"></span>
              How It Works
            </a>
            <div className="w-px h-4 bg-zinc-200"></div>
            <a href="#use-cases" className="group relative px-6 py-2 block font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors">
              <span className="absolute inset-0 bg-zinc-200 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 -z-10"></span>
              Use Cases
            </a>
          </div>

          <Link to="/auth">
            <Button className="bg-zinc-950 text-white px-5 py-2 text-xs font-mono uppercase tracking-wide hover:bg-red-600 transition-colors duration-200">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="relative z-10 text-center animate-fade-in">
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest flex items-center justify-center gap-2 mb-8">
            <span className="w-2 h-2 bg-red-600"></span>
            // REAL-TIME COLLABORATION V.2.0
          </div>
          
          <h1 className="font-['Inter_Tight'] text-5xl md:text-7xl font-semibold leading-[0.9] tracking-[-0.04em] text-zinc-950 mb-6">
            COLLABORATE ON TASKS<br />
            <span className="text-zinc-400">IN REAL TIME.</span>
          </h1>
          
          <p className="font-body text-lg md:text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed mb-12">
            Create boards, organize tasks, assign members, and track progress together with instant live updates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth">
              <Button className="group flex items-center gap-3 bg-zinc-950 text-white pl-6 pr-4 py-6 hover:bg-red-600 transition-colors duration-300">
                <span className="font-mono text-sm uppercase tracking-wide">Start Collaborating</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#features" className="font-mono text-sm text-zinc-500 border-b border-zinc-300 hover:text-zinc-950 hover:border-zinc-950 transition-all pb-1">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto relative z-10">
        <div className="mb-12 flex items-baseline justify-between border-b border-zinc-200 pb-4">
          <h2 className="font-['Inter_Tight'] text-4xl md:text-5xl font-medium tracking-tight text-zinc-950">
            EVERYTHING YOUR TEAM NEEDS
          </h2>
          <span className="font-mono text-xs text-zinc-400 hidden sm:block">FEATURE_SET_V.01</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200">
          {/* Feature 1 - Large */}
          <div className="md:col-span-2 md:row-span-2 bg-white p-8 md:p-12 group relative overflow-hidden h-full min-h-[400px]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-600 translate-y-[-100%] group-hover:translate-y-[600px] transition-transform duration-[1.5s] ease-in-out z-10"></div>
            <div className="flex flex-col justify-between h-full relative z-0">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <Zap className="w-8 h-8 text-zinc-300 group-hover:text-red-600 transition-colors duration-300" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] text-zinc-400">01</span>
                </div>
                <h3 className="font-mono text-sm uppercase tracking-wider mb-4 group-hover:text-red-600 transition-colors">
                  Real-Time Collaboration
                </h3>
                <p className="font-body text-2xl text-zinc-800 leading-tight">
                  See task updates instantly across all connected users with WebSocket-powered live sync.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-100 flex gap-4 font-mono text-[10px] text-zinc-400">
                <span>PROTOCOL: WEBSOCKET</span>
                <span>LATENCY: &lt;100MS</span>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 group relative overflow-hidden h-64">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-600 translate-y-[-100%] group-hover:translate-y-[400px] transition-transform duration-[1s] ease-in-out delay-100 z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <Grid3x3 className="w-6 h-6 text-zinc-300 group-hover:text-red-600 transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-400">02</span>
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider mb-2 group-hover:text-red-600 transition-colors">
              Boards & Lists
            </h3>
            <p className="font-body text-sm text-zinc-500">
              Create multiple boards and structured task lists for organized workflows.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 group relative overflow-hidden h-64">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-600 translate-y-[-100%] group-hover:translate-y-[400px] transition-transform duration-[1s] ease-in-out delay-200 z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <CheckCircle2 className="w-6 h-6 text-zinc-300 group-hover:text-red-600 transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-400">03</span>
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider mb-2 group-hover:text-red-600 transition-colors">
              Task Management
            </h3>
            <p className="font-body text-sm text-zinc-500">
              Create, edit, delete, and move tasks easily with intuitive controls.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 group relative overflow-hidden h-64">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-600 translate-y-[-100%] group-hover:translate-y-[400px] transition-transform duration-[1s] ease-in-out delay-300 z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <Move className="w-6 h-6 text-zinc-300 group-hover:text-red-600 transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-400">04</span>
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider mb-2 group-hover:text-red-600 transition-colors">
              Drag & Drop Workflow
            </h3>
            <p className="font-body text-sm text-zinc-500">
              Move tasks across lists with simple drag and drop interactions.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 group relative overflow-hidden h-64">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-600 translate-y-[-100%] group-hover:translate-y-[400px] transition-transform duration-[1s] ease-in-out delay-100 z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <Users className="w-6 h-6 text-zinc-300 group-hover:text-red-600 transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-400">05</span>
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider mb-2 group-hover:text-red-600 transition-colors">
              Member Assignment
            </h3>
            <p className="font-body text-sm text-zinc-500">
              Assign tasks to teammates with clarity and track ownership.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 group relative overflow-hidden h-64">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-600 translate-y-[-100%] group-hover:translate-y-[400px] transition-transform duration-[1s] ease-in-out delay-200 z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <Activity className="w-6 h-6 text-zinc-300 group-hover:text-red-600 transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-400">06</span>
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider mb-2 group-hover:text-red-600 transition-colors">
              Activity History
            </h3>
            <p className="font-body text-sm text-zinc-500">
              Track every change with built-in activity logs and audit trails.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-white p-8 group relative overflow-hidden h-64">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-600 translate-y-[-100%] group-hover:translate-y-[400px] transition-transform duration-[1s] ease-in-out delay-300 z-10"></div>
            <div className="flex justify-between items-start mb-4">
              <Search className="w-6 h-6 text-zinc-300 group-hover:text-red-600 transition-colors" strokeWidth={1.5} />
              <span className="font-mono text-[10px] text-zinc-400">07</span>
            </div>
            <h3 className="font-mono text-sm uppercase tracking-wider mb-2 group-hover:text-red-600 transition-colors">
              Search & Pagination
            </h3>
            <p className="font-body text-sm text-zinc-500">
              Quickly find tasks and scale to large boards with efficient pagination.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-white border-y border-zinc-200 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-['Inter_Tight'] text-4xl md:text-5xl font-medium tracking-tight text-zinc-950 mb-4">
              SIMPLE WORKFLOW,<br />POWERFUL RESULTS
            </h2>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">PROCESS_FLOW_V.01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { num: "01", title: "Create a board", desc: "Start with a new board for your project" },
              { num: "02", title: "Add lists for workflow stages", desc: "Organize with custom lists" },
              { num: "03", title: "Create and assign tasks", desc: "Add tasks and assign to team members" },
              { num: "04", title: "Collaborate in real time", desc: "See updates instantly" },
              { num: "05", title: "Track activity and progress", desc: "Monitor all changes" }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="border border-zinc-200 p-6 bg-zinc-50 hover:bg-white transition-colors group">
                  <div className="font-mono text-3xl font-bold text-zinc-200 group-hover:text-red-600 transition-colors mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-mono text-xs uppercase tracking-wider mb-2 text-zinc-900">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-zinc-500">
                    {step.desc}
                  </p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-zinc-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto relative z-10">
        <div className="mb-12 border-b border-zinc-200 pb-4">
          <h2 className="font-['Inter_Tight'] text-4xl md:text-5xl font-medium tracking-tight text-zinc-950">
            BUILT FOR MODERN TEAMS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Project Management", icon: Grid3x3 },
            { title: "Sprint Planning", icon: Zap },
            { title: "Team Task Tracking", icon: Users },
            { title: "Student Group Projects", icon: CheckCircle2 },
            { title: "Startup Collaboration", icon: Activity }
          ].map((useCase, i) => (
            <div key={i} className="border border-zinc-200 bg-white p-8 hover:border-red-600 transition-colors group">
              <useCase.icon className="w-8 h-8 text-zinc-300 group-hover:text-red-600 transition-colors mb-4" strokeWidth={1.5} />
              <h3 className="font-mono text-sm uppercase tracking-wider text-zinc-900">
                {useCase.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-6 md:px-12 bg-zinc-950 text-white relative z-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-['Inter_Tight'] text-4xl md:text-5xl font-medium tracking-tight mb-4">
              SECURE AND SCALABLE<br />BY DESIGN
            </h2>
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">INFRASTRUCTURE_V.01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: "Authenticated Access", desc: "User authentication required" },
              { icon: Wifi, title: "Real-Time Sync", desc: "WebSocket connections" },
              { icon: Database, title: "Optimized Database", desc: "Efficient query design" },
              { icon: Shield, title: "Scalable Architecture", desc: "Built to grow with you" }
            ].map((item, i) => (
              <div key={i} className="border border-zinc-800 p-6 hover:border-red-600 transition-colors group">
                <item.icon className="w-6 h-6 text-zinc-600 group-hover:text-red-600 transition-colors mb-4" strokeWidth={1.5} />
                <h3 className="font-mono text-xs uppercase tracking-wider mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-100 border-t border-zinc-200 pt-20 pb-8 relative z-10">
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs uppercase text-zinc-400 mb-2">[Product]</h4>
            <a href="#features" className="text-sm text-zinc-600 hover:text-zinc-950">Features</a>
            <a href="#how-it-works" className="text-sm text-zinc-600 hover:text-zinc-950">How It Works</a>
            <a href="#use-cases" className="text-sm text-zinc-600 hover:text-zinc-950">Use Cases</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs uppercase text-zinc-400 mb-2">[Resources]</h4>
            <a href="#" className="text-sm text-zinc-600 hover:text-zinc-950">Documentation</a>
            <a href="#" className="text-sm text-zinc-600 hover:text-zinc-950">GitHub Repo</a>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-mono text-xs uppercase text-zinc-400 mb-2">[Company]</h4>
            <a href="#" className="text-sm text-zinc-600 hover:text-zinc-950">About</a>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="font-mono text-xs uppercase text-zinc-400 mb-4">Start collaborating today.</h4>
            <Link to="/auth">
              <Button className="w-full bg-zinc-950 text-white py-3 px-4 text-xs font-mono uppercase hover:bg-red-600 transition-colors">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        <div className="px-6 md:px-12 max-w-[1600px] mx-auto border-t border-zinc-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] text-zinc-400 uppercase">
            © 2025 TaskFlow. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-zinc-400 uppercase">
            Built with real-time collaboration in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}
