// Mock data for development/fallback when API is unavailable
import type {
  HeroData,
  ResearchArea,
  TeamMember,
  Publication,
  ContactInfo,
  SiteSettings,
  TimelineEvent
} from "./types";

export const mockHeroData: HeroData = {
  id: 1,
  title: "Advancing Artificial Intelligence",
  subtitle: "King's Lab",
  description: "Pioneering cutting-edge research in deep learning, neural networks, and artificial intelligence. Our mission is to push the boundaries of what's possible with AI and create intelligent systems that benefit humanity.",
  background_image: "https://images.unsplash.com/photo-1645839078449-124db8a049fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3NjE2NzMyNTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  stats: {
    projects: "50+",
    members: "25",
    publications: "100+"
  }
};

export const mockResearchAreas: ResearchArea[] = [
  {
    id: 1,
    title: "Deep Learning",
    description: "Developing novel neural network architectures and training methodologies for complex AI tasks.",
    details: "Our deep learning team focuses on advancing convolutional neural networks, transformers, and generative models. We're currently working on 20+ projects spanning computer vision, natural language processing, and multimodal learning.",
    icon: "Brain",
    image: "https://images.unsplash.com/photo-1717501218534-156f33c28f8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWVwJTIwbGVhcm5pbmclMjBBSSUyMHJlc2VhcmNofGVufDF8fHx8MTc2MTY3Mzg5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    order: 1
  },
  {
    id: 2,
    title: "Computer Vision",
    description: "Exploring visual understanding through advanced image and video analysis techniques.",
    details: "We develop state-of-the-art algorithms for object detection, semantic segmentation, and 3D reconstruction. Our research powers applications in autonomous systems, medical imaging, and augmented reality.",
    icon: "Eye",
    image: "https://images.unsplash.com/photo-1603060376014-37545a04bcf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHZpc2lvbiUyMHJvYm90aWNzfGVufDF8fHx8MTc2MTY3Mzg5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    order: 2
  },
  {
    id: 3,
    title: "Natural Language Processing",
    description: "Building intelligent systems that understand and generate human language.",
    details: "Our NLP research encompasses large language models, machine translation, sentiment analysis, and conversational AI. We're pushing the boundaries of language understanding and generation.",
    icon: "MessageSquare",
    image: "https://images.unsplash.com/photo-1738003667850-a2fb736e31b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHRlY2hub2xvZ3klMjBmdXR1cmV8ZW58MXx8fHwxNzYxNjM2NjQxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    order: 3
  },
  {
    id: 4,
    title: "Reinforcement Learning",
    description: "Creating autonomous agents that learn optimal decision-making through interaction.",
    details: "We develop advanced RL algorithms for robotics, game playing, and real-world optimization problems. Our work combines deep learning with decision theory to create intelligent autonomous systems.",
    icon: "Cpu",
    image: "https://images.unsplash.com/photo-1653179241439-c4c10083879a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc2MTY2MjY3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    order: 4
  }
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "Principal Investigator",
    expertise: ["Deep Learning", "Computer Vision"],
    bio: "Leading research in neural network architectures with 15+ years of AI experience.",
    education: "PhD in Computer Science, Stanford University",
    affiliation: "King's Lab, Department of Computer Science",
    publications_count: 45,
    email: "s.chen@kingslab.ai",
    image: "https://images.unsplash.com/photo-1646579886741-12b59840c63f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMHNjaWVudGlzdCUyMHRlYW18ZW58MXx8fHwxNzYxNjI3ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    linkedin_url: "https://linkedin.com",
    researchgate_url: "https://researchgate.net",
    github_url: "https://github.com/sarahchen",
    google_scholar_url: "https://scholar.google.com",
    cv_url: "https://example.com/cv/sarah-chen.pdf",
    order: 1,
    is_alumni: false
  },
  {
    id: 2,
    name: "Dr. Michael Roberts",
    role: "Senior Researcher",
    expertise: ["NLP", "Large Language Models"],
    bio: "Specializing in transformer architectures and language understanding.",
    education: "PhD in Artificial Intelligence, MIT",
    affiliation: "King's Lab, AI Research Division",
    publications_count: 38,
    email: "m.roberts@kingslab.ai",
    image: "https://images.unsplash.com/photo-1646579886741-12b59840c63f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMHNjaWVudGlzdCUyMHRlYW18ZW58MXx8fHwxNzYxNjI3ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    linkedin_url: "https://linkedin.com",
    github_url: "https://github.com/mroberts",
    google_scholar_url: "https://scholar.google.com",
    order: 2,
    is_alumni: false
  },
  {
    id: 3,
    name: "Dr. Emily Patel",
    role: "Postdoctoral Fellow",
    expertise: ["Reinforcement Learning", "Robotics"],
    bio: "Developing autonomous agents and robot control systems.",
    education: "PhD in Robotics, Carnegie Mellon University",
    affiliation: "King's Lab, Robotics Division",
    publications_count: 22,
    email: "e.patel@kingslab.ai",
    image: "https://images.unsplash.com/photo-1646579886741-12b59840c63f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMHNjaWVudGlzdCUyMHRlYW18ZW58MXx8fHwxNzYxNjI3ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    researchgate_url: "https://researchgate.net",
    google_scholar_url: "https://scholar.google.com",
    order: 3,
    is_alumni: false
  },
  {
    id: 4,
    name: "Dr. James Kim",
    role: "Research Scientist",
    expertise: ["Generative AI", "GANs"],
    bio: "Investigating generative models and creative AI applications.",
    education: "PhD in Machine Learning, UC Berkeley",
    affiliation: "King's Lab, Generative AI Lab",
    publications_count: 31,
    email: "j.kim@kingslab.ai",
    image: "https://images.unsplash.com/photo-1646579886741-12b59840c63f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMHNjaWVudGlzdCUyMHRlYW18ZW58MXx8fHwxNzYxNjI3ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    linkedin_url: "https://linkedin.com",
    github_url: "https://github.com/jameskim",
    google_scholar_url: "https://scholar.google.com",
    order: 4,
    is_alumni: false
  },
  {
    id: 5,
    name: "Dr. David Martinez",
    role: "Former PhD Student",
    expertise: ["Deep Learning", "Medical Imaging"],
    bio: "Pioneered novel deep learning approaches for medical diagnosis during his PhD at King's Lab.",
    education: "PhD in Computer Science, King's Lab",
    affiliation: "Google DeepMind",
    publications_count: 18,
    email: "d.martinez.alumni@kingslab.ai",
    image: "https://images.unsplash.com/photo-1646579886741-12b59840c63f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMHNjaWVudGlzdCUyMHRlYW18ZW58MXx8fHwxNzYxNjI3ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    linkedin_url: "https://linkedin.com",
    google_scholar_url: "https://scholar.google.com",
    order: 5,
    is_alumni: true,
    alumni_info: "Accepted position as Research Scientist at Google DeepMind",
    alumni_year: 2023,
    current_position: "Research Scientist, Google DeepMind"
  },
  {
    id: 6,
    name: "Dr. Lisa Anderson",
    role: "Former Postdoctoral Fellow",
    expertise: ["NLP", "Information Retrieval"],
    bio: "Contributed to breakthrough research in semantic search and question answering systems.",
    education: "PhD in Computational Linguistics, Oxford University",
    affiliation: "Assistant Professor, MIT",
    publications_count: 25,
    email: "l.anderson.alumni@kingslab.ai",
    image: "https://images.unsplash.com/photo-1646579886741-12b59840c63f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMHNjaWVudGlzdCUyMHRlYW18ZW58MXx8fHwxNzYxNjI3ODg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    linkedin_url: "https://linkedin.com",
    researchgate_url: "https://researchgate.net",
    google_scholar_url: "https://scholar.google.com",
    order: 6,
    is_alumni: true,
    alumni_info: "Accepted tenure-track faculty position at MIT",
    alumni_year: 2022,
    current_position: "Assistant Professor, MIT Computer Science"
  }
];

