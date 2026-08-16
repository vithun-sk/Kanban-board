import React from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";

import {
  UsersRound,
  SquareKanban,
  ChartNoAxesCombined,
  MessagesSquare,
  Bell,
  ClipboardCheck,
  History,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-surface)]">

      <nav className="sticky top-0 z-50 flex flex-col gap-5 border-b border-[var(--outline-variant)] bg-[var(--background)]/95 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
        {/* Logo */}

        <div
          onClick={scrollToTop}
          className="cursor-pointer text-3xl text-[var(--on-surface)]"
        >
          Flow<span className="font-black text-[var(--primary)]">Sync</span>
        </div>

        {/* Navigation */}

        <div>
          <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <li>
              <a
                href="#features"
                className="text-sm text-[var(--on-surface-variant)] transition-colors duration-300 hover:text-[var(--on-surface)] md:text-lg"
              >
                Features
              </a>
            </li>

            <li>
              <a
                href="#how-it-works"
                className="text-sm text-[var(--on-surface-variant)] transition-colors duration-300 hover:text-[var(--on-surface)] md:text-lg"
              >
                How It Works
              </a>
            </li>

            <li>
              <a
                href="#pricing"
                className="text-sm text-[var(--on-surface-variant)] transition-colors duration-300 hover:text-[var(--on-surface)] md:text-lg"
              >
                Pricing
              </a>
            </li>
          </ul>
        </div>

        {/* Authentication Buttons */}

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => navigate("/login")}
            className="w-28 cursor-pointer rounded-xl border border-[var(--outline-variant)] bg-transparent px-5 py-3 text-[var(--on-surface)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:text-white"
          >
            Login
          </Button>

          <Button
            onClick={() => navigate("/signup")}
            className="w-32 cursor-pointer rounded-xl bg-[#4F46E5] px-5 py-3 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4338CA] hover:shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-90px)] flex-col items-center justify-center gap-12 px-6 py-20 lg:flex-row lg:px-20">
        {/* Hero Content */}

        <div className="w-full lg:w-1/2">
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
            <Zap size={18} />
            Built for high-velocity teams
          </div>

          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            Collaborate.
            <br />
            Organize.
            <br />
            <span className="text-[var(--primary)]">Build Together.</span>
          </h1>

          <p className="max-w-xl py-6 text-lg leading-8 text-[var(--on-surface-variant)]">
            A modern workspace for teams to manage projects, tasks, and
            workflows in real time. Built for high-velocity teams that move
            fast.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/signup")}
              className="cursor-pointer rounded-xl bg-[#4F46E5] px-7 py-6 text-lg text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#4338CA] hover:shadow-lg"
            >
              Get Started
              <ArrowRight />
            </Button>

            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="cursor-pointer rounded-xl border-[var(--outline-variant)] px-7 py-6 text-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#4338CA] hover:text-white"
            >
              Login
            </Button>
          </div>
        </div>

        {/* Kanban Preview */}

        <div className="w-full lg:w-1/2">
          <div className="rounded-2xl border border-[var(--outline-variant)] bg-[var(--secondary-container)] p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Website Redesign</span>

              <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs text-white">
                Active
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Todo */}

              <div className="rounded-xl bg-[var(--on-primary)] p-4">
                <p className="mb-3 font-semibold">To-Do</p>

                <div className="rounded-xl bg-[var(--secondary-container)] p-4">
                  <p className="font-medium">Design System Setup</p>

                  <p className="pt-2 text-xs text-[var(--on-surface-variant)]">
                    Created by Steve
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-[var(--on-primary)] px-3 py-1 text-xs">
                    UI/UX
                  </span>
                </div>
              </div>

              {/* In Progress */}

              <div className="rounded-xl bg-[var(--on-primary)] p-4">
                <p className="mb-3 font-semibold">In Progress</p>

                <div className="rounded-xl bg-[var(--secondary-container)] p-4">
                  <p className="font-medium">API Integration</p>

                  <p className="pt-2 text-xs text-[var(--on-surface-variant)]">
                    Created by Mathew
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-[var(--on-primary)] px-3 py-1 text-xs">
                    Backend
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section
        id="features"
        className="scroll-mt-24 bg-[var(--secondary-container)] px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              Everything you need to ship faster
            </h2>

            <p className="mt-4 text-lg text-[var(--on-surface-variant)]">
              Powerful features wrapped in a minimalist interface.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Collaboration */}

            <FeatureCard
              span="md:col-span-1"
              icon={<UsersRound />}
              title="Collaboration"
              description="Real-time syncing means your team is always on the same page."
            />

            {/* Kanban */}

            <FeatureCard
              span="md:col-span-2"
              icon={<SquareKanban />}
              title="Kanban Boards"
              description="Fluid boards that adapt to your workflow. Drag, drop, and conquer your tasks."
            />

            {/* Chat */}

            <FeatureCard
              span="md:col-span-2"
              icon={<MessagesSquare />}
              title="Integrated Chat"
              description="Discuss tasks directly with your team without switching contexts."
            />

            {/* Analytics */}

            <FeatureCard
              span="md:col-span-1"
              icon={<ChartNoAxesCombined />}
              title="Analytics"
              description="Track progress, team velocity, and identify bottlenecks effortlessly."
            />

            {/* Team Management */}

            <FeatureCard
              span="md:col-span-1"
              icon={<UsersRound />}
              title="Team Management"
              description="Invite members, assign roles, and control permissions across your projects."
            />

            {/* Notifications */}

            <FeatureCard
              span="md:col-span-2"
              icon={<Bell />}
              title="Real-Time Notifications"
              description="Stay updated with task assignments, mentions, approvals, and project activity."
            />

            {/* Approval */}

            <FeatureCard
              span="md:col-span-2"
              icon={<ClipboardCheck />}
              title="Approval Workflow"
              description="Review and approve important changes before they move into production."
            />

            {/* Logs */}

            <FeatureCard
              span="md:col-span-1"
              icon={<History />}
              title="Activity & Audit Logs"
              description="Keep a complete history of project activity, changes, and team actions."
            />
          </div>
        </div>
      </section>

  

      <section id="how-it-works" className="scroll-mt-24 px-6 py-24 md:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              How FlowSync works
            </h2>

            <p className="mt-4 text-lg text-[var(--on-surface-variant)]">
              Get your team organized in just a few simple steps.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
    

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-bold text-white">
                1
              </div>

              <h3 className="mt-5 text-xl font-bold">Create a Project</h3>

              <p className="mt-3 text-[var(--on-surface-variant)]">
                Create a project and define the basic details, goals, and
                workflow for your team.
              </p>
            </div>



            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-bold text-white">
                2
              </div>

              <h3 className="mt-5 text-xl font-bold">Invite Your Team</h3>

              <p className="mt-3 text-[var(--on-surface-variant)]">
                Share your project code and bring your teammates into the
                workspace.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-xl font-bold text-white">
                3
              </div>

              <h3 className="mt-5 text-xl font-bold">Build Together</h3>

              <p className="mt-3 text-[var(--on-surface-variant)]">
                Manage tasks, communicate, track progress, and ship your project
                together.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="scroll-mt-24 bg-[var(--secondary-container)] px-6 py-24"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">Simple pricing</h2>

            <p className="mt-4 text-lg text-[var(--on-surface-variant)]">
              Everything you need to manage your projects.
            </p>
          </div>

          <div className="mx-auto max-w-md rounded-2xl border border-[var(--outline-variant)] bg-[var(--on-primary)] p-8 shadow-lg">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                Free
              </p>

              <h3 className="mt-3 text-4xl font-bold">₹0</h3>

              <p className="mt-2 text-[var(--on-surface-variant)]">
                Perfect for getting started.
              </p>
            </div>

            <div className="my-8 space-y-4">
              <PricingFeature text="Unlimited personal projects" />

              <PricingFeature text="Team collaboration" />

              <PricingFeature text="Kanban boards" />

              <PricingFeature text="Real-time chat" />

              <PricingFeature text="Project activity logs" />

              <PricingFeature text="Basic analytics" />
            </div>

            <Button
              onClick={() => navigate("/signup")}
              className="w-full cursor-pointer rounded-xl bg-[#4F46E5] py-6 text-lg text-white transition-all duration-300 hover:bg-[#4338CA]"
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center rounded-2xl bg-[var(--secondary-container)] p-10 text-center md:p-16">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to organize your next project?
          </h2>

          <p className="mt-4 max-w-xl text-lg text-[var(--on-surface-variant)]">
            Bring your team together, organize your workflow, and build
            something great with FlowSync.
          </p>

          <Button
            onClick={() => navigate("/signup")}
            className="mt-8 cursor-pointer rounded-xl bg-[#4F46E5] px-8 py-6 text-lg text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#4338CA] hover:shadow-lg"
          >
            Get Started for Free
            <ArrowRight />
          </Button>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-[var(--outline-variant)] bg-[var(--secondary-container)] px-6 py-10 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

          <div
            onClick={scrollToTop}
            className="cursor-pointer text-3xl text-[var(--on-surface)]"
          >
            Flow<span className="font-black text-[var(--primary)]">Sync</span>
          </div>

          {/* Copyright */}

          <div className="text-center text-sm text-[var(--on-surface-variant)]">
            <p>© 2026 FlowSync</p>

            <p className="mt-1">All rights reserved.</p>
          </div>

          {/* Footer Links */}

          <div>
            <ul className="flex flex-wrap justify-center gap-5 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#pricing"
                  className="text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]"
                >
                  Pricing
                </a>
              </li>

              <li>
                <a
                  href="#how-it-works"
                  className="text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]"
                >
                  How It Works
                </a>
              </li>

              <li>
                <button className="cursor-pointer text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]">
                  Privacy
                </button>
              </li>

              <li>
                <button className="cursor-pointer text-[var(--on-surface-variant)] transition-colors hover:text-[var(--on-surface)]">
                  Terms
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, span }) => {
  return (
    <div
      className={`${span} flex flex-col rounded-xl border border-[var(--outline-variant)] bg-[var(--on-primary)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-lg`}
    >
      <div className="text-[var(--tertiary)]">{icon}</div>

      <h3 className="my-3 text-lg font-bold">{title}</h3>

      <p className="leading-6 text-[var(--on-surface-variant)]">
        {description}
      </p>
    </div>
  );
};

const PricingFeature = ({ text }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white">
        <Check size={13} />
      </div>

      <span className="text-sm">{text}</span>
    </div>
  );
};

export default LandingPage;
