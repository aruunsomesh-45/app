
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-[#F0F2F5] px-6 pt-16">
            <View className="mb-8">
                <Text className="text-3xl font-black text-[#1A1A1A] mb-1">
                    Good Evening,
                </Text>
                <Text className="text-gray-500 text-lg">
                    Focus on what matters.
                </Text>
            </View>

            <View className="flex-row gap-4">
                {/* News Tile */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push('/news')}
                    className="flex-1 h-40 bg-white rounded-[24px] p-5 justify-between shadow-sm border border-gray-100"
                >
                    <View className="bg-black/5 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="newspaper-outline" size={20} color="#1A1A1A" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-[#1A1A1A]">Skim News</Text>
                        <Text className="text-gray-400 text-xs mt-1">AI Curated Feed</Text>
                    </View>
                </TouchableOpacity>

                {/* Placeholder Tile */}
                <View className="flex-1 h-40 bg-white rounded-[24px] p-5 justify-between shadow-sm border border-dashed border-gray-200 opacity-60">
                    <View className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="add" size={20} color="#9CA3AF" />
                    </View>
                    <Text className="text-gray-400 font-medium">Coming Soon</Text>
                </View>
            </View>
        </View>
    );
}
