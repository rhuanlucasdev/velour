import IdeaCard, { IdeaCardProps } from "./IdeaCard";
import Button from "./ui/Button";
import Container from "./ui/Container";
import SectionHeader from "./ui/SectionHeader";

const IDEAS: IdeaCardProps[] = [
  {
    title: "Idea 01",
    description: "Placeholder concept for product exploration.",
  },
  {
    title: "Idea 02",
    description: "Placeholder concept for product exploration.",
  },
  {
    title: "Idea 03",
    description: "Placeholder concept for product exploration.",
  },
  {
    title: "Idea 04",
    description: "Placeholder concept for product exploration.",
  },
  {
    title: "Idea 05",
    description: "Placeholder concept for product exploration.",
  },
  {
    title: "Idea 06",
    description: "Placeholder concept for product exploration.",
  },
];

export default function Dashboard() {
  return (
    <Container className="py-8">
      <SectionHeader
        title="Ideas"
        subtitle={`${IDEAS.length} ideas — sorted by latest`}
        className="mb-6"
      />

      {/* Primary CTA */}
      <div className="mb-8">
        <Button variant="primary" size="md">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1v10M1 6h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          New Idea
        </Button>
      </div>

      {/* Ideas grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {IDEAS.map((idea, index) => (
          <IdeaCard key={index} {...idea} />
        ))}
      </div>
    </Container>
  );
}
