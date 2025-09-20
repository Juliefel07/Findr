import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import myAvatar from "../../assets/images/user.png"; // Local fallback image
import { auth } from "../../firebase/config";

const { width, height } = Dimensions.get("window");

export default function Profile() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [imageUri, setImageUri] = useState(null); // <-- for picked image

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (u?.displayName) {
        setNewName(u.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authReady && !user) {
      router.replace("/auth/SignIn"); // Redirect if not logged in
    }
  }, [authReady, user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/auth/SignIn");
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      Alert.alert("Invalid", "Name cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      await updateProfile(auth.currentUser, {
        displayName: newName.trim(),
      });
      Alert.alert("Success", "Username updated.");
      setEditing(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewName(user?.displayName || "");
    setEditing(false);
  };

  // New: Pick Image from file explorer
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImageUri(selectedUri);

      // TODO: Upload image to Firebase Storage and update profile photoURL if needed
    }
  };

  // Content rendering based on activeSection
  const renderContent = () => {
    if (!activeSection) {
      // Main menu
      return (
        <>
          <TouchableOpacity style={styles.card} onPress={() => setActiveSection("myProfile")}>
            <Text style={styles.label}>My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setActiveSection("settings")}>
            <Text style={styles.label}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setActiveSection("archive")}>
            <Text style={styles.label}>Archive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setActiveSection("deleted")}>
            <Text style={styles.label}>Deleted</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setActiveSection("aboutApp")}>
            <Text style={styles.label}>About App</Text>
          </TouchableOpacity>
        </>
      );
    }

    // Sections with back arrow
    const commonHeader = (
      <TouchableOpacity style={styles.backButton} onPress={() => setActiveSection(null)}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
    );

    switch (activeSection) {
      case "myProfile":
        return (
          <View style={styles.sectionContainer}>
            {commonHeader}
            <Text style={styles.sectionTitle}>My Profile</Text>
            <Text style={styles.sectionText}>Name: {user?.displayName || "N/A"}</Text>
            <Text style={styles.sectionText}>Email: {user?.email || "N/A"}</Text>
          </View>
        );
      case "settings":
        return (
          <View style={styles.sectionContainer}>
            {commonHeader}
            <Text style={styles.sectionTitle}>Settings</Text>
            <Text style={styles.sectionText}>This is your settings page.</Text>
          </View>
        );
      case "archive":
        return (
          <View style={styles.sectionContainer}>
            {commonHeader}
            <Text style={styles.sectionTitle}>Archive</Text>
            <Text style={styles.sectionText}>Archived content goes here.</Text>
          </View>
        );
      case "deleted":
        return (
          <View style={styles.sectionContainer}>
            {commonHeader}
            <Text style={styles.sectionTitle}>Deleted</Text>
            <Text style={styles.sectionText}>Deleted items content goes here.</Text>
          </View>
        );
      case "aboutApp":
        return (
          <View style={styles.sectionContainer}>
            {commonHeader}
            <Text style={styles.sectionTitle}>About App</Text>
            <Text style={styles.sectionText}>
              This app is developed for travel journeys and much more.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={["#031630ff", "#4375a7ff", "#829dc0ff"]} style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                imageUri
                  ? { uri: imageUri }
                  : user?.photoURL
                  ? { uri: user.photoURL }
                  : myAvatar
              }
              style={styles.avatar}
            />
          </View>

          {/* New Image Pick Button */}
          <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
            <Ionicons name="image" size={28} color="white" />
            <Text style={styles.pickImageText}>Change Photo</Text>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.displayName || "Your Name"}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Ionicons name="pencil" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {renderContent()}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Editing Username Overlay */}
        {editing && (
          <View style={styles.overlay}>
            <View style={styles.floatingWrapper}>
              <Text style={styles.editLabel}>Edit Username</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40,
    position: "relative",
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    borderWidth: 8,
    borderColor: "white",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
    resizeMode: "cover",
    transform: [{ scale: 2.0 }],
  },
  pickImageBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#141788ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pickImageText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
  editBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#00000050",
    padding: 6,
    borderRadius: 20,
  },
  card: {
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 5,
    borderColor: "#102b5450",
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  logoutBtn: {
    backgroundColor: "#141788ff",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  // Overlay Styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingWrapper: {
    backgroundColor: "transparent",
    width: "50%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderColor: "blue",
  },
  editLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#100e84ff",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "600",
  },
  backButton: {
    marginBottom: 15,
  },
  sectionContainer: {
    backgroundColor: "transparent",
    padding: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  sectionText: {
    fontSize: 16,
    color: "white",
  },
});
