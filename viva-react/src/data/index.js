export const navLinks = [
  { label: 'Home', href: '/', icon: '🏠', hasDropdown: false },
  { label: 'About', href: '/about', icon: 'ℹ️', hasDropdown: true },
  { label: 'Leadership', href: '/leadership', icon: '👥', hasDropdown: false },
  { label: 'Activities', href: '/activities', icon: '⚡', hasDropdown: true },
  { label: 'News', href: '/news', icon: '📰', hasDropdown: false },
  { label: 'Gallery', href: '/gallery', icon: '🖼️', hasDropdown: false },
  { label: 'Contact', href: '/contact', icon: '📞', hasDropdown: false },
];

export const stats = [
  { value: 50000, label: 'Active Members', suffix: '+', icon: '👨‍🎓' },
  { value: 64, label: 'Districts Reached', suffix: '', icon: '🗺️' },
  { value: 1200, label: 'Events Organized', suffix: '+', icon: '📅' },
  { value: 15, label: 'Years of Impact', suffix: '', icon: '🏆' },
];

export const leaders = [
  {
    name: 'Bobby Hajjaj',
    role: 'National President & Founder',
    image: '/images/leaders/bobby.jpg',
    bio: 'A visionary leader dedicated to building a democratic and prosperous Bangladesh through youth empowerment.',
    social: { fb: '#', tw: '#', li: '#' },
  },
  {
    name: 'Sarah Rahman',
    role: 'General Secretary',
    image: '/images/leaders/sarah.jpg',
    bio: 'Lead organizer with over 10 years of experience in student activism and community development.',
    social: { fb: '#', tw: '#', li: '#' },
  },
];

export const activities = [
  {
    title: 'Clean Campus Campaign',
    icon: '🧹',
    description: 'A nationwide initiative to promote environmental awareness and hygiene in educational institutions.',
    date: '2026-04-15',
    frequency: 'Monthly',
    color: 'primary',
  },
  {
    title: 'Digital Literacy Workshop',
    icon: '💻',
    description: 'Empowering students with essential tech skills for the 21st-century job market.',
    date: '2026-05-10',
    frequency: 'Weekly',
    color: 'accent',
  },
];

export const newsArticles = [
  {
    id: 1,
    title: 'NDM Expands to 10 New Universities',
    excerpt: 'Marking a major milestone, the movement has established new units in key regional hubs...',
    date: '2026-03-20',
    tag: 'Expansion',
    image: '/images/news/expansion.jpg',
    author: 'Admin',
    readTime: '4 min',
  },
  {
    id: 2,
    title: 'National Student Convention 2026 Announced',
    excerpt: 'Join thousands of student leaders in Dhaka for the annual policy and strategy summit.',
    date: '2026-03-15',
    tag: 'Event',
    image: '/images/news/convention.jpg',
    author: 'Bobby Hajjaj',
    readTime: '6 min',
  },
];

export const galleryImages = [
  { id: 1, src: '/images/gallery/event1.jpg', caption: 'Dhaka Division Meet, 2024', category: 'Events' },
  { id: 2, src: '/images/gallery/campaign1.jpg', caption: 'Tree Plantation Program', category: 'Campaigns' },
  { id: 3, src: '/images/gallery/award1.jpg', caption: 'Outstanding Achievement Award', category: 'Awards' },
];

export const districts = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur',
  'Chapai Nawabganj', 'Chittagong', 'Chuadanga', 'Comilla', 'Cox\'s Bazar', 'Dhaka', 'Dinajpur',
  'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jessore',
  'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram',
  'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Meherpur',
  'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi',
  'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur',
  'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj',
  'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
];

export const footerLinks = [
  {
    category: 'Organization',
    links: [
      { name: 'Our Story', href: '/about' },
      { name: 'Leadership', href: '/leadership' },
      { name: 'Activities', href: '/activities' },
    ],
  },
  {
    category: 'Community',
    links: [
      { name: 'Join Us', href: '/join' },
      { name: 'News & Updates', href: '/news' },
      { name: 'Gallery', href: '/gallery' },
    ],
  },
  {
    category: 'Support',
    links: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Resources', href: '/downloads' },
    ],
  },
];
