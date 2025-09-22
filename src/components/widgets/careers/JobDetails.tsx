import Image from 'next/image';
import JobCard from '../../atoms/jobCard/jobCard';

export type Job = {
  id: string;
  title: string;
  location: string;
  department: string;
  workType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  postedDaysAgo: number;
};

type Props = {
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
};
const jobLocation = 'Riyadh, Saudi Arabia';

const overview =
  'We are seeking a creative and detail-oriented Senior UI/UX Designer to join our growing product team. You will be responsible for creating intuitive, user-centered designs that enhance the overall user experience across our web and mobile platforms.';

const responsibilities = [
  'Conduct user research and translate findings into wireframes and prototypes.',
  'Design user interfaces for web and mobile applications with attention to usability and visual appeal.',
  'Collaborate with product managers, developers, and stakeholders.',
  'Maintain and improve the design system.',
  'Test and validate designs through usability testing and feedback.',
  'Stay updated with UI/UX trends and technologies.',
];

const qualifications = [
  "Bachelor's degree in Design, HCI, Computer Science, or related field (preferred but not always required).",
  '5+ years of UI/UX design experience.',
  'Proficiency in Figma, Adobe XD, Sketch, or similar tools.',
  'Understanding of user-centered design principles.',
  'Strong knowledge of HTML/CSS is a plus.',
  'Experience designing responsive and accessible interfaces.',
  'Familiar with design systems and component libraries.',
  'Good communication and teamwork skills.',
];

const skills = ['Figma', 'HTML', 'CSS', 'Design system', 'Responsive design'];

const similarJobs: Job[] = [
  {
    id: '1',
    title: 'UX/UI Designer',
    location: 'Riyadh, Saudi Arabia',
    department: 'Design',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '2',
    title: 'Backend Developer',
    location: 'Riyadh, Saudi Arabia',
    department: 'Engineering',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '3',
    title: 'Backend Developer',
    location: 'Riyadh, Saudi Arabia',
    department: 'Engineering',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '4',
    title: 'Marketing Specialist',
    location: 'Cairo, Egypt',
    department: 'Marketing',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '5',
    title: 'Software Engineer',
    location: 'Riyadh, Saudi Arabia',
    department: 'Engineering',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '6',
    title: 'Business Analyst',
    location: 'Riyadh, Saudi Arabia',
    department: 'Product Management',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '7',
    title: 'Marketing Specialist',
    location: 'Cairo, Egypt',
    department: 'Marketing',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
  {
    id: '8',
    title: 'Business Analyst',
    location: 'Riyadh, Saudi Arabia',
    department: 'Product Management',
    workType: 'Full-time',
    postedDaysAgo: 5,
  },
];

export default function JobDetails({ dir = 'ltr', className }: Props) {
  return (
    <section dir={dir} className="w-full mx-20">
      <div className="grid grid-cols-[2fr,1fr] gap-8">
        {/* Left column */}
        <div className="space-y-4 bg-white border rounded-3xl w-full px-8">
          <Box>
            <H3>Overview</H3>
            <p className="text-gray-700 leading-relaxed">{overview}</p>
          </Box>

          <Box>
            <H3>Key Responsibilities</H3>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-700">
              {responsibilities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Box>

          <Box>
            <H3>Qualifications</H3>
            <ul className="mt-3 list-disc pl-5 space-y-2 text-gray-700">
              {qualifications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Box>

          <Box>
            <H3>Skills</H3>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-[#E1F3F9] px-3 py-1 text-sm text-gray-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Box>
        </div>

        {/* Right column: sticky info card */}
        <aside className="max-w-sm">
          <div className="flex flex-col gap-6 border rounded-3xl bg-white p-8 top-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Icon src="/icons/map-pin.png" alt="Location" />
              <span>{jobLocation}</span>
            </div>
            <div>Please send us your detailed CV to apply for this job or click on apply now</div>

            <div className="mt-6 space-y-5">
              <InfoRow
                icon="/icons/phone_job_icon.png"
                label="Contact email"
                value="careers@gomoney.com"
              />
              <InfoRow
                icon="/icons/industry_icon.png"
                label="Industry"
                value="Information Technology & Services"
              />
              <InfoRow icon="/icons/job_icon.png" label="Job type" value="Full time" />
              <InfoRow icon="/icons/o'clock_job_icon.png" label="Posted" value="24, July, 2025" />
            </div>

            <button className="mt-6 w-full rounded-2xl bg-[#010663] px-4 py-3 font-medium text-white hover:opacity-90">
              Apply for this job
            </button>
          </div>
        </aside>
      </div>

      {/* Similar jobs */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-primary text-center">
          Similar jobs you may be interested in
        </h3>
        <div className="mt-6 grid grid-cols-4 gap-4">
          {similarJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
function Box({ children }: { children: React.ReactNode }) {
  return <div className="p-5 my-6">{children}</div>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-primary text-2xl font-semibold mb-1">{children}</h3>;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon src={icon} alt={label} />
      <div>
        <div className="text-18px font-bold">{label}</div>
        <div>{value}</div>
      </div>
    </div>
  );
}

function Icon({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} width={48} height={48} className="opacity-80" />;
}

