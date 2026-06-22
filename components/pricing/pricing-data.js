export const pricingPlans = [
  {
    name: "Free",
    description: "A simple way to start storing and organizing personal files.",
    price: 0,
    storage: "5 GB",
    tone: "green",
    cta: "Get Started",
    href: "/auth/signup",
    features: [
      "5 GB cloud storage",
      "Upload files and create folders",
      "Preview supported files",
      "Download files",
      "Basic file management",
      "Secure account access",
      "Community support",
    ],
    limitations: ["No advanced analytics", "No priority support"],
  },
  {
    name: "Pro",
    description: "More capacity and speed for focused individual work.",
    price: 9,
    storage: "100 GB",
    tone: "blue",
    popular: true,
    cta: "Upgrade to Pro",
    // TODO: Replace this signup destination with the Stripe checkout route.
    href: "/auth/signup?plan=pro",
    features: [
      "100 GB cloud storage",
      "Everything in Free",
      "Larger file upload limit",
      "Advanced file preview",
      "Faster downloads",
      "Storage usage insights",
      "Priority upload and download",
      "Priority support",
      "Better file organization",
    ],
  },
  {
    name: "Business",
    description: "Team-ready storage controls for growing organizations.",
    price: 29,
    storage: "1 TB",
    tone: "amber",
    cta: "Contact Sales",
    // TODO: Replace this contact link with the business checkout or sales form.
    href: "mailto:sales@storix.com?subject=Storix%20Business%20Plan",
    features: [
      "1 TB cloud storage",
      "Everything in Pro",
      "Team-ready storage",
      "Admin-level storage management",
      "Advanced storage analytics",
      "User activity visibility",
      "Priority support",
      "Higher file upload limits",
      "Better heavy-usage performance",
    ],
  },
];

export const comparisonRows = [
  { feature: "Storage", free: "5 GB", pro: "100 GB", business: "1 TB" },
  { feature: "File uploads", free: "Basic upload", pro: "Larger uploads", business: "Highest upload limit" },
  { feature: "Folder management", free: "Included", pro: "Included", business: "Included" },
  { feature: "File preview", free: "Basic preview", pro: "Advanced preview", business: "Advanced preview" },
  { feature: "Download support", free: "Standard", pro: "Faster downloads", business: "Fastest downloads" },
  { feature: "Storage analytics", free: null, pro: "Usage insights", business: "Advanced analytics" },
  { feature: "Admin controls", free: null, pro: null, business: "Included" },
  { feature: "Support", free: "Community", pro: "Priority", business: "Priority" },
];

export const pricingFaqs = [
  { question: "Can I start for free?", answer: "Yes. The Free plan includes 5 GB of secure cloud storage and the core file and folder tools, with no payment details required." },
  { question: "Can I upgrade later?", answer: "Yes. You can begin on Free and move to Pro or Business as your storage and workflow needs grow." },
  { question: "What happens when I reach my storage limit?", answer: "Your existing files remain available, but new uploads pause until you remove files or upgrade to a plan with more storage." },
  { question: "Can I cancel anytime?", answer: "Yes. Paid plans will be cancellable at any time once billing is enabled. Your access continues through the current billing period." },
  { question: "Is my data secure?", answer: "Storix uses authenticated sessions and secure object storage infrastructure. Access to files remains tied to your account permissions." },
  { question: "Which plan is best for teams?", answer: "Business is designed for teams, agencies, and organizations that need higher limits, activity visibility, and admin-level storage management." },
];
