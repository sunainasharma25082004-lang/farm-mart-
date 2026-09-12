import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ProductCard } from "../../components/ProductCard";
import { products, categories, services } from "../../data/mockData";
import { useApp } from "../../context/AppContext";
import { colors } from "../../theme/colors";

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - 32 - CARD_GAP) / 2;

export const HomeScreen = ({ navigation }) => {
  const { userProfile, selectedAddress } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const scrollViewRef = useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-scroll banners
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentBannerIndex + 1;
      if (nextIndex >= 3) nextIndex = 0;
      setCurrentBannerIndex(nextIndex);
      // Banner width (width - 32) + marginRight (12)
      const scrollX = nextIndex * (width - 32 + 12);
      scrollViewRef.current?.scrollTo({ x: scrollX, animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [currentBannerIndex]);

  // Derived Data
  const topCategories = categories.filter((c) => c.id !== "all").slice(0, 8); // Take 8 for a 2-row scroll
  const trendingProducts = products.filter((p) => p.rating >= 4.9).slice(0, 5);
  const freshHarvest = products.filter((p) => p.service === "farm_harvest");
  const homeMeals = products.filter((p) => p.service === "homerestro");

  const deliveryLocation =
    selectedAddress?.label || userProfile?.villageHub || "Select Location";

  const catColors = [
    "#fef3c7",
    "#dcfce7",
    "#ffedd5",
    "#fce7f3",
    "#f3e8ff",
    "#e0f2fe",
    "#fef08a",
    "#bbf7d0",
  ];
  const catIconColors = [
    "#d97706",
    "#16a34a",
    "#ea580c",
    "#db2777",
    "#9333ea",
    "#0284c7",
    "#ca8a04",
    "#15803d",
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Enhanced Header & Location (Flipkart/Instamart Style) */}
      <View style={styles.headerArea}>
        <View style={styles.locationRow}>
          <TouchableOpacity
            style={styles.locationLeft}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AddressScreen")}
          >
            <Ionicons name="location" size={24} color={colors.primary} />
            <View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text style={styles.deliverToText}>Deliver to</Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.locationTitle}>{deliveryLocation}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileWallet")}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {(userProfile?.name || "G").charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Floating Search Bar */}
        <TouchableOpacity
          style={styles.searchSection}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Catalog")}
        >
          <Ionicons name="search" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#94a3b8" }}>
              Search 'Desi Ghee', 'Fresh Tomatoes'...
            </Text>
          </View>
          <View style={styles.micWrap}>
            <Ionicons name="mic" size={18} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Circular Categories (Dense Layout) */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {topCategories.map((cat, index) => {
              const bgColor = catColors[index % catColors.length];
              const iconColor = catIconColors[index % catIconColors.length];
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.catBubble}
                  activeOpacity={0.6}
                  onPress={() =>
                    navigation.navigate("Catalog", { initialCategory: cat.id })
                  }
                >
                  <View
                    style={[
                      styles.catIconWrap,
                      {
                        backgroundColor: bgColor,
                        borderColor: bgColor,
                        elevation: 4,
                        shadowColor: iconColor,
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        shadowOffset: { width: 0, height: 3 },
                      },
                    ]}
                  >
                    <Ionicons name={cat.icon} size={22} color={iconColor} />
                  </View>
                  <Text style={styles.catLabel} numberOfLines={2}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Promotional Banners */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerSlider}
          snapToInterval={width - 32 + 12}
          decelerationRate="fast"
        >
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
            }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: 12 }}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroTitle}>Fresh Farm Veggies</Text>
              <Text style={styles.heroSub}>
                Harvested daily & delivered in 30 mins
              </Text>
            </LinearGradient>
          </ImageBackground>

          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&auto=format&fit=crop&q=80",
            }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: 12 }}
          >
            <LinearGradient
              colors={["transparent", "rgba(180, 83, 9, 0.9)"]}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroTitle}>A2 Bilona Cow Ghee</Text>
              <Text style={styles.heroSub}>
                100% Pure, Traditionally Churned
              </Text>
            </LinearGradient>
          </ImageBackground>

          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
            }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: 12 }}
          >
            <LinearGradient
              colors={["transparent", "rgba(185, 28, 28, 0.9)"]}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroTitle}>Home-Cooked Thalis</Text>
              <Text style={styles.heroSub}>Prepared by local women chefs</Text>
            </LinearGradient>
          </ImageBackground>
        </ScrollView>

        <View style={styles.bannerDots}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.bannerDot,
                currentBannerIndex === index && styles.bannerDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.serviceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by service</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Catalog")}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceScroll}
          >
            {services.slice(0, 5).map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() =>
                  navigation.navigate("Catalog", {
                    initialCategory:
                      service.id === "farmart_mart"
                        ? "grocery"
                        : service.id === "bakery_sweets"
                          ? "bakery"
                          : service.id === "handmade_care"
                            ? "handmade"
                            : service.id,
                  })
                }
                activeOpacity={0.85}
              >
                <View
                  style={[styles.serviceIcon, { backgroundColor: service.bg }]}
                >
                  <Ionicons
                    name={service.icon}
                    size={20}
                    color={service.color}
                  />
                </View>
                <Text style={styles.serviceTitle} numberOfLines={2}>
                  {service.title}
                </Text>
                <Text style={styles.serviceSub} numberOfLines={1}>
                  {service.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. Trending / Latest Products (Horizontal) */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Right Now</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Catalog")}>
              <Text style={styles.viewAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {trendingProducts.map((product) => (
              <View key={product.id} style={{ width: 142, marginRight: 12 }}>
                <ProductCard
                  product={product}
                  compact
                  onPress={() =>
                    navigation.navigate("ProductDetails", { product })
                  }
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Trust Banner */}
        <View style={styles.trustBanner}>
          <View style={styles.trustItem}>
            <Ionicons name="leaf" size={18} color="#16a34a" />
            <Text style={styles.trustText}>Farm Fresh</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="flash" size={18} color="#eab308" />
            <Text style={styles.trustText}>Superfast</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={18} color="#2563eb" />
            <Text style={styles.trustText}>Quality Assured</Text>
          </View>
        </View>

        <View style={styles.dealSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Catalog")}>
              <Text style={styles.viewAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {products.slice(4, 9).map((product) => (
              <View key={product.id} style={{ width: 142, marginRight: 12 }}>
                <ProductCard
                  product={product}
                  compact
                  onPress={() =>
                    navigation.navigate("ProductDetails", { product })
                  }
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 5. Categorized Feed: Fresh Harvest */}
        <View style={styles.sectionBlock}>
          <Text
            style={[
              styles.sectionTitle,
              { marginHorizontal: 16, marginBottom: 12 },
            ]}
          >
            🌱 Fresh From The Farm
          </Text>
          <View style={styles.productGrid}>
            {freshHarvest.slice(0, 4).map((product) => (
              <View key={product.id} style={styles.gridCell}>
                <ProductCard
                  product={product}
                  compact
                  onPress={() =>
                    navigation.navigate("ProductDetails", { product })
                  }
                />
              </View>
            ))}
          </View>
        </View>

        {/* 6. Categorized Feed: Home Restro */}
        <View
          style={[
            styles.sectionBlock,
            { backgroundColor: "#fff7ed", paddingTop: 16, paddingBottom: 16 },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: "#9a3412" }]}>
              🥘 Home Chef Specials
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Catalog", {
                  initialCategory: "homerestro",
                })
              }
            >
              <Text style={[styles.viewAllText, { color: "#ea580c" }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {homeMeals.map((product) => (
              <View key={product.id} style={styles.gridCell}>
                <ProductCard
                  product={product}
                  compact
                  onPress={() =>
                    navigation.navigate("ProductDetails", { product })
                  }
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  headerArea: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliverToText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    padding: 0,
  },
  micWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  categoriesContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    gap: 12,
  },
  catBubble: {
    alignItems: "center",
    width: 55,
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  catLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    lineHeight: 12,
  },
  bannerSlider: {
    paddingLeft: 16,
    paddingRight: 4,
    marginBottom: 20,
  },
  heroBanner: {
    width: width - 32,
    height: 142,
    marginRight: 12,
  },
  heroOverlay: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: "flex-end",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#e2e8f0",
  },
  sectionBlock: {
    marginBottom: 24,
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: -12,
    marginBottom: 12,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  bannerDotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  serviceSection: {
    marginBottom: 22,
  },
  serviceScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  serviceCard: {
    width: 132,
    minHeight: 116,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 15,
    color: "#0f172a",
  },
  serviceSub: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 4,
  },
  dealSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  horizontalScroll: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  trustDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#cbd5e1",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    gap: CARD_GAP,
  },
  gridCell: {
    width: CARD_WIDTH,
    marginBottom: CARD_GAP,
  },
});
