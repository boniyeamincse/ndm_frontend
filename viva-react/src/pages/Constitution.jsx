import React from 'react';
import { motion } from 'framer-motion';

const Constitution = () => {
  const sections = [
    {
      title: 'Preamble',
      paragraphs: [
        'We, the members of the Nationalist Democratic Student Movement (NDSM), united by the ideals of democracy, justice, equality, and national development, do hereby establish this Constitution to guide our organization, ensure accountability, and promote the welfare and rights of students across the nation.',
      ],
    },
    {
      title: 'Article 1: Name and Identity',
      paragraphs: [
        'The name of the organization shall be Nationalist Democratic Student Movement (NDSM).',
        'It shall function as the student wing aligned with the principles and vision of the Nationalist Democratic Movement (NDM).',
        'The organization shall be non-violent, democratic, and student-centered.',
      ],
    },
    {
      title: 'Article 2: Vision and Mission',
      paragraphs: [
        'Vision: To build a democratic, educated, and socially responsible student community contributing to national progress.',
        'Mission: Promote democratic values among students; protect student rights and welfare; encourage leadership, innovation, and activism; build an organized student network across all educational institutions.',
      ],
    },
    {
      title: 'Article 3: Objectives',
      paragraphs: [
        'To represent student interests at all levels.',
        'To ensure equal access to education and opportunities.',
        'To promote ethical leadership and accountability.',
        'To organize academic, social, and cultural activities.',
        'To support national development initiatives.',
      ],
    },
    {
      title: 'Article 4: Membership',
      paragraphs: [
        'Membership is open to all students who agree with the organization’s principles and are enrolled in an educational institution.',
        'Types of Membership: General Member, Active Member, Executive Member.',
        'Membership may be suspended or terminated for violation of rules or anti-organizational activities.',
      ],
    },
    {
      title: 'Article 5: Organizational Structure',
      paragraphs: [
        'The organization shall have a multi-level structure consisting of the Central Committee, Divisional Committee, District Committee, Upazila Committee, Union/Ward Committee, and Campus Units.',
        'Each level shall operate under the guidance of the higher committee.',
      ],
    },
    {
      title: 'Article 6: Leadership and Positions',
      paragraphs: [
        'Key positions may include President, Vice President(s), General Secretary, Joint Secretary, Organizing Secretary, Treasurer, Publicity Secretary, and other Secretaries as required.',
        'Responsibilities include ensuring the smooth functioning of the organization, implementing decisions and policies, and maintaining discipline and coordination.',
      ],
    },
    {
      title: 'Article 7: Election and Appointment',
      paragraphs: [
        'Leadership positions may be filled by democratic election or nomination by higher authority if applicable.',
        'Term duration shall be defined, for example 1 to 2 years.',
        'Fair and transparent processes must be ensured.',
      ],
    },
    {
      title: 'Article 8: Meetings',
      paragraphs: [
        'Regular meetings shall be held at all levels.',
        'Emergency meetings may be called when necessary.',
        'Decisions shall be made by majority vote.',
      ],
    },
    {
      title: 'Article 9: Code of Conduct',
      paragraphs: [
        'All members must respect organizational discipline, avoid violence and illegal activities, maintain integrity and honesty, and follow leadership decisions.',
        'Violation may result in disciplinary action.',
      ],
    },
    {
      title: 'Article 10: Finance and Fund Management',
      paragraphs: [
        'Funds may come from membership fees, donations, and approved fundraising activities.',
        'All financial transactions must be transparent and documented.',
        'The Treasurer shall maintain financial records.',
      ],
    },
    {
      title: 'Article 11: Activities',
      paragraphs: [
        'The organization may conduct student campaigns, seminars and workshops, social and cultural programs, and community service initiatives.',
      ],
    },
    {
      title: 'Article 12: Amendments',
      paragraphs: [
        'This Constitution may be amended by two-thirds majority approval.',
        'Amendments must align with core principles.',
      ],
    },
    {
      title: 'Article 13: Dissolution',
      paragraphs: [
        'The organization may be dissolved by majority decision of central leadership.',
        'All assets shall be handled responsibly.',
      ],
    },
    {
      title: 'Article 14: Final Authority',
      paragraphs: [
        'The Central Committee shall be the highest authority in interpreting this Constitution.',
      ],
    },
    {
      title: 'Declaration',
      paragraphs: [
        'This Constitution is adopted to ensure democratic governance, transparency, and effective leadership within the Nationalist Democratic Student Movement.',
      ],
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50"
    >
      <div className="bg-primary text-white">
        <div className="container mx-auto px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Official Structure Draft</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-display font-bold">Constitution of the Nationalist Democratic Student Movement (NDSM)</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/90">
            A public-facing constitutional draft defining the organization&apos;s identity, structure, discipline, membership, authority, and democratic functioning.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          This page contains draft constitutional text for presentation and organizational use. Final legal wording, procedural detail, and ratification status should be approved by the competent authority.
        </div>

        <div className="grid grid-cols-1 gap-6">
          {sections.map((section, index) => (
            <article key={section.title} className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-primary-dark">{section.title}</h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-gray-600 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Constitution;