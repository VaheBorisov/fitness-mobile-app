import { Tabs } from "expo-router";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Image } from "react-native";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          headerShown: false,
          title: "Exercises",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="book" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          headerShown: false,
          title: "Workout",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="circle-with-plus" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="active-workout"
        options={{
          headerShown: false,
          title: "Active Workout",
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          headerShown: false,
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clock-circle" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          // tabBarIcon: ({ color, size }) => (
          //   <Image
          //     source={user?.imageUrl ?? user?.externalAccounts[0]?.imageUrl}
          //     className="rounded-full"
          //     style={{ width: 28, height: 28, borderRadius: 100 }}
          //   />
          // )
        }}
      />
    </Tabs>
  );
}
