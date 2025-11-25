import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import {Ionicons} from "@expo/vector-icons";
import COLORS from "../constants/colors";

export default function LogoutButton() {
    const { logout } = useAuthStore();

    const confirmLogout = () => {
        Alert.alert("Esci", "Sei sicuro di voler uscire?", [
            {text: "Cancella", style:"cancel"},
            {text: "Esci", onPress: () => logout(), style: "destructive"},
        ]);
    };
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
      <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
      <Text style={styles.logoutText}>Esci</Text>
    </TouchableOpacity>
  )
}