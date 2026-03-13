import Card from "./ui/Card";

export interface IdeaCardProps {
  title: string;
  description: string;
}

export default function IdeaCard({ title, description }: IdeaCardProps) {
  return (
    <Card>
      <h3 className="mb-2 text-[15px] font-semibold tracking-tight text-white/90">
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-white/45">{description}</p>
    </Card>
  );
}