export const mockPublications: Publication[] = [
  {
    id: 1,
    title: "Attention Is All You Need: Advances in Transformer Architectures",
    authors: "Chen, S., Roberts, M., Patel, E.",
    author_ids: [1, 2, 3],
    journal: "Nature Machine Intelligence",
    publication_type: "Journal",
    year: 2024,
    citations: 342,
    tag: "Featured",
    category: "Deep Learning",
    abstract: "We present novel improvements to transformer architectures that achieve state-of-the-art performance across multiple benchmarks in natural language processing and computer vision. Our approach introduces a novel attention mechanism that reduces computational complexity while maintaining accuracy.",
    url: "#",
    doi: "10.1038/s42256-024-00001-x",
    volume: "6",
    issue: "3",
    pages: "234-248",
    publisher: "Nature Publishing Group",
    event_photo: "https://images.unsplash.com/photo-1660795308754-4c6422baf2f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwcHJlc2VudGF0aW9uJTIwYXdhcmR8ZW58MXx8fHwxNzYxNzE3OTYyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    certificate_url: "#certificate1"
  },
  {
    id: 2,
    title: "Self-Supervised Learning for Visual Representations",
    authors: "Patel, E., Kim, J., Chen, S.",
    author_ids: [3, 4, 1],
    conference: "IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2024)",
    publication_type: "Conference",
    year: 2024,
    citations: 189,
    tag: "Recent",
    category: "Computer Vision",
    abstract: "A novel self-supervised learning approach that learns robust visual representations without labeled data, achieving competitive results on downstream tasks. We demonstrate that our method outperforms existing approaches on ImageNet classification and transfer learning benchmarks.",
    url: "#",
    doi: "10.1109/CVPR52688.2024.00542",
    pages: "1234-1243",
    event_photo: "https://images.unsplash.com/photo-1760346547345-55dc606f9cbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc2MTcxNzk2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    title: "Large Language Models for Scientific Discovery",
    authors: "Roberts, M., Chen, S.",
    author_ids: [2, 1],
    journal: "Science",
    publication_type: "Journal",
    year: 2023,
    citations: 503,
    tag: "Highly Cited",
    category: "NLP",
    abstract: "Exploring how large language models can accelerate scientific research through automated hypothesis generation and literature analysis. We present case studies across multiple scientific domains including materials science, drug discovery, and climate modeling.",
    url: "#",
    doi: "10.1126/science.abq1234",
    volume: "382",
    issue: "6673",
    pages: "1156-1162",
    publisher: "American Association for the Advancement of Science",
    certificate_url: "#certificate3"
  },
  {
    id: 4,
    title: "Deep Reinforcement Learning for Robotic Manipulation",
    authors: "Kim, J., Patel, E., Roberts, M.",
    author_ids: [4, 3, 2],
    journal: "IEEE Transactions on Robotics and Automation",
    publication_type: "Journal",
    year: 2023,
    citations: 256,
    tag: "Featured",
    category: "Reinforcement Learning",
    abstract: "Novel RL algorithms enable robots to learn complex manipulation tasks with minimal human supervision, achieving human-level performance. Our approach combines model-based and model-free reinforcement learning techniques.",
    url: "#",
    doi: "10.1109/TRO.2023.3287654",
    volume: "39",
    issue: "4",
    pages: "2891-2907",
    publisher: "IEEE",
    event_photo: "https://images.unsplash.com/photo-1660795308754-4c6422baf2f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2FkZW1pYyUyMGNvbmZlcmVuY2UlMjBzcGVha2Vyc3xlbnwxfHx8fDE3NjE3MTc5NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    certificate_url: "#certificate4"
  },
  {
    id: 5,
    title: "Neural Architecture Search for Efficient Deep Networks",
    authors: "Chen, S., Kim, J.",
    author_ids: [1, 4],
    conference: "International Conference on Machine Learning (ICML 2023)",
    publication_type: "Conference",
    year: 2023,
    citations: 178,
    tag: "Recent",
    category: "Deep Learning",
    abstract: "We propose an efficient neural architecture search method that discovers high-performance networks with reduced computational costs.",
    url: "#",
    pages: "5678-5689"
  },
  {
    id: 6,
    title: "Advances in Neural Machine Translation",
    authors: "Roberts, M., Patel, E.",
    author_ids: [2, 3],
    book_chapter: "The Handbook of Natural Language Processing (3rd Edition)",
    publication_type: "Book Chapter",
    year: 2023,
    citations: 94,
    tag: "Recent",
    category: "NLP",
    abstract: "A comprehensive review of recent advances in neural machine translation, covering encoder-decoder architectures, attention mechanisms, and multilingual models.",
    publisher: "MIT Press",
    pages: "345-389"
  }
];

