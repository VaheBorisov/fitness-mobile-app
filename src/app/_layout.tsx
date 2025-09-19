import { Slot } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo';

import "../global.css";

export default function Layout() {
  return (
   <ClerkProvider>
     <Slot />
   </ClerkProvider>
  );
}
