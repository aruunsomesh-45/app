
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, Linking, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { fetchTopHeadlines, searchNews, NewsArticle } from '../../src/services/newsService';
import { searchGoogle } from '../../src/services/googleSearchService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function NewsScreen() {
    const [activeTab, setActiveTab] = useState('for-you');
    const [searchQuery, setSearchQuery] = useState('');
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(false);

    const trendingTopics = [
        { id: 'ai', label: 'AI & Future', color: 'bg-purple-100' },
        { id: 'crypto', label: 'Crypto', color: 'bg-orange-100' },
        { id: 'tech', label: 'Tech', color: 'bg-blue-100' },
        { id: 'startups', label: 'Startups', color: 'bg-green-100' },
    ];

    useEffect(() => {
        loadFeed();
    }, [activeTab]);

    const loadFeed = async () => {
        setLoading(true);
        let data: NewsArticle[] = [];
        try {
            if (activeTab === 'for-you') {
                data = await fetchTopHeadlines('technology');
            } else {
                const topic = trendingTopics.find(t => t.id === activeTab)?.label || activeTab;
                data = await searchNews(topic);
            }
        } catch (e) {
            console.error(e);
        }
        setArticles(data);
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setActiveTab('search');

        const newsResults = await searchNews(searchQuery);
        if (newsResults.length > 0) {
            setArticles(newsResults);
        } else {
            try {
                const googleResults = await searchGoogle(searchQuery);
                const mapped: NewsArticle[] = googleResults.map(g => ({
                    title: g.title,
                    description: g.snippet,
                    url: g.link,
                    source: { name: g.displayLink || 'Google Result' },
                    publishedAt: new Date().toISOString(),
                    urlToImage: g.pagemap?.cse_image?.[0]?.src
                }));
                setArticles(mapped);
            } catch (err) {
                console.error(err);
                setArticles([]);
            }
        }
        setLoading(false);
    };

    const renderItem = ({ item, index }: { item: NewsArticle, index: number }) => {
        const isFeatured = index % 5 === 0;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => Linking.openURL(item.url)}
                className={`mb-5 overflow-hidden rounded-[32px] bg-white shadow-sm border border-gray-100 ${isFeatured ? 'h-96' : 'h-72'}`}
            >
                {item.urlToImage ? (
                    <Image source={{ uri: item.urlToImage }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="absolute inset-0 bg-gray-100 justify-center items-center">
                        <Ionicons name="globe-outline" size={64} color="#CBD5E1" />
                    </View>
                )}

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                    className="absolute inset-x-0 bottom-0 pt-20 pb-6 px-6 justify-end"
                >
                    <View className="flex-row items-center mb-3">
                        <View className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">{item.source.name}</Text>
                        </View>
                    </View>
                    <Text className="text-white font-bold text-2xl leading-tight mb-2 shadow-sm" numberOfLines={3}>
                        {item.title}
                    </Text>
                    {isFeatured && (
                        <Text className="text-gray-300 text-sm leading-5 shadow-sm" numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F0F2F5]">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-5 pt-2 pb-4">
                <Text className="text-4xl font-extrabold text-[#1A1A1A] mb-6 tracking-tight">Browse for Me</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white rounded-full px-5 h-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)] mb-6">
                    <Ionicons name="search" size={22} color="#9CA3AF" />
                    <TextInput
                        placeholder="Ask anything..."
                        className="flex-1 ml-3 text-lg text-[#1A1A1A]"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </View>

                {/* Topics */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    <TouchableOpacity
                        onPress={() => setActiveTab('for-you')}
                        className={`px-6 py-2.5 rounded-full mr-3 border ${activeTab === 'for-you' ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'bg-white border-transparent'}`}
                    >
                        <Text className={`font-semibold text-sm ${activeTab === 'for-you' ? 'text-white' : 'text-gray-600'}`}>For You</Text>
                    </TouchableOpacity>
                    {trendingTopics.map(t => (
                        <TouchableOpacity
                            key={t.id}
                            onPress={() => { setActiveTab(t.id); setSearchQuery('') }}
                            className={`px-6 py-2.5 rounded-full mr-3 border ${activeTab === t.id ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'bg-white border-transparent'}`}
                        >
                            <Text className={`font-semibold text-sm ${activeTab === t.id ? 'text-white' : 'text-gray-600'}`}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1A1A1A" />
                </View>
            ) : (
                <FlatList
                    data={articles}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}
