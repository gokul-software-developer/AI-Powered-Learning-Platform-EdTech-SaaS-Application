import { CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  isPublic: boolean;
  onToggle: (val: boolean) => void;
}

export default function UserPrivacyToggle({ isPublic, onToggle }: Props) {
  return (
    <CardContent className="flex items-center gap-4">
      <Label htmlFor="public-profile" className="text-sm">
        Public Profile
      </Label>
      <Switch
        id="public-profile"
        checked={isPublic}
        onCheckedChange={onToggle}
      />
      <span className="text-xs text-muted-foreground">
        {isPublic ? "Visible to everyone" : "Only visible to you"}
      </span>
    </CardContent>
  );
}