export const mockContactInfo: ContactInfo = {
  id: 1,
  address: "123 AI Research Park Drive, Innovation Building, Floor 5",
  city: "Boston",
  state: "MA",
  zip: "02115",
  phone: "+1 (617) 555-0123",
  email: "info@kingslab.ai"
};

export const mockSiteSettings: SiteSettings = {
  id: 1,
  lab_name: "King's Lab",
  tagline: "Advancing Artificial Intelligence",
  about: "King's Lab is a world-leading artificial intelligence research laboratory focused on deep learning, computer vision, natural language processing, and reinforcement learning.",
  logo_text: "KL",
  social_links: {
    twitter: "https://twitter.com/kingslab",
    linkedin: "https://linkedin.com/company/kingslab",
    github: "https://github.com/kingslab"
  }
};

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 1,
    year: 2015,
    title: "Lab Foundation",
    description: "King's Lab was established with a vision to advance AI research and development.",
    category: "milestone",
    order: 1
  },
  {
    id: 2,
    year: 2017,
    title: "First Major Publication",
    description: "Published groundbreaking research on neural architecture optimization in Nature Machine Intelligence.",
    category: "publication",
    order: 2
  },
  {
    id: 3,
    year: 2018,
    title: "NSF Grant Award",
    description: "Received $2.5M NSF grant for advancing deep learning methodologies.",
    category: "award",
    order: 3
  },
  {
    id: 4,
    year: 2019,
    title: "100th Publication Milestone",
    description: "Reached 100 published research papers across top-tier AI conferences and journals.",
    category: "achievement",
    order: 4
  },
  {
    id: 5,
    year: 2020,
    title: "New Research Facility",
    description: "Opened state-of-the-art AI research facility with advanced GPU clusters and collaborative spaces.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    category: "milestone",
    order: 5
  },
  {
    id: 6,
    year: 2021,
    title: "Best Paper Award - CVPR",
    description: "Won Best Paper Award at Computer Vision and Pattern Recognition conference for novel vision transformer architecture.",
    category: "award",
    order: 6
  },
  {
    id: 7,
    year: 2022,
    title: "International Collaboration",
    description: "Established partnerships with leading AI labs at MIT, Stanford, and Oxford University.",
    category: "milestone",
    order: 7
  },
  {
    id: 8,
    year: 2023,
    title: "10,000+ Citations",
    description: "Lab publications surpassed 10,000 total citations, demonstrating significant research impact.",
    category: "achievement",
    order: 8
  },
  {
    id: 9,
    year: 2024,
    title: "AI for Healthcare Initiative",
    description: "Launched major initiative applying deep learning to medical imaging and diagnosis.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    category: "milestone",
    order: 9
  },
  {
    id: 10,
    year: 2025,
    title: "50+ Team Members",
    description: "Lab expanded to over 50 researchers, including faculty, postdocs, and PhD students.",
    category: "achievement",
    order: 10
  }
];
