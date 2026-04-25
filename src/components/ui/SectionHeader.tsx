import { SectionTitle } from "@/components/ui/SectionTitle";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: string;
};

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return <SectionTitle action={action} subtitle={eyebrow} title={title} />;
}
