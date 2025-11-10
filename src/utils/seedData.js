require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('../models/User');
const LabInfo = require('../models/LabInfo');
const Hero = require('../models/Hero');
const ContactInfo = require('../models/ContactInfo');
const ResearchArea = require('../models/ResearchArea');
const Publication = require('../models/Publication');
const TeamMember = require('../models/TeamMember');
const Timeline = require('../models/Timeline');

// Sample data
const sampleData = {
  user: {
    name: process.env.DEFAULT_ADMIN_NAME || 'Admin User',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@kingslab.ai',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin'
  },
  labInfo: {
    lab_name: "King's Lab",
    tagline: "Advancing Artificial Intelligence Research",
    description: "A cutting-edge research laboratory focused on deep learning, computer vision, and natural language processing.",
    email: "info@kingslab.ai",
    phone: "+1 (555) 123-4567",
    address: "123 Research Way, Innovation City, IC 12345"
  },
  hero: {
    title: "Pioneering the Future of AI",
    subtitle: "King's Lab",
    description: "We are a world-class research laboratory pushing the boundaries of AI, ML, and deep learning.",
    cta_primary_text: "Explore Research",
    cta_primary_link: "#research",
    cta_secondary_text: "Meet the Team",
    cta_secondary_link: "#team"
  },
  contactInfo: {
    email: "contact@kingslab.ai",
    phone: "+1 (555) 123-4567",
    address: "123 Research Way, Innovation City, IC 12345",
    office_hours: "Monday - Friday: 9:00 AM - 5:00 PM",
    social_links: {
      twitter: "https://twitter.com/kingslab",
      linkedin: "https://linkedin.com/company/kingslab",
      github: "https://github.com/kingslab",
      youtube: "https://youtube.com/@kingslab"
    }
  },
  researchAreas: [
    {
      title: "Deep Learning",
      description: "Advanced neural network architectures and training methodologies",
      details: "We develop novel deep learning algorithms for image recognition, NLP, and reinforcement learning.",
      icon: "Brain",
      order: 1
    },
    {
      title: "Computer Vision",
      description: "Visual recognition and image understanding systems",
      details: "Object detection, semantic segmentation, 3D reconstruction, and video analysis.",
      icon: "Eye",
      order: 2
    },
    {
      title: "Natural Language Processing",
      description: "Language understanding and generation technologies",
      details: "Machine translation, question answering, text summarization, and dialogue systems.",
      icon: "MessageSquare",
      order: 3
    },
    {
      title: "Reinforcement Learning",
      description: "Decision-making and control systems",
      details: "Developing agents that learn optimal policies through interaction with environments.",
      icon: "Cpu",
      order: 4
    }
  ],
  teamMembers: [
    {
      name: "Dr. Sarah Johnson",
      role: "Principal Investigator",
      bio: "Leads the lab with 15+ years in AI research.",
      email: "sarah.johnson@kingslab.ai",
      expertise: ["Deep Learning", "Computer Vision", "Neural Networks"],
      education: ["PhD in Computer Science - MIT", "MS in AI - Stanford University"],
      publications_count: 45,
      is_alumni: false,
      join_date: new Date('2015-01-01'),
      order: 1
    },
    {
      name: "Dr. Michael Chen",
      role: "Senior Researcher",
      bio: "Specializes in NLP and publishes in top-tier conferences.",
      email: "michael.chen@kingslab.ai",
      expertise: ["NLP", "Machine Translation", "Transformers"],
      education: ["PhD in Computational Linguistics - UC Berkeley"],
      publications_count: 32,
      is_alumni: false,
      join_date: new Date('2017-06-01'),
      order: 2
    }
  ],
  publications: [
    {
      title: "Efficient Neural Architecture Search for Image Classification",
      authors: "Sarah Johnson, Michael Chen, Emily Rodriguez",
      year: 2024,
      publication_type: "conference",
      venue: "NeurIPS",
      abstract: "A novel approach to neural architecture search that reduces computational cost.",
      citations: 12
    },
    {
      title: "Advances in Transformer Models for Machine Translation",
      authors: "Michael Chen, Sarah Johnson",
      year: 2023,
      publication_type: "journal",
      venue: "Journal of Artificial Intelligence Research",
      abstract: "Improvements to transformer architectures for machine translation.",
      citations: 28
    }
  ],
  timeline: [
    {
      year: 2024,
      month: 10,
      title: "Best Paper Award at NeurIPS",
      description: "Our paper on efficient NAS received the Best Paper Award at NeurIPS 2024.",
      date: new Date('2024-10-15')
    },
    {
      year: 2023,
      month: 6,
      title: "New NSF Grant Awarded",
      description: "Received $1.2M NSF grant to advance research in interpretable AI systems.",
      date: new Date('2023-06-01')
    },
    {
      year: 2015,
      month: 1,
      title: "Lab Founded",
      description: "King's Lab was officially established.",
      date: new Date('2015-01-01')
    }
  ]
};

// Seeder function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      LabInfo.deleteMany({}),
      Hero.deleteMany({}),
      ContactInfo.deleteMany({}),
      ResearchArea.deleteMany({}),
      Publication.deleteMany({}),
      TeamMember.deleteMany({}),
      Timeline.deleteMany({})
    ]);
    console.log('✅ Existing data cleared\n');

    // Create admin user
    console.log('👤 Creating admin user...');
    const user = await User.create(sampleData.user);
    console.log(`✅ Admin created: ${user.email}\n`);

    // Lab info
    console.log('🏢 Creating lab info...');
    await LabInfo.create(sampleData.labInfo);
    console.log('✅ Lab info created\n');

    // Hero
    console.log('🦸 Creating hero section...');
    await Hero.create(sampleData.hero);
    console.log('✅ Hero section created\n');

    // Contact info
    console.log('📞 Creating contact info...');
    await ContactInfo.create(sampleData.contactInfo);
    console.log('✅ Contact info created\n');

    // Research areas
    console.log('🔬 Creating research areas...');
    await ResearchArea.insertMany(sampleData.researchAreas);
    console.log(`✅ ${sampleData.researchAreas.length} research areas created\n`);

    // Team members
    console.log('👥 Creating team members...');
    const teamMembers = await TeamMember.insertMany(sampleData.teamMembers);
    console.log(`✅ ${teamMembers.length} team members created\n`);

    // Publications with author references
    console.log('📚 Creating publications...');
    const publicationsWithAuthors = sampleData.publications.map(pub => ({
      ...pub,
      author_ids: teamMembers.slice(0, 2).map(tm => tm._id)
    }));
    await Publication.insertMany(publicationsWithAuthors);
    console.log(`✅ ${publicationsWithAuthors.length} publications created\n`);

    // Timeline
    console.log('📅 Creating timeline events...');
    await Timeline.insertMany(sampleData.timeline);
    console.log(`✅ ${sampleData.timeline.length} timeline events created\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📝 Admin Login: ${sampleData.user.email} / ${sampleData.user.password}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Connect to MongoDB and run seeder
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected for seeding\n');

    await seedDatabase();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
})();
