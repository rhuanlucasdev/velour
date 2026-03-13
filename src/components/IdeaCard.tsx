import Card from "./ui/Card";

export interface IdeaCardProps {
  title: string;
}

export default function IdeaCard({ title }: IdeaCardProps) {
  return (
    <Card>
      <h3 className="text-[15px] font-semibold tracking-tight text-white/90">
        {title}
      </h3>
    </Card>
  );
}
