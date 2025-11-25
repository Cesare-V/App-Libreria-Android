import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {useAuthStore} from "../../store/authStore";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_URL } from "../../constants/api";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null); //Per visualizzare l'immagine selezionata
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const {token} = useAuthStore();

  const pickImage = async () => {
    try {
      // richiesta del permesso se necessario
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Autorizzazione negata", "Abbiamo bisogno dei permessi della galleria per caricare un'immagine.");
          return;
        }
      }

      // avvia la libreria di immagini
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4,3],
        quality: 0.5, // qualità inferiore per base64 più piccola
        base64: true,
      });

      if(!result.canceled) {
        setImage(result.assets[0].uri);

        // se è fornito base64, utilizzarlo
        if(result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          //altrimenti, converti in base64
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Errore nel prendere l'immagine:", error)
      Alert.alert("Errore", "Si è verificato un problema durante la selezione dell'immagine.");
    }
  };
  
  const handleSubmit = async () => {
    if(!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Errore", "Per favore compila tutti i campi");
      return;
    }
    try {
      setLoading(true);

      // ottenere l'estensione del file dall'URI o impostare come predefinita jpeg
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length -1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
      
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      console.log("Token inviato:", token);
      const response = await fetch(`${API_URL}/books`, {
        method:"POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
        }),
      });

      const data = await response.json();
      if(!response.ok) throw new Error(data.message || "Qualcosa è andato storto");
      
      Alert.alert("Ottimo", "Il tuo consiglio sul libro è stato pubblicato.");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.error("Errore nel creare il post", error);
      Alert.alert("Errore", error.message || "Qualcosa è andato storto");
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for(let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons
          name={i <= rating ? "star" : "star-outline"}
          size={32}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "android" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Aggiungi un libro consigliato</Text>
            <Text style={styles.subtitle}>Condividi il tuo libro preferito con altre persone</Text>
          </View>

          <View style={styles.form}>
            {/* TITOLO LIBRO */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Titolo del libro</Text>
              <View style={styles.inputContainer}>
                <Ionicons 
                name= "book-outline"
                size= {20}
                color= {COLORS.textSecondary}
                style= {styles.inputIcon}
                />
                <TextInput
                style={styles.input}
                placeholder="Inserisci il titolo del libro"
                placeholderTextColor={COLORS.placeholderText}
                value={title}
                onChangeText={setTitle}
                />
              </View>
            </View>

            {/* RATING ( 5 STELLE) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>La tua valutazione</Text>
              {renderRatingPicker()}
            </View>

            {/* IMAGE (IMMAGINI) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Immagine del libro</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{uri: image}} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="image-outline" size={40} color={COLORS.textSecondary}/>
                    <Text style={styles.placeholderText}>Tocca per selezionare l'immagine</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {/* DESCRIZIONE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrizione</Text>
              <TextInput
              style={styles.textArea}
              placeholder="Scrivi la tua recensione o i tuoi pensieri su questo libro..."
              placeholderTextColor={COLORS.placeholderText}
              value= {caption}
              onChangeText={setCaption}
              multiline
              />
            </View>
            
            {/* PULSANTE SUBMIT */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                <Ionicons 
                name= "cloud-upload-outline"
                size={20}
                color={COLORS.white}
                style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Condividi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}