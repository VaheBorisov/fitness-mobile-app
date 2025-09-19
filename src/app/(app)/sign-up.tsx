import { useState } from "react";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex flex-1"
        >
          <View className="flex-1 px-6">
            {/* Main */}

            <View className="flex-1 justify-center">
              {/* Logo/Branding */}
              <View className="items-center mb-8">
                <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                  <Ionicons name="mail" size={40} color="#ffffff" />
                </View>
                <Text className="text-3xl font-bold text-gray-600 mb-2">
                  Check Your Email
                </Text>
                <Text className="text-lg text-gray-600 text-center">
                  We&#39;ve sent a verification code to{"\n"}
                  {emailAddress}
                </Text>
              </View>

              {/* Verification form */}
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Enter Verification Code
                </Text>

                {/* Code Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                    <Ionicons name="key-outline" size={20} color="6B7280" />
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-3 text-gray-900 text-center text-lg tracking-widest"
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  onPress={onVerifyPress}
                  disabled={isLoading}
                  className={clsx(
                    "rounded-xl py-4 shadow-sm mb-4",
                    isLoading ? "bg-gray-400" : "bg-green-600",
                  )}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons
                      name={isLoading ? "refresh" : "checkmark-circle-outline"}
                      size={20}
                      color="#ffffff"
                    />
                    <Text className="ml-2 text-white font-semibold text-lg">
                      {isLoading ? "Verifying..." : "Verify Email"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Resend Code */}
                <TouchableOpacity className="py-2">
                  <Text className="text-blue-600 font-medium text-center">
                    Didn&#39;t receive the code? Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="pb-6">
              <Text className="text-center text-gray-500 text-sm">
                Almost there! Just one more step
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex flex-1"
      >
        <View className="flex-1 px-6">
          {/* Main */}

          <View className="flex-1 justify-center">
            {/* Logo/Branding */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                <Ionicons name="fitness" size={40} color="#ffffff" />
              </View>
              <Text className="text-3xl font-bold text-gray-600 mb-2">
                Join FitTracker
              </Text>
              <Text className="text-lg text-gray-600 text-center">
                Start your fitness journey {"\n"}and achieve your goals
              </Text>
            </View>

            {/* Sign Up form */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Create Your Account
              </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <Ionicons name="mail-outline" size={20} color="6B7280" />
                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={setEmailAddress}
                    className="flex-1 ml-3 text-gray-900"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="6B7280"
                  />
                  <TextInput
                    autoCapitalize="none"
                    value={password}
                    secureTextEntry
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={setPassword}
                    className="flex-1 ml-3 text-gray-900"
                    editable={!isLoading}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </Text>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={isLoading}
                className={clsx(
                  "rounded-xl py-4 shadow-sm mb-4",
                  isLoading ? "bg-gray-400" : "bg-blue-600",
                )}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons
                    name={isLoading ? "refresh" : "person-add-outline"}
                    size={20}
                    color="#ffffff"
                  />
                  <Text className="ml-2 text-white font-semibold text-lg">
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Terms */}
              <Text className="text-xs text-gray-500 text-center mb-4">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </Text>

              {/* Sign Ip Link */}
              <View className="flex-row items-center justify-center mt-4">
                <Text className="text-gray-600">Already have an account? </Text>
                <Link href="/sign-in" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-semibold">Sing In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>

          {/* Footer Section */}
          <View className="pb-6">
            <Text className="text-center text-gray-500 text-sm">
              Ready to start your fitness journey today?
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
