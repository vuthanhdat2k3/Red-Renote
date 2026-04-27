import { Check } from "lucide-react-native";
import { Text, View } from "react-native";

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/i18n";
import { colors } from "@/constants/tokens";
import { PressableScale } from "@/components/ui/PressableScale";

type Props = {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  label?: string;
};

export function LanguageSelector({ value, onChange, label }: Props) {
  return (
    <View className="gap-2">
      {label ? <Text className="text-[13px] font-bold uppercase tracking-wider text-app-muted">{label}</Text> : null}
      <View className="flex-row gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = value === lang.code;
          return (
            <PressableScale
              key={lang.code}
              onPress={() => onChange(lang.code)}
              scaleTo={0.94}
              className={`flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 ${
                active ? "border-brand-primary bg-red-50" : "border-app-border bg-white"
              }`}
            >
              {active ? <Check color={colors.primary} size={12} strokeWidth={3} /> : null}
              <Text className={`text-[13px] font-semibold ${active ? "text-brand-primary" : "text-app-muted"}`}>
                {lang.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
